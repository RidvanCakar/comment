import os
import sys
import json
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

# Modüllerin doğrudan içe aktarılabilmesi için proje dizinini sys.path'e ekliyoruz
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from database import (
    init_db,
    get_db,
    get_cached_analysis,
    save_analysis,
    save_channel_analysis,
    get_latest_channel_analysis,
)
from youtube_service import (
    extract_video_id,
    fetch_video_info,
    fetch_comment_records,
    get_channel_latest_videos,
    resolve_channel_id,
)
from gemini_service import analyze_comments, analyze_channel_insights
from comment_insights import enrich_analysis_with_comment_insights, topic_example_limit
from auth import admin_router, auth_router, users_router
from feedback import feedback_router, admin_feedback_router
from config import settings
from credits import (
    assert_can_analyze,
    assert_can_analyze_channel,
    charge_user_for_channel_analysis,
    consume_analysis,
    get_optional_user,
    get_or_create_guest,
    promote_initial_admin,
    quota_snapshot,
    CHANNEL_ANALYSIS_CREDIT_COST,
)

# .env dosyasından çevre değişkenlerini yüklüyoruz
load_dotenv(os.path.join(BASE_DIR, ".env"))

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# API Anahtarlarının kontrolü
if not YOUTUBE_API_KEY or not GEMINI_API_KEY:
    print("\n" + "="*80)
    print("UYARI: YOUTUBE_API_KEY veya GEMINI_API_KEY .env dosyasında eksik!")
    print("Lütfen 'backend/.env' dosyasını oluşturup API anahtarlarını girin.")
    print("="*80 + "\n")

# Kota ve maliyet sınırlandırması için sabit yorum sayısı
MAX_COMMENTS = 1500

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    from database import SessionLocal

    with SessionLocal() as db:
        promote_initial_admin(db)
    yield

app = FastAPI(
    title="YouTube Yorum Analiz Platformu API",
    description="YouTube yorumlarını Gemini 2.5 Flash ile analiz eden FastAPI servisi.",
    version="1.0.0",
    lifespan=lifespan
)

# Tarayıcı istekleri yalnızca açıkça yapılandırılan frontend origin'lerinden kabul edilir.
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.frontend_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def browser_security(request: Request, call_next):
    origin = request.headers.get("origin")
    if (
        request.method.upper() not in {"GET", "HEAD", "OPTIONS"}
        and origin
        and origin.rstrip("/") not in settings.frontend_origins
    ):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "İstek kaynağına izin verilmiyor."},
        )
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000"
    return response


class AnalyzeRequest(BaseModel):
    video_url: str = Field(min_length=1, max_length=2048)
    force_refresh: bool = False

    @field_validator("video_url")
    @classmethod
    def clean_video_url(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Video adresi boş olamaz.")
        return cleaned


class ChannelAnalyzeRequest(BaseModel):
    channel_url: str = Field(min_length=1, max_length=2048)
    video_limit: int = Field(default=5, ge=1, le=10)
    force_refresh: bool = False

    @field_validator("channel_url")
    @classmethod
    def clean_channel_url(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Kanal linki veya kullanıcı adı boş olamaz.")
        return cleaned



def _json_datetime(value: datetime | None):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def _analysis_payload(
    *,
    video_id: str,
    video_title: str,
    channel_title: str,
    comment_count_analyzed: int,
    created_at: datetime | None,
    analysis: dict,
    cached: bool,
    user,
    guest,
) -> dict:
    return {
        "video_id": video_id,
        "video_title": video_title,
        "channel_title": channel_title,
        "comment_count_analyzed": comment_count_analyzed,
        "created_at": _json_datetime(created_at),
        "analysis": analysis,
        "cached": cached,
        "quota": quota_snapshot(user, guest),
    }


app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(feedback_router)
app.include_router(admin_feedback_router)


@app.get("/credits/quota")
def credits_quota(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    user = get_optional_user(request, db)
    guest = None if user else get_or_create_guest(request, response, db)
    return quota_snapshot(user, guest)


@app.get("/")
def health_check():
    """Uygulamanın durumunu kontrol eden basit endpoint."""
    return {"status": "ok", "app": "YouTube Yorum Analiz Platformu"}

@app.post("/analyze")
def analyze(
    request: Request,
    response: Response,
    body: AnalyzeRequest,
    db: Session = Depends(get_db),
):
    """
    Belirtilen YouTube videosunun yorumlarını analiz eder.
    Öncelikle veritabanı cache kontrolü yapar.
    """
    # API Anahtarları kontrolü
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY.startswith("YOUR_"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sistem yapılandırma hatası: YouTube API anahtarı geçerli değil veya eksik."
        )
    if not GEMINI_API_KEY or GEMINI_API_KEY.startswith("YOUR_"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sistem yapılandırma hatası: Gemini API anahtarı geçerli değil veya eksik."
        )

    user = get_optional_user(request, db)
    guest = None if user else get_or_create_guest(request, response, db)

    # 1. Video ID'sini URL'den çıkar
    try:
        video_id = extract_video_id(body.video_url)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    cache_hit = False
    # 2. force_refresh False ise Önbelleğe (cache) bak
    if not body.force_refresh:
        cached = get_cached_analysis(db, video_id)
        if cached:
            cache_hit = True
            assert_can_analyze(
                user,
                guest,
                from_cache=True,
                force_refresh=False,
            )
            try:
                analysis_data = json.loads(cached.analysis_json)
                try:
                    comment_records = fetch_comment_records(
                        YOUTUBE_API_KEY,
                        video_id,
                        MAX_COMMENTS,
                    )
                    analysis_data = enrich_analysis_with_comment_insights(
                        analysis_data,
                        comment_records,
                    )
                    save_analysis(
                        db=db,
                        video_id=cached.video_id,
                        video_title=cached.video_title,
                        channel_title=cached.channel_title,
                        analysis_json=json.dumps(analysis_data, ensure_ascii=False),
                        comment_count_analyzed=cached.comment_count_analyzed,
                        raw_comments_json=cached.raw_comments_json or "[]",
                    )
                except Exception as hydrate_error:
                    print(
                        "UYARI: Önbellek yorum meta verisi güncellenemedi: "
                        f"{hydrate_error}"
                    )
                consume_analysis(
                    db,
                    user,
                    guest,
                    video_id=video_id,
                    from_cache=True,
                    force_refresh=False,
                )
                if user:
                    db.refresh(user)
                if guest:
                    db.refresh(guest)
                return _analysis_payload(
                    video_id=cached.video_id,
                    video_title=cached.video_title,
                    channel_title=cached.channel_title,
                    comment_count_analyzed=cached.comment_count_analyzed,
                    created_at=cached.created_at,
                    analysis=analysis_data,
                    cached=True,
                    user=user,
                    guest=guest,
                )
            except json.JSONDecodeError:
                cache_hit = False

    assert_can_analyze(
        user,
        guest,
        from_cache=False,
        force_refresh=body.force_refresh,
    )

    # 3. Önbellekte yoksa veya force_refresh True ise: YouTube'dan verileri çek
    # 3a. Video genel bilgilerini çek
    try:
        video_info = fetch_video_info(YOUTUBE_API_KEY, video_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e)
        )

    # 3b. Yorumları çek (max 1500 yorum)
    try:
        comment_records = fetch_comment_records(YOUTUBE_API_KEY, video_id, MAX_COMMENTS)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e)
        )

    comment_texts = [item["text"] for item in comment_records]
    example_limit = topic_example_limit(len(comment_records))

    # 4. Yorumları Gemini ile analiz et
    try:
        analysis_result = analyze_comments(GEMINI_API_KEY, comment_texts)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Yapay Zeka Analiz Hatası (JSON parsing): {str(e)}"
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Yapay Zeka Servis Hatası (Gemini): {str(e)}"
        )

    # 4b. ID'leri gerçek yorum metinleriyle eşleştir
    referenced_comment_indices = set()
    for topic in analysis_result.get("topics", []):
        example_ids = topic.get("example_comment_ids", [])
        example_comments = []
        if isinstance(example_ids, list):
            example_ids = example_ids[:example_limit]
            for c_id in example_ids:
                try:
                    idx = int(c_id)
                    if 0 <= idx < len(comment_records):
                        referenced_comment_indices.add(idx)
                        comment_text = comment_records[idx]["text"].strip()
                        if comment_text and comment_text not in example_comments:
                            example_comments.append(comment_text)
                except (ValueError, TypeError):
                    continue

        topic["example_comments"] = example_comments
        topic.pop("example_comment_ids", None)

    analysis_result = enrich_analysis_with_comment_insights(
        analysis_result,
        comment_records,
    )

    filtered_comments = [comment_records[i]["text"] for i in sorted(referenced_comment_indices)]

    # 5. Sonuçları önbelleğe kaydet
    try:
        cached_record = save_analysis(
            db=db,
            video_id=video_id,
            video_title=video_info["title"],
            channel_title=video_info["channel_title"],
            analysis_json=json.dumps(analysis_result, ensure_ascii=False),
            comment_count_analyzed=len(comment_records),
            raw_comments_json=json.dumps(filtered_comments, ensure_ascii=False)
        )
        created_at = cached_record.created_at
    except Exception as e:
        print(f"UYARI: Sonuç veritabanına önbelleğe alınamadı: {str(e)}")
        created_at = None

    consume_analysis(
        db,
        user,
        guest,
        video_id=video_id,
        from_cache=False,
        force_refresh=body.force_refresh,
    )
    if user:
        db.refresh(user)
    if guest:
        db.refresh(guest)

    return _analysis_payload(
        video_id=video_id,
        video_title=video_info["title"],
        channel_title=video_info["channel_title"],
        comment_count_analyzed=len(comment_records),
        created_at=created_at,
        analysis=analysis_result,
        cached=False,
        user=user,
        guest=guest,
    )


@app.post("/analyze/channel")
async def analyze_channel(
    request: Request,
    response: Response,
    body: ChannelAnalyzeRequest,
    db: Session = Depends(get_db),
):
    """
    Belirtilen YouTube kanalının son videolarını toplu analiz eder ve kanal geneli sentez raporu üretir.
    Maliyet: 3 Analiz Kredisi.
    """
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY.startswith("YOUR_"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sistem yapılandırma hatası: YouTube API anahtarı geçerli değil veya eksik."
        )
    if not GEMINI_API_KEY or GEMINI_API_KEY.startswith("YOUR_"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sistem yapılandırma hatası: Gemini API anahtarı geçerli değil veya eksik."
        )

    user = get_optional_user(request, db)
    guest = None if user else get_or_create_guest(request, response, db)

    # 1. Kredi ve yetki kontrolü
    assert_can_analyze_channel(user, guest)

    # 2. Kanalın son videolarını çek
    try:
        latest_videos = get_channel_latest_videos(
            channel_url_or_id=body.channel_url,
            limit=body.video_limit,
            api_key=YOUTUBE_API_KEY,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        )

    if not latest_videos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kanalda analiz edilecek video bulunamadı veya kanal gizli.",
        )

    # 3. Her videonun tekil analizini paralel olarak yap veya önbellekten al
    def _analyze_single_video_sync(v: dict) -> dict:
        vid_id = v["video_id"]
        cached_record = None if body.force_refresh else get_cached_analysis(db, vid_id)

        if cached_record:
            try:
                v_analysis = json.loads(cached_record.analysis_json)
                return {
                    "video_id": cached_record.video_id,
                    "title": cached_record.video_title,
                    "channel_title": cached_record.channel_title,
                    "published_at": v.get("published_at", ""),
                    "thumbnail_url": v.get("thumbnail_url", ""),
                    "comment_count_analyzed": cached_record.comment_count_analyzed,
                    "analysis": v_analysis,
                    "cached": True,
                }
            except Exception:
                pass

        # Önbellekte yoksa yorumları çekip analiz et
        try:
            c_records = fetch_comment_records(YOUTUBE_API_KEY, vid_id, MAX_COMMENTS)
        except Exception:
            c_records = []

        c_texts = [item["text"] for item in c_records]
        example_limit = topic_example_limit(len(c_records))

        try:
            v_analysis = analyze_comments(GEMINI_API_KEY, c_texts)
            # Yorum ID eşleştirmeleri
            for topic in v_analysis.get("topics", []):
                example_ids = topic.get("example_comment_ids", [])
                example_comments = []
                if isinstance(example_ids, list):
                    for c_id in example_ids[:example_limit]:
                        try:
                            idx = int(c_id)
                            if 0 <= idx < len(c_records):
                                text_val = c_records[idx]["text"].strip()
                                if text_val and text_val not in example_comments:
                                    example_comments.append(text_val)
                        except (ValueError, TypeError):
                            continue
                topic["example_comments"] = example_comments
                topic.pop("example_comment_ids", None)

            v_analysis = enrich_analysis_with_comment_insights(v_analysis, c_records)
        except Exception as err:
            v_analysis = {
                "sentiment_distribution": {
                    "positive_percent": 0,
                    "negative_percent": 0,
                    "neutral_percent": 100,
                },
                "topics": [],
                "overall_summary": f"Video analizi yapılamadı: {str(err)}",
                "top_recommendation": {
                    "insight": "Yorum verisi yetersiz",
                    "action": "Video yorumlarını kontrol edin.",
                    "expected_impact": "",
                },
            }

        try:
            save_analysis(
                db=db,
                video_id=vid_id,
                video_title=v["title"],
                channel_title=v.get("channel_title", ""),
                analysis_json=json.dumps(v_analysis, ensure_ascii=False),
                comment_count_analyzed=len(c_records),
                raw_comments_json="[]",
            )
        except Exception as save_err:
            print(f"UYARI: Video önbelleğe kaydedilemedi ({vid_id}): {save_err}")

        return {
            "video_id": vid_id,
            "title": v["title"],
            "channel_title": v.get("channel_title", ""),
            "published_at": v.get("published_at", ""),
            "thumbnail_url": v.get("thumbnail_url", ""),
            "comment_count_analyzed": len(c_records),
            "analysis": v_analysis,
            "cached": False,
        }

    tasks = [asyncio.to_thread(_analyze_single_video_sync, v) for v in latest_videos]
    video_reports = list(await asyncio.gather(*tasks))

    # 4. 5 videonun özetlerini Gemini ile kanal sentezine dönüştür
    try:
        channel_report = await analyze_channel_insights(video_reports, api_key=GEMINI_API_KEY)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kanal sentez analizi sırasında yapay zeka hatası oluştu: {str(err)}",
        )

    # 5. Kredi düşümü
    charge_user_for_channel_analysis(db, user, guest)
    if user:
        db.refresh(user)
    if guest:
        db.refresh(guest)

    # 6. Kanal sentezini veritabanına kaydet
    channel_id = latest_videos[0].get("channel_id") or "UNKNOWN"
    channel_title = channel_report.get("channel_title") or latest_videos[0].get("channel_title") or "YouTube Kanalı"
    analyzed_ids = [v["video_id"] for v in latest_videos]

    saved_channel = save_channel_analysis(
        db=db,
        channel_id=channel_id,
        channel_title=channel_title,
        video_count=len(latest_videos),
        analyzed_video_ids=analyzed_ids,
        channel_report=channel_report,
        user_id=user.id if user else None,
    )

    return {
        "channel_id": channel_id,
        "channel_title": channel_title,
        "video_count": len(latest_videos),
        "created_at": _json_datetime(saved_channel.created_at),
        "channel_report": channel_report,
        "analyzed_videos": video_reports,
        "quota": quota_snapshot(user, guest),
    }


if __name__ == "__main__":
    import uvicorn
    # Doğrudan python main.py olarak çalıştırıldığında uvicorn başlasın
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


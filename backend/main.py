import os
import sys
import json
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Modüllerin doğrudan içe aktarılabilmesi için proje dizinini sys.path'e ekliyoruz
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from database import init_db, get_db, get_cached_analysis, save_analysis
from youtube_service import extract_video_id, fetch_video_info, fetch_comments
from gemini_service import analyze_comments

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
    # Uygulama başlarken SQLite veritabanı tablolarını oluşturuyoruz
    init_db()
    yield

app = FastAPI(
    title="YouTube Yorum Analiz Platformu API",
    description="YouTube yorumlarını Gemini 2.5 Flash ile analiz eden FastAPI servisi.",
    version="1.0.0",
    lifespan=lifespan
)

# Yerel geliştirme (localhost) için CORS izinleri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    video_url: str
    force_refresh: bool = False

@app.get("/")
def health_check():
    """Uygulamanın durumunu kontrol eden basit endpoint."""
    return {"status": "ok", "app": "YouTube Yorum Analiz Platformu"}

@app.post("/analyze")
def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):
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

    # 1. Video ID'sini URL'den çıkar
    try:
        video_id = extract_video_id(request.video_url)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # 2. force_refresh False ise Önbelleğe (cache) bak
    if not request.force_refresh:
        cached = get_cached_analysis(db, video_id)
        if cached:
            try:
                analysis_data = json.loads(cached.analysis_json)
                return {
                    "video_id": cached.video_id,
                    "video_title": cached.video_title,
                    "channel_title": cached.channel_title,
                    "comment_count_analyzed": cached.comment_count_analyzed,
                    "created_at": cached.created_at,
                    "analysis": analysis_data,
                    "cached": True
                }
            except json.JSONDecodeError:
                # Önbellekteki veri bozuksa es geçip yeniden analiz et
                pass

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

    # 3b. Yorumları çek (max 300 yorum)
    try:
        comments = fetch_comments(YOUTUBE_API_KEY, video_id, MAX_COMMENTS)
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

    # 4. Yorumları Gemini ile analiz et
    try:
        analysis_result = analyze_comments(GEMINI_API_KEY, comments)
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

    # 4b. ID'leri gerçek yorum metinleriyle eşleştir ve veritabanına kaydedilecek yorumları filtrele
    referenced_comment_indices = set()
    for topic in analysis_result.get("topics", []):
        example_ids = topic.get("example_comment_ids", [])
        example_comments = []
        if isinstance(example_ids, list):
            example_ids = example_ids[:5]  # Kategori başına en fazla 5 örnek ile sınırla
            for c_id in example_ids:
                try:
                    idx = int(c_id)
                    if 0 <= idx < len(comments):
                        referenced_comment_indices.add(idx)
                        comment_text = comments[idx].strip()
                        # Tekrarlı veya boş yorumları filtrele
                        if comment_text and comment_text not in example_comments:
                            example_comments.append(comment_text)
                except (ValueError, TypeError):
                    continue
        
        topic["example_comments"] = example_comments
        # example_comment_ids'i ham haliyle dışarı sızdırmıyoruz
        topic.pop("example_comment_ids", None)

    # Veritabanına yazmadan önce sadece Gemini'nin referans verdiği yorumları filtrele
    filtered_comments = [comments[i] for i in sorted(referenced_comment_indices)]

    # 5. Sonuçları önbelleğe kaydet
    try:
        cached_record = save_analysis(
            db=db,
            video_id=video_id,
            video_title=video_info["title"],
            channel_title=video_info["channel_title"],
            analysis_json=json.dumps(analysis_result, ensure_ascii=False),
            comment_count_analyzed=len(comments),
            raw_comments_json=json.dumps(filtered_comments, ensure_ascii=False)
        )
        created_at = cached_record.created_at
    except Exception as e:
        print(f"UYARI: Sonuç veritabanına önbelleğe alınamadı: {str(e)}")
        created_at = None

    return {
        "video_id": video_id,
        "video_title": video_info["title"],
        "channel_title": video_info["channel_title"],
        "comment_count_analyzed": len(comments),
        "created_at": created_at,
        "analysis": analysis_result,
        "cached": False
    }

if __name__ == "__main__":
    import uvicorn
    # Doğrudan python main.py olarak çalıştırıldığında uvicorn başlasın
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

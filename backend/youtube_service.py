import re
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def extract_video_id(url: str) -> str:
    """
    Farklı YouTube URL formatlarından video ID'sini ayıklar.
    Desteklenen formatlar:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/shorts/VIDEO_ID
    - https://youtube.com/shorts/VIDEO_ID?feature=share
    - vb.
    """
    # 11 karakterli YouTube video ID desenini arayan regex
    regex = r'(?:v=|\/shorts\/|\/embed\/|\/v\/|youtu\.be\/|\/watch\?v%3D|\/watch\?feature=player_embedded&v=|[?&]v=)([a-zA-Z0-9_-]{11})'
    
    match = re.search(regex, url)
    if match:
        return match.group(1)
    
    # Doğrudan 11 karakterlik ID verilmişse kontrol et
    clean_url = url.strip()
    if len(clean_url) == 11 and re.match(r'^[a-zA-Z0-9_-]{11}$', clean_url):
        return clean_url
        
    raise ValueError("Geçersiz YouTube video linki veya video ID'si.")

def fetch_video_info(api_key: str, video_id: str) -> dict:
    """
    Videonun başlığını, kanal adını ve toplam yorum sayısını çeker.
    """
    if not api_key:
        raise ValueError("YouTube API anahtarı eksik.")
        
    try:
        youtube = build('youtube', 'v3', developerKey=api_key)
        request = youtube.videos().list(
            part="snippet,statistics",
            id=video_id
        )
        response = request.execute()
        
        if not response.get('items'):
            raise ValueError("Belirtilen video bulunamadı. Video silinmiş veya gizli olabilir.")
            
        item = response['items'][0]
        snippet = item['snippet']
        stats = item['statistics']
        
        return {
            "title": snippet.get("title", "Bilinmeyen Video"),
            "channel_title": snippet.get("channelTitle", "Bilinmeyen Kanal"),
            "comment_count": int(stats.get("commentCount", 0))
        }
    except HttpError as e:
        # HTTP hata kodlarına göre özel mesajlar
        status_code = e.resp.status if hasattr(e, 'resp') else 500
        if status_code == 400:
            raise RuntimeError("API isteği geçersiz. API key ayarlarını kontrol edin.")
        raise RuntimeError(f"YouTube API Hatası (Kod: {status_code}): {e.reason}")
    except Exception as e:
        if "API key" in str(e):
            raise RuntimeError("Erişim engellendi. Geçersiz YouTube API anahtarı.")
        raise RuntimeError(f"Video bilgisi alınırken beklenmedik hata: {str(e)}")

def fetch_comment_records(
    api_key: str,
    video_id: str,
    max_comments: int,
) -> list[dict]:
    """Videonun en alakalı yorumlarını beğeni ve yanıt sayılarıyla birlikte çeker."""
    if not api_key:
        raise ValueError("YouTube API anahtarı eksik.")

    try:
        youtube = build("youtube", "v3", developerKey=api_key)
        comments: list[dict] = []
        next_page_token = None

        while len(comments) < max_comments:
            results_to_fetch = min(100, max_comments - len(comments))

            request = youtube.commentThreads().list(
                part="snippet,replies",
                videoId=video_id,
                textFormat="plainText",
                order="relevance",
                maxResults=results_to_fetch,
                pageToken=next_page_token,
            )
            response = request.execute()

            items = response.get("items", [])
            for item in items:
                top_comment = item.get("snippet", {}).get("topLevelComment", {})
                snippet = top_comment.get("snippet", {})
                text = snippet.get("textDisplay", "").strip()
                if not text:
                    continue
                author = (
                    snippet.get("authorDisplayName")
                    or snippet.get("authorChannelId", {}).get("value")
                    or "Anonim"
                )
                author = str(author).strip() or "Anonim"
                comments.append(
                    {
                        "text": text,
                        "like_count": int(snippet.get("likeCount", 0) or 0),
                        "reply_count": int(item["snippet"].get("totalReplyCount", 0) or 0),
                        "author": author,
                    }
                )

            next_page_token = response.get("nextPageToken")
            if not next_page_token or len(items) == 0:
                break

        return comments
    except HttpError as e:
        error_details = e.content.decode("utf-8") if hasattr(e, "content") else ""
        if "disabled" in error_details or "commentsDisabled" in error_details:
            raise ValueError("Bu videoda yorumlar kapatılmıştır.")
        raise RuntimeError(f"Yorumlar çekilirken YouTube API hatası oluştu: {e.reason}")
    except Exception as e:
        raise RuntimeError(f"Yorum çekme işlemi başarısız oldu: {str(e)}")


def fetch_comments(api_key: str, video_id: str, max_comments: int) -> list[str]:
    """Geriye dönük uyumluluk için yalnızca metin listesi döndürür."""
    return [item["text"] for item in fetch_comment_records(api_key, video_id, max_comments)]


def resolve_channel_id(youtube, channel_url_or_id: str) -> tuple[str, str, str]:
    """
    Kullanıcının girdiği kanal ID'si (UC...), handle (@kanaladi), video linki veya kanal URL'sinden
    (channel_id, channel_title, uploads_playlist_id) üçlüsünü çözer.
    """
    raw = channel_url_or_id.strip()
    if not raw:
        raise ValueError("Kanal bağlantısı veya kullanıcı adı boş olamaz.")

    # @https:// veya @http:// gibi baştaki hatalı @ karakterlerini temizle
    if raw.startswith("@http://") or raw.startswith("@https://"):
        raw = raw[1:]

    # 1. Video URL'si girilmişse (watch?v= veya youtu.be veya /shorts/), videonun kanalını çek
    video_id_match = re.search(
        r'(?:v=|\/shorts\/|\/embed\/|\/v\/|youtu\.be\/|\/watch\?v%3D|[?&]v=)([a-zA-Z0-9_-]{11})',
        raw,
    )
    if video_id_match:
        vid = video_id_match.group(1)
        try:
            v_resp = youtube.videos().list(part="snippet", id=vid).execute()
            v_items = v_resp.get("items", [])
            if v_items:
                found_channel_id = v_items[0]["snippet"]["channelId"]
                c_resp = youtube.channels().list(part="snippet,contentDetails", id=found_channel_id).execute()
                c_items = c_resp.get("items", [])
                if c_items:
                    snippet = c_items[0]["snippet"]
                    uploads = c_items[0]["contentDetails"]["relatedPlaylists"]["uploads"]
                    return c_items[0]["id"], snippet.get("title", ""), uploads
        except Exception:
            pass

    # 2. Doğrudan veya URL içindeki UC... (24 karakterli) Channel ID tespiti
    channel_id_match = re.search(r'(UC[a-zA-Z0-9_-]{22})', raw)
    if channel_id_match:
        target_id = channel_id_match.group(1)
        resp = youtube.channels().list(part="snippet,contentDetails", id=target_id).execute()
        items = resp.get("items", [])
        if items:
            snippet = items[0]["snippet"]
            uploads = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]
            return items[0]["id"], snippet.get("title", ""), uploads

    # 3. Handle (@ornek / youtube.com/@ornek) tespiti
    handle_match = re.search(r'(?:youtube\.com\/)?@([a-zA-Z0-9_.-]+)', raw)
    if handle_match:
        handle = handle_match.group(1)
        if handle.lower() not in ("http", "https", "www", "watch"):
            for try_handle in (handle, f"@{handle}"):
                try:
                    resp = youtube.channels().list(part="snippet,contentDetails", forHandle=try_handle).execute()
                    items = resp.get("items", [])
                    if items:
                        snippet = items[0]["snippet"]
                        uploads = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]
                        return items[0]["id"], snippet.get("title", ""), uploads
                except Exception:
                    continue

    # 4. Custom /user/username tespiti
    user_match = re.search(r'youtube\.com\/user\/([a-zA-Z0-9_-]+)', raw)
    if user_match:
        username = user_match.group(1)
        try:
            resp = youtube.channels().list(part="snippet,contentDetails", forUsername=username).execute()
            items = resp.get("items", [])
            if items:
                snippet = items[0]["snippet"]
                uploads = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]
                return items[0]["id"], snippet.get("title", ""), uploads
        except Exception:
            pass

    # 5. Fallback Arama: Handle, custom path veya kanal adı ile arama yapma
    clean_query = raw
    clean_query = re.sub(r'https?:\/\/(www\.)?youtube\.com\/(c\/|@)?', '', clean_query)
    clean_query = clean_query.split('/')[0].strip('@')

    if clean_query:
        search_resp = youtube.search().list(part="snippet", type="channel", q=clean_query, maxResults=1).execute()
        search_items = search_resp.get("items", [])
        if search_items:
            found_channel_id = search_items[0]["snippet"]["channelId"]
            resp = youtube.channels().list(part="snippet,contentDetails", id=found_channel_id).execute()
            items = resp.get("items", [])
            if items:
                snippet = items[0]["snippet"]
                uploads = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]
                return items[0]["id"], snippet.get("title", ""), uploads

    raise ValueError(f"'{channel_url_or_id}' için YouTube kanalı bulunamadı.")



def get_channel_latest_videos(
    channel_url_or_id: str,
    limit: int = 5,
    api_key: str | None = None
) -> list[dict]:
    """
    Kanalın en son yayınlanan `limit` kadar (varsayılan 5) videosunun
    video_id, title, published_at, thumbnail_url bilgilerini döndürür.
    """
    import os
    resolved_api_key = api_key or os.getenv("YOUTUBE_API_KEY")
    if not resolved_api_key:
        raise ValueError("YouTube API anahtarı eksik.")

    try:
        youtube = build("youtube", "v3", developerKey=resolved_api_key)
        channel_id, channel_title, uploads_playlist_id = resolve_channel_id(youtube, channel_url_or_id)

        # Uploads playlist üzerinden son videoları çek (1 kota birimi maliyeti)
        playlist_request = youtube.playlistItems().list(
            part="snippet",
            playlistId=uploads_playlist_id,
            maxResults=min(50, max(limit, 10))
        )
        playlist_response = playlist_request.execute()
        items = playlist_response.get("items", [])

        videos = []
        for item in items:
            snippet = item.get("snippet", {})
            vid_id = snippet.get("resourceId", {}).get("videoId")
            title = snippet.get("title", "")

            # Silinmiş veya gizli videoları atla
            if not vid_id or title in ("Private video", "Deleted video"):
                continue

            thumbnails = snippet.get("thumbnails", {})
            thumb_url = (
                thumbnails.get("maxres", {}).get("url")
                or thumbnails.get("high", {}).get("url")
                or thumbnails.get("medium", {}).get("url")
                or thumbnails.get("default", {}).get("url")
                or f"https://i.ytimg.com/vi/{vid_id}/hqdefault.jpg"
            )

            videos.append({
                "video_id": vid_id,
                "title": title,
                "published_at": snippet.get("publishedAt", ""),
                "thumbnail_url": thumb_url,
                "channel_id": channel_id,
                "channel_title": channel_title
            })

            if len(videos) >= limit:
                break

        return videos
    except HttpError as e:
        status_code = e.resp.status if hasattr(e, "resp") else 500
        raise RuntimeError(f"YouTube API Hatası (Kod: {status_code}): {e.reason}")
    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Kanal videoları alınırken hata oluştu: {str(e)}")


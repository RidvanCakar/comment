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

def fetch_comments(api_key: str, video_id: str, max_comments: int) -> list[str]:
    """
    Belirtilen videonun en alakalı (order=relevance) yorumlarını sayfalama ile çeker.
    """
    if not api_key:
        raise ValueError("YouTube API anahtarı eksik.")
        
    try:
        youtube = build('youtube', 'v3', developerKey=api_key)
        comments = []
        next_page_token = None
        
        while len(comments) < max_comments:
            results_to_fetch = min(100, max_comments - len(comments))
            
            request = youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                textFormat="plainText",
                order="relevance",
                maxResults=results_to_fetch,
                pageToken=next_page_token
            )
            response = request.execute()
            
            items = response.get('items', [])
            for item in items:
                # Top level comment metnini al
                text = item['snippet']['topLevelComment']['snippet']['textDisplay']
                if text:
                    comments.append(text)
                    
            next_page_token = response.get('nextPageToken')
            # Daha fazla sayfa yoksa veya hedefe ulaşıldıysa döngüden çık
            if not next_page_token or len(items) == 0:
                break
                
        return comments
    except HttpError as e:
        error_details = e.content.decode('utf-8') if hasattr(e, 'content') else ""
        if "disabled" in error_details or "commentsDisabled" in error_details:
            raise ValueError("Bu videoda yorumlar kapatılmıştır.")
        raise RuntimeError(f"Yorumlar çekilirken YouTube API hatası oluştu: {e.reason}")
    except Exception as e:
        raise RuntimeError(f"Yorum çekme işlemi başarısız oldu: {str(e)}")

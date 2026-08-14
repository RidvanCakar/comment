import json
import re
import time
import asyncio
import google.generativeai as genai
from typing import Dict, Any, List

from comment_insights import topic_example_range

FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-flash-latest"]


def is_junk_comment(comment: str) -> bool:
    """Tek kelimelik, anlamsız, sadece emoji veya spam yorumları ayıklar."""
    if not comment or not isinstance(comment, str):
        return True
    text = comment.strip()
    if not text:
        return True

    # Alfanümerik karakter sayısı kontrolü (en az 2 harf/rakam olmalı)
    alphanumeric_count = sum(1 for c in text if c.isalnum())
    if alphanumeric_count < 2:
        return True

    # Çok kısa tek kelimelik veya selam/selamlama spam'leri
    words = text.split()
    if len(words) == 1:
        low = text.lower()
        if len(text) <= 4 or low in {
            "sa", "as", "ok", "ilk", "first", "hi", "hey", "merhaba", "selam",
            "1", "2", "3", "abi", "kral", "reis", "adamsın", "kalp", "like"
        }:
            return True

    # Gülüş spam'leri (örn: hahahaha, ahahah, sjsjsj, ksksks, lolololo)
    low_no_space = re.sub(r"\s+", "", text.lower())
    if re.fullmatch(r"^(?:ha|he|hi|ho|ah|ja|lol|kik|sjsj|ksks|pff|puha)+$", low_no_space):
        return True

    # Çok az benzersiz harf içeren anlamsız uzun spam (örn: aaaaaa, hahahaha, kkkkk)
    unique_letters = set(c for c in low_no_space if c.isalpha())
    if len(low_no_space) >= 5 and len(unique_letters) <= 2:
        return True

    # Tekrarlayan tek harf/klavye spam'leri (örn: asdfghjk)
    if re.fullmatch(r"^[asdfghjklşiouüçömnbvcxzqwerty]{5,}$", low_no_space):
        vowels = sum(1 for c in low_no_space if c in "aeıioöuü")
        if vowels == 0 or (len(low_no_space) > 8 and vowels < 2):
            return True

    return False


def score_comment_richness(comment: str) -> float:
    """
    Yorumun içerik derinliğini, soru, eleştiri, zaman damgası ve öneri barındırma derecesini puanlar.
    """
    text = comment.strip()
    score = 0.0
    lowered = text.lower()

    # Uzunluk katkısı (20-400 karakter arası detaylı açıklamalar değerlidir)
    length = len(text)
    if length >= 25:
        score += min(45.0, length / 6.0)

    # Zaman damgası / Timestamp referansı (örn: 01:23, 12:45, 1:05:20)
    if re.search(r"\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b", text):
        score += 35.0

    # Soru ve merak ifadeleri
    if "?" in text or re.search(r"\b(neden|nasıl|ne zaman|nerede|kim|hangisi|acaba|mı|mi|mu|mü)\b", lowered):
        score += 20.0

    # Eleştiri, tavsiye ve teknik sitem kelimeleri
    critique_keywords = (
        "keşke", "ama", "fakat", "lakin", "ancak", "ses", "müzik", "mikrofon", "ışık",
        "kurgu", "edit", "intro", "outro", "uzun", "kısa", "tempo", "sıkıcı", "olmamış",
        "eksi", "öneri", "tavsiye", "yerine", "geliştirilmeli", "bence", "sponsor", "reklam",
        "saçma", "yanlış", "eksik", "anlaşılmıyor", "düzelt"
    )
    for kw in critique_keywords:
        if re.search(rf"\b{re.escape(kw)}\b", lowered):
            score += 12.0

    # İroni / sitem / kinaye sinyalleri
    irony_keywords = (
        "aynen", "tebrikler", "harika", "mükemmel", "şaka", "kulaklık", "sağır",
        "özet", "tık tuzağı", "clickbait", "boşuna", "zaman kaybı", "sağol"
    )
    for kw in irony_keywords:
        if re.search(rf"\b{re.escape(kw)}\b", lowered):
            score += 10.0

    return score


def select_richest_comments(comments: List[str], max_sample: int = 150) -> List[str]:
    """
    Yorumları filtreleyip en bilgilendirici ve kaliteli olanları seçer.
    """
    if not comments:
        return []

    # 1. Aşama: Anlamsız/çöp yorumları filtrele
    cleaned = [c.strip() for c in comments if not is_junk_comment(c)]
    if not cleaned:
        cleaned = [c.strip() for c in comments if c and c.strip()]

    if len(cleaned) <= max_sample:
        return cleaned

    # 2. Aşama: Zenginlik puanına göre sırala ve en yüksek puanlıları seç
    scored = sorted(cleaned, key=score_comment_richness, reverse=True)
    return scored[:max_sample]


import os
import threading

_KEY_ROTATION_LOCK = threading.Lock()
_CURRENT_KEY_INDEX = 0

PLACEHOLDER_KEY_PATTERNS = {
    "your_key_1_here", "your_key_2_here", "your_key_3_here", "your_key_4_here",
    "your_key_5_here", "your_key_6_here", "your_key_7_here", "your_key_8_here",
    "your_key_9_here", "your_key_10_here", "your_gemini_api_key_here", "your_key_here",
    "your_gemini_api_key"
}


def mask_api_key(key: str) -> str:
    """API anahtarının sadece başını ve sonunu göstererek güvenli maskeleme yapar."""
    if not key or len(key) <= 8:
        return "***"
    return f"{key[:4]}...{key[-4:]}"


def get_gemini_api_keys() -> List[str]:
    """
    Tüm tanımlı ve geçerli Gemini API anahtarlarını toplar ve listeler:
    1. GEMINI_API_KEY_1 .. GEMINI_API_KEY_20 (numaralandırılmış)
    2. GEMINI_API_KEYS (virgülle veya noktalı virgülle ayrılmış liste)
    3. GEMINI_API_KEY (klasik tekil anahtar)
    """
    keys: List[str] = []

    # 1. Numaralandırılmış anahtarları tara (1'den 20'ye kadar)
    for i in range(1, 21):
        k = os.getenv(f"GEMINI_API_KEY_{i}", "").strip()
        if k and k.lower() not in PLACEHOLDER_KEY_PATTERNS and not k.startswith("your_key_"):
            if k not in keys:
                keys.append(k)

    # 2. Virgülle veya noktalı virgülle ayrılmış liste varsa ekle
    multi_keys_raw = os.getenv("GEMINI_API_KEYS", "").strip()
    if multi_keys_raw:
        for part in re.split(r"[,;]+", multi_keys_raw):
            clean_part = part.strip()
            if clean_part and clean_part.lower() not in PLACEHOLDER_KEY_PATTERNS and not clean_part.startswith("your_key_"):
                if clean_part not in keys:
                    keys.append(clean_part)

    # 3. Klasik tekil GEMINI_API_KEY varsa ekle
    legacy_key = os.getenv("GEMINI_API_KEY", "").strip()
    if legacy_key and legacy_key.lower() not in PLACEHOLDER_KEY_PATTERNS and not legacy_key.startswith("YOUR_"):
        if legacy_key not in keys:
            keys.append(legacy_key)

    return keys


def has_valid_gemini_api_key() -> bool:
    """Sistemde tanımlı en az 1 geçerli Gemini API anahtarı olup olmadığını bildirir."""
    return len(get_gemini_api_keys()) > 0


def get_ordered_api_keys(preferred_key: str | None = None) -> List[str]:
    """
    Tüm geçerli API anahtarlarını rotasyon sırasına göre döndürür.
    Eğer fonksiyona özel preferred_key verilmişse, onu listenin başına koyar.
    """
    all_keys = get_gemini_api_keys()

    if preferred_key:
        clean_pref = preferred_key.strip()
        if clean_pref and clean_pref.lower() not in PLACEHOLDER_KEY_PATTERNS and not clean_pref.startswith("YOUR_"):
            if clean_pref in all_keys:
                idx = all_keys.index(clean_pref)
                return all_keys[idx:] + all_keys[:idx]
            else:
                return [clean_pref] + all_keys

    if not all_keys:
        return []

    global _CURRENT_KEY_INDEX
    with _KEY_ROTATION_LOCK:
        start_idx = _CURRENT_KEY_INDEX % len(all_keys)
        return all_keys[start_idx:] + all_keys[:start_idx]


def rotate_to_next_key() -> None:
    """Mevcut anahtarı bir sonrakine kaydırır."""
    global _CURRENT_KEY_INDEX
    all_keys = get_gemini_api_keys()
    if not all_keys:
        return
    with _KEY_ROTATION_LOCK:
        _CURRENT_KEY_INDEX = (_CURRENT_KEY_INDEX + 1) % len(all_keys)


def is_quota_or_rate_limit_error(exc: Exception) -> bool:
    """Hatanın kota aşımı, hız limiti veya geçici kaynak yetersizliği olup olmadığını tespit eder."""
    err_str = str(exc).lower()
    return any(keyword in err_str for keyword in (
        "429",
        "quota",
        "resourceexhausted",
        "resource_exhausted",
        "ratelimit",
        "rate_limit",
        "too many requests",
        "exceeded",
        "exhausted"
    ))


def _generate_with_retry_sync(prompt: str, api_key: str | None = None) -> str:
    keys = get_ordered_api_keys(api_key)
    if not keys:
        raise ValueError("Kullanılabilir geçerli Gemini API anahtarı bulunamadı. Lütfen .env dosyasında GEMINI_API_KEY_1 veya GEMINI_API_KEY tanımlayın.")

    last_error = None
    for key_idx, current_key in enumerate(keys):
        masked = mask_api_key(current_key)
        try:
            genai.configure(api_key=current_key)
        except Exception as e:
            print(f"[Gemini Key Config Hatası] Key {masked}: {e}")
            continue

        for model_name in FALLBACK_MODELS:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"},
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = e
                if is_quota_or_rate_limit_error(e):
                    print(f"[GEMINI ROTASYON] Model '{model_name}' ve Anahtar '{masked}' için kota/istek sınırı aşıldı.")
                    continue
                else:
                    continue

        rotate_to_next_key()
        if key_idx < len(keys) - 1:
            next_masked = mask_api_key(keys[key_idx + 1])
            print(f"[GEMINI ROTASYON] Anahtar '{masked}' tükendi. Sıradaki anahtara ({next_masked}) geçiliyor...")
            time.sleep(0.5)

    if last_error:
        raise last_error
    raise RuntimeError("Tüm Gemini API anahtarları ve modelleri denendi ancak yanıt alınamadı.")


async def _generate_with_retry_async(prompt: str, api_key: str | None = None) -> str:
    keys = get_ordered_api_keys(api_key)
    if not keys:
        raise ValueError("Kullanılabilir geçerli Gemini API anahtarı bulunamadı. Lütfen .env dosyasında GEMINI_API_KEY_1 veya GEMINI_API_KEY tanımlayın.")

    last_error = None
    for key_idx, current_key in enumerate(keys):
        masked = mask_api_key(current_key)
        try:
            genai.configure(api_key=current_key)
        except Exception as e:
            print(f"[Gemini Key Config Hatası] Key {masked}: {e}")
            continue

        for model_name in FALLBACK_MODELS:
            try:
                model = genai.GenerativeModel(model_name)
                response = await model.generate_content_async(
                    prompt,
                    generation_config={"response_mime_type": "application/json"},
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = e
                if is_quota_or_rate_limit_error(e):
                    print(f"[GEMINI ROTASYON] Model '{model_name}' ve Anahtar '{masked}' için kota/istek sınırı aşıldı.")
                    continue
                else:
                    continue

        rotate_to_next_key()
        if key_idx < len(keys) - 1:
            next_masked = mask_api_key(keys[key_idx + 1])
            print(f"[GEMINI ROTASYON] Anahtar '{masked}' tükendi. Sıradaki anahtara ({next_masked}) geçiliyor...")
            await asyncio.sleep(0.5)

    if last_error:
        raise last_error
    raise RuntimeError("Tüm Gemini API anahtarları ve modelleri denendi ancak yanıt alınamadı.")


def analyze_comments(api_key: str | None = None, comments: List[str] | None = None) -> Dict[str, Any]:
    """
    Tüm yorumları filtrelenmiş ve zenginleştirilmiş tek bir Gemini isteğinde analiz ettirip, JSON formatında yapılandırılmış sonuç döndürür.
    Çoklu API anahtarı rotasyonunu ve model yedeklemesini otomatik yönetir.
    """
    resolved_keys = get_ordered_api_keys(api_key)
    if not resolved_keys:
        raise ValueError("Gemini API anahtarı eksik.")
        
    if not comments:
        return {
            "sentiment_distribution": {
                "positive_percent": 0,
                "negative_percent": 0,
                "neutral_percent": 100
            },
            "topics": [],
            "overall_summary": "Analiz edilecek yorum bulunamadı veya videonun henüz yorumu yok.",
            "top_recommendation": {
                "insight": "Yorum verisi bulunmuyor.",
                "action": "Video yorumlara açıksa izleyicileri yorum bırakmaya teşvik edin; yorum geldikçe analizi tekrarlayın.",
                "expected_impact": "Yorum verisi oluştukça kanala özgü, veriye dayalı tavsiyeler üretilebilir."
            }
        }
        
    # Anlamsız yorumları ayıklayıp en kaliteli/içgörü dolu yorumları seçiyoruz
    sampled_comments = select_richest_comments(comments, max_sample=150)
    comments_block = "\n---\n".join([f"[ID: {i}] {c}" for i, c in enumerate(sampled_comments)])
    comment_count = len(comments)
    example_min, example_max = topic_example_range(len(sampled_comments))

    # Hacme göre ZORUNLU kategori sınırları (toplam; üç sentiment'a doğal dağılım)
    if comment_count >= 800:
        min_topics, max_topics = 6, 10
    elif comment_count >= 300:
        min_topics, max_topics = 5, 8
    elif comment_count >= 100:
        min_topics, max_topics = 4, 7
    else:
        min_topics, max_topics = 3, 5
    
    prompt = f"""Sen profesyonel bir YouTube Yorum Analisti ve İçerik Stratejisti yapay zekasısın.
Aşağıdaki YouTube video yorumlarını derinlemesine analiz et:

TOPLAM YORUM SAYISI: {comment_count} (Filtrelenmiş ve en zengin {len(sampled_comments)} yorum örneklendi)
ZORUNLU KATEGORİ SAYISI: EN AZ {min_topics}, EN FAZLA {max_topics}

YORUMLAR:
{comments_block}

KRİTİK ANALİZ YÖNERGELERİ:

1. YÜZEYSEL VE JENERİK LAFLARI KESİNLİKLE KULLANMA:
   - "İçerik çok beğenildi", "İzleyiciler mutlu oldu", "Güzel bir video", "İzleyiciler memnun" gibi yuvarlak ve tembel ifadeler KESİNLİKLE YASAKTIR.
   - Yorumlardaki SOMUT DETAYLARA odaklan:
     * Varsa izleyicilerin belirttiği dakika/saniye (timestamp) referansları (ör: 03:15'teki şaka, 12:40'taki ses patlaması),
     * Konuklar, karakterler, anlatılan spesifik hikayeler ve olaylar,
     * Somut teknik detaylar: Ses miksajı/müzik seviyesi, ışık açısı, intro uzunluğu, görüntü kalitesi, kurgu hızı/tempo, sponsorluk yerleşimi.

2. TÜRKÇE İRONİ, SARKAZM VE SİTEM TESPİTİ (ÇOK ÖNEMLİ):
   Türkçe sosyal medya yorumlarında sıkça kullanılan kinaye, iğneleme, ters köşeler ve mizahi sitemleri DOĞRU duyguya (negative/neutral) ayır:
   - İçinde "harika", "mükemmel", "tebrikler", "bravo", "şahane" gibi pozitif kelimeler geçse dahi, cümlenin bütününde gizli bir alay, sitem veya hayal kırıklığı varsa bu bir OLUMSUZ / ELEŞTİRİ (negative) yorumdur.
   - ÖRNEKLER:
     * "Yine harika bir video, 40 dakikada hiçbir şey anlatmadın tebrikler" -> İRONİDİR -> `negative` (Zaman kaybı eleştirisi).
     * "Ses miksajı mükemmel olmuş, kulaklıkla dinlerken sağır kaldım" -> İRONİDİR -> `negative` (Ses seviyesi şikayeti).
     * "Böyle devam et reis, abone sayın 0 olana kadar arkandayız :)" -> SİTEMDİR -> `negative`.
     * "Aynen kardeşim kesin öyle olmuştur" -> İNANMAZLIK / ŞÜPHE -> `negative` veya `neutral`.
     * "Mükemmel bir sponsorluk videosu olmuş, araya biraz da içerik koysaydınız" -> SPONSORLUK ELEŞTİRİSİ -> `negative`.
   - Pozitif kelimelerin yüzeyine kanma; cümlenin alt metnindeki gerçek izleyici niyetini (intent) analiz et.

3. KATEGORİ SAYISI VE AYRIŞTIRMA KURALI:
   Bu videoda {comment_count} yorum var. MUTLAKA en az {min_topics} kategori üret; {max_topics}'den fazla olmasın.
   "Genel beğeni", "olumlu yorumlar", "izleyici tepkisi", "iyi video", "kötü video" gibi genel kategoriler KULLANMA.
   Temaları videoya özel alt başlıklara ayır (örneğin: "Mizah ve Espri Zamanlaması", "Ses ve Fon Müziği Dengesi", "Konuk Performansı", "Bilgilendiricilik Düzeyi", "Sponsorluk Geçişleri" vb.).

4. HER KONU BAŞLIĞI (TOPIC) İÇİN ZORUNLU ALANLAR:
   - "topic": Özgün ve somut kategori adı.
   - "percent": Yorumlar içindeki yaklaşık yüzdesi (0-100 arası sayı).
   - "sentiment": Yalnızca "positive", "negative" veya "neutral". İronik yorumlar içeren temaları negative olarak işaretle.
   - "insight": İçerik üreticisine net, uygulanabilir tavsiye.
   - "example_comment_ids": Bu temayı en iyi temsil eden en az {example_min}, en fazla {example_max} adet yorumun sayısal ID'si.

5. "overall_summary" (YÖNETİCİ ÖZETİ):
   - 3-4 cümlelik, gerçek yüzdelere ve spesifik bulgulara dayanan bir yönetici özeti yaz.
   - Varsa dikkat çeken bir çelişkiyi, öne çıkan dakikaları veya sürpriz izleyici tepkisini mutlaka vurgula.

6. "top_recommendation" (BİR SONRAKİ VİDEO İÇİN KRİTİK EYLEM):
   - "insight": EN AZ İKİ SAYISAL REFERANS İÇERMELİ (kategori yüzdesi ve yaklaşık yorum adedi: örn: "Yorumların %24'ü (~120 yorum) fon müziğinin konuşma sesini bastırdığını belirtiyor").
   - "action": Videonun tam neresinde, ne yapılacağını söyleyen tek nokta atışı somut adım (örn: "Kurgu aşamasında 02:00 sonrasındaki fon müziği seviyesini konuşma sesinin en az 6dB altına çekin").
   - "expected_impact": Verideki sayıya bağlanmış, hangi metriğin nasıl etkileneceğini açıklayan kazanım.

7. Yanıtı SADECE ve SADECE aşağıdaki JSON şemasında döndür. JSON harici hiçbir metin ekleme.

İSTENEN JSON ŞEMASI:
{{
  "sentiment_distribution": {{
    "positive_percent": 0,
    "negative_percent": 0,
    "neutral_percent": 0
  }},
  "topics": [
    {{
      "topic": "konu adı",
      "percent": 0,
      "sentiment": "positive",
      "insight": "içerik üreticisine somut aksiyon tavsiyesi",
      "example_comment_ids": [3, 17, 42]
    }}
  ],
  "overall_summary": "3-4 cümlelik, somut bulgulara ve yüzdelere dayanan yönetici özeti",
  "top_recommendation": {{
    "insight": "en az iki sayısal referans (yüzde + yaklaşık yorum adedi) içeren tespit",
    "action": "videonun neresinde ne yapılacağını söyleyen tek nokta atışı somut adım",
    "expected_impact": "verideki sayıya bağlanmış, hangi metriğin nasıl etkileneceğini açıklayan kazanım"
  }}
}}

SON KONTROL:
1. topics sayısının {min_topics} ile {max_topics} arasında olduğunu doğrula.
2. Jenerik yuvarlak lafların bulunmadığından ve ironik sitemlerin negative olarak sınıflandırıldığından emin ol.
3. top_recommendation alanının 3 parçasının da (insight, action, expected_impact) eksiksiz dolu olduğunu doğrula.
4. top_recommendation.insight içinde EN AZ İKİ sayısal veri geçtiğini doğrula.
5. top_recommendation.action'ın videonun neresinde ne yapılacağını söyleyen tek somut adım olduğunu doğrula.
"""

    try:
        raw_text = _generate_with_retry_sync(prompt, api_key)
        
        # Yanıttan markdown kod bloklarını temizleme (güvenlik önlemi)
        text = raw_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        result_dict = json.loads(text)
        
        # Beklenen şema yapısının doğrulanması
        required_keys = ["sentiment_distribution", "topics", "overall_summary", "top_recommendation"]
        for key in required_keys:
            if key not in result_dict:
                raise ValueError(f"Gemini yanıtında '{key}' anahtarı eksik.")
                
        # Duygu dağılımı alt anahtarlarının doğrulanması
        sentiment_keys = ["positive_percent", "negative_percent", "neutral_percent"]
        for skey in sentiment_keys:
            if skey not in result_dict["sentiment_distribution"]:
                raise ValueError(f"Duygu dağılımında '{skey}' eksik.")
                
        # Konuların doğrulanması: percent, sentiment, example_comment_ids
        allowed_sentiments = {"positive", "negative", "neutral"}
        for topic in result_dict.get("topics", []):
            if "example_comment_ids" not in topic:
                topic["example_comment_ids"] = []

            # percent zorunlu; yoksa veya geçersizse 0
            try:
                topic["percent"] = max(0, min(100, float(topic.get("percent", 0))))
            except (TypeError, ValueError):
                topic["percent"] = 0

            # sentiment: mixed -> neutral; bilinmeyen -> neutral
            raw_sentiment = str(topic.get("sentiment", "neutral")).strip().lower()
            if raw_sentiment == "mixed":
                raw_sentiment = "neutral"
            if raw_sentiment not in allowed_sentiments:
                raw_sentiment = "neutral"
            topic["sentiment"] = raw_sentiment

        # top_recommendation: üç alanlı nesneye normalize et (model düz string dönerse sarmala)
        rec = result_dict.get("top_recommendation")
        if isinstance(rec, str):
            result_dict["top_recommendation"] = {
                "insight": "",
                "action": rec,
                "expected_impact": ""
            }
        elif isinstance(rec, dict):
            for field in ("insight", "action", "expected_impact"):
                rec[field] = str(rec.get(field, "") or "")
        else:
            result_dict["top_recommendation"] = {
                "insight": "",
                "action": "",
                "expected_impact": ""
            }

        return result_dict
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini'den dönen yanıt geçerli bir JSON formatında değil: {str(e)}\nYanıt: {response.text}")
    except Exception as e:
        raise RuntimeError(f"Gemini analizi sırasında bir hata oluştu: {str(e)}")


async def analyze_channel_insights(video_reports: List[Dict[str, Any]], api_key: str | None = None) -> Dict[str, Any]:
    """
    5 videonun bireysel analiz sonuçlarını girdi olarak alarak Gemini 2.5 Flash ile
    kanal geneli sağlık skoru, duygu trendi, tekrar eden sorunlar ve kanal stratejisi sentezi üretir.
    """
    resolved_keys = get_ordered_api_keys(api_key)
    if not resolved_keys:
        raise ValueError("Gemini API anahtarı eksik.")

    if not video_reports:
        return {
            "channel_title": "Bilinmeyen Kanal",
            "overall_health_score": 0,
            "sentiment_trend": "STABLE",
            "summary": "Analiz edilecek video verisi bulunamadı.",
            "recurring_issues": [],
            "audience_shift_insights": "Yeterli video verisi bulunmuyor.",
            "actionable_channel_strategy": {
                "insight": "Veri yok",
                "action": "Kanal analizi için en az bir video analiz edilmelidir.",
                "expected_impact": "Veriler oluştukça kanal stratejisi üretilebilir."
            }
        }

    # Kanal başlığını ilk videodan veya raporlardan belirle
    detected_channel_title = "YouTube Kanalı"
    for r in video_reports:
        if r.get("channel_title"):
            detected_channel_title = r["channel_title"]
            break

    # Videoları kronolojik veya yapılandırılmış özet bloğuna dönüştür
    reports_payload = []
    for idx, report in enumerate(video_reports, 1):
        v_title = report.get("video_title") or report.get("title") or f"Video {idx}"
        v_published = report.get("published_at") or "Bilinmeyen Tarih"
        v_comments = report.get("comment_count_analyzed", 0)
        
        # İç analiz verisi (analysis_json veya doğrudan analysis dict)
        analysis_data = report.get("analysis") or report
        sentiment = analysis_data.get("sentiment_distribution", {})
        summary = analysis_data.get("overall_summary", "")
        top_rec = analysis_data.get("top_recommendation", {})
        topics = analysis_data.get("topics", [])
        
        topic_summaries = [
            f"- {t.get('topic')}: %{t.get('percent', 0)} ({t.get('sentiment', 'neutral')})"
            for t in topics[:6]
        ]

        reports_payload.append(
            f"--- [VİDEO #{idx}] ---\n"
            f"Başlık: {v_title}\n"
            f"Yayın Tarihi: {v_published}\n"
            f"Analiz Edilen Yorum Sayısı: {v_comments}\n"
            f"Duygu Dağılımı: Olumlu %{sentiment.get('positive_percent', 0)}, Olumsuz %{sentiment.get('negative_percent', 0)}, Nötr %{sentiment.get('neutral_percent', 0)}\n"
            f"Özet: {summary}\n"
            f"Öne Çıkan Konular:\n" + "\n".join(topic_summaries) + "\n"
            f"Öne Çıkan Tavsiye: {json.dumps(top_rec, ensure_ascii=False) if isinstance(top_rec, dict) else str(top_rec)}"
        )

    full_reports_text = "\n\n".join(reports_payload)

    prompt = f"""Sen kıdemli bir YouTube Kanal Danışmanı ve İçerik Büyüme Stratejisti yapay zekasısın.
Aşağıda "{detected_channel_title}" isimli YouTube kanalının son yayınlanan {len(video_reports)} videosunun bireysel analiz raporları bulunmaktadır.

VİDEO ANALİZ RAPORLARI:
{full_reports_text}

GÖREV:
Bu videoların duygu oranlarını, başlıklarını, öne çıkan şikayet/övgü temalarını ve zaman damgalarını kronolojik olarak karşılaştır.
Kanalın genel performansını sentezle ve aşağıdaki JSON şemasında eksiksiz bir kanal geneli rapor üret.

ANALİZ KURALLARI:
1. `overall_health_score`: 0 ile 100 arasında tamsayı bir kanal sağlık skoru belirle. (Olumlu yorum oranları, izleyici sadakati, etkileşim kalitesi ve tekrarlayan şikayetlerin azlığına göre adil puanla).
2. `sentiment_trend`: Yalnızca `"IMPROVING"`, `"DECLINING"` veya `"STABLE"` değerlerinden birini seç. (Videolar kronolojik olarak ilerledikçe izleyici memnuniyeti artıyor mu, düşüyor mu, yoksa sabit mi kalıyor?).
3. `summary`: Kanalın son dönem performansını 3-4 akıcı cümleyle özetleyen kronolojik yönetici özeti yaz.
4. `recurring_issues`: Birden fazla videoda ortaya çıkan veya kronikleşmiş teknik/içerik sorunlarını listele. Her bir eleman `issue` (sorun tanımı), `affected_videos_count` (etkilenen video sayısı) ve `first_noticed_video` (ilk görüldüğü video başlığı) içermelidir.
5. `audience_shift_insights`: İzleyici kitlesinin format değişimlerine, konu seçimlerine veya sunum tarzına verdiği tepkileri, kitle dinamiklerini ve beklenti değişimlerini açıkla.
6. `actionable_channel_strategy`: Kanal geneli atılması gereken en yüksek etkili tek stratejik aksiyonu belirle (`insight`, `action`, `expected_impact` alanlarını doldur).
7. Yanıtı SADECE geçerli bir JSON olarak döndür.

İSTENEN JSON ŞEMASI:
{{
  "channel_title": "{detected_channel_title}",
  "overall_health_score": 85,
  "sentiment_trend": "IMPROVING",
  "summary": "3-4 cümlelik kronolojik kanal özeti",
  "recurring_issues": [
    {{
      "issue": "Sorun tanımı (ör: Ses miksajındaki dengesizlik)",
      "affected_videos_count": 3,
      "first_noticed_video": "İlk Fark Edilen Video Başlığı"
    }}
  ],
  "audience_shift_insights": "İzleyici kitlesinin içerik değişimine verdiği tepkiler ve kitle eğilimleri",
  "actionable_channel_strategy": {{
    "insight": "Tespit edilen temel eğilim",
    "action": "Kanal geneli atılması gereken somut adım",
    "expected_impact": "Beklenen fayda ve izleyici dönüşümü"
  }}
}}
"""

    try:
        raw_text = await _generate_with_retry_async(prompt, api_key)

        text = raw_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        result = json.loads(text)

        # Doğrulama ve normalizasyon
        if not isinstance(result, dict):
            raise ValueError("Gemini sonucu beklenen JSON nesnesi tipinde değil.")

        # channel_title fallback
        result["channel_title"] = result.get("channel_title") or detected_channel_title

        # overall_health_score normalizasyonu (0 - 100 int)
        try:
            score = int(result.get("overall_health_score", 70))
            result["overall_health_score"] = max(0, min(100, score))
        except (ValueError, TypeError):
            result["overall_health_score"] = 70

        # sentiment_trend normalizasyonu
        trend = str(result.get("sentiment_trend", "STABLE")).strip().upper()
        if trend not in {"IMPROVING", "DECLINING", "STABLE"}:
            trend = "STABLE"
        result["sentiment_trend"] = trend

        # summary kontrolü
        result["summary"] = str(result.get("summary", "")).strip()

        # recurring_issues normalizasyonu
        raw_issues = result.get("recurring_issues", [])
        clean_issues = []
        if isinstance(raw_issues, list):
            for issue in raw_issues:
                if isinstance(issue, dict):
                    clean_issues.append({
                        "issue": str(issue.get("issue", "")).strip(),
                        "affected_videos_count": int(issue.get("affected_videos_count", 1) or 1),
                        "first_noticed_video": str(issue.get("first_noticed_video", "")).strip()
                    })
        result["recurring_issues"] = clean_issues

        # audience_shift_insights
        result["audience_shift_insights"] = str(result.get("audience_shift_insights", "")).strip()

        # actionable_channel_strategy
        strategy = result.get("actionable_channel_strategy")
        if isinstance(strategy, dict):
            result["actionable_channel_strategy"] = {
                "insight": str(strategy.get("insight", "")).strip(),
                "action": str(strategy.get("action", "")).strip(),
                "expected_impact": str(strategy.get("expected_impact", "")).strip()
            }
        else:
            result["actionable_channel_strategy"] = {
                "insight": "",
                "action": str(strategy or "").strip(),
                "expected_impact": ""
            }

        return result

    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini'den dönen kanal analizi JSON formatında değil: {str(e)}\nYanıt: {response.text}")
    except Exception as e:
        raise RuntimeError(f"Kanal analizi sırasında Gemini hatası oluştu: {str(e)}")


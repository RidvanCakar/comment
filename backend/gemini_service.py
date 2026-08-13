import json
import google.generativeai as genai
from typing import Dict, Any, List

from comment_insights import topic_example_range


def analyze_comments(api_key: str, comments: List[str]) -> Dict[str, Any]:
    """
    Tüm yorumları tek bir Gemini isteğinde analiz ettirip, JSON formatında yapılandırılmış sonuç döndürür.
    """
    if not api_key:
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
        
    # Gemini yapılandırması
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    # Yorumları ID'leri ile birlikte metin bloğu haline getiriyoruz (hız ve kota için max 150 temsili yorum)
    sampled_comments = comments[:150] if len(comments) > 150 else comments
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
    
    prompt = f"""Sen profesyonel bir YouTube Yorum Analisti yapay zekasısın.
Aşağıdaki YouTube video yorumlarını analiz et:

TOPLAM YORUM SAYISI: {comment_count}
ZORUNLU KATEGORİ SAYISI: EN AZ {min_topics}, EN FAZLA {max_topics}

YORUMLAR:
{comments_block}

ANALİZ YÖNERGELERİ:
1. Spam, reklam, anlamsız veya sadece emoji içeren yorumları analize dahil etme.
2. Yorumlar Türkçe veya İngilizce olabilir. Hepsini analiz et.
3. Raporu ve analiz sonuçlarını tamamen Türkçe olarak hazırla.
4. KATEGORİ SAYISI KURALI (ZORUNLU KISIT, TERCİH DEĞİL):
   Bu videoda {comment_count} yorum var. Aşağıdaki eşik tablosuna göre MUTLAKA en az {min_topics} kategori üret; {max_topics}'den fazla olmasın:
   - 100-300 yorum  -> minimum 4 kategori
   - 300-800 yorum  -> minimum 6 kategori
   - 800+ yorum     -> minimum 8 kategori (üst sınır 12)
   Eğer yeterince çeşitli tema bulamadığını düşünüyorsan, mevcut geniş temaları daha ince alt kategorilere BÖL
   (örneğin "içerik" yerine "konu seçimi", "anlatım tarzı", "tempo" gibi ayrı kategoriler;
   "beğeni" yerine övgünün neye yönelik olduğunu ayrıştır: editleme, mizah, samimiyet, bilgi değeri vb.).
   Bu toplam kategori sayısı üç duyguya (positive / negative / neutral) doğal şekilde dağılsın.
   Dağılım eşit olmak ZORUNDA DEĞİL — yorumların gerçek eğilimine göre olsun
   (örneğin olumlu yorum çoğunluktaysa positive altında daha fazla kategori çıkması normaldir).
5. Kategoriler birbiriyle anlamlı şekilde ayrışmalı. "Genel beğeni", "olumlu yorumlar", "izleyici tepkisi",
   "iyi video", "kötü video" gibi her şeyi kapsayan tembel/geniş kategoriler KULLANMA.
   Bunun yerine yorumlardaki gerçek alt temaları ayrı ayrı yakala
   (örnekler: editleme, sunum/sunucu performansı, konu seçimi, mizah tarzı, teknik kalite,
   ses/görüntü kalitesi, tempo, karakterler, senaryo, etkileşim vb. — videoya özgü gerçek temalar neyse onları kullan).
6. Her konu başlığı (topic) için ZORUNLU alanlar:
   - "percent": o kategorinin toplam (analiz edilen) yorumlar içindeki payı (0-100 arası sayı).
   - "sentiment": yalnızca şu üç değerden biri — "positive" (olumlu), "negative" (olumsuz) veya "neutral" (nötr). "mixed" KULLANMA.
   Bir kategori çoğunlukla olumluysa positive, çoğunlukla olumsuzsa negative, belirgin bir yönü yoksa veya hem övgü hem eleştiri dengeliyse neutral yaz.
7. Her konu başlığı için içerik üreticisine aksiyon alabileceği net bir tavsiye (insight) yaz.
8. Her konu başlığı için, o konuyla en çok ilişkili olan/temsil eden en az {example_min}, en fazla {example_max} adet temsili örnek yorumun ID'sini (sayı olarak) 'example_comment_ids' listesine ekle.
9. "overall_summary" (özet rapor) şu kurallara uymalı:
   - 3-4 cümlelik, gerçek verilere dayanan bir YÖNETİCİ ÖZETİ olsun.
   - Hangi temaların öne çıktığını yüzdeleriyle belirt (örnek: "Yorumların %40'ı editleme kalitesini övüyor").
   - İzleyici kitlesinin genel tavrını net söyle (coşkulu mu, eleştirel mi, nostaljik mi vb.).
   - Dikkat çeken bir çelişki veya sürpriz bulgu varsa MUTLAKA vurgula
     (örnek: "Yorumların çoğu olumlu olsa da ses seviyesiyle ilgili tekrar eden bir teknik şikayet var").
   - Jenerik cümlelerden kaçın ("izleyiciler videoyu beğenmiş" gibi); doğrudan BU videoya özgü konuş.
10. "top_recommendation" (bir sonraki video için kritik tavsiye) ÜÇ AYRI ALANDAN oluşan bir JSON nesnesi olmalı.
   Bu bölüm ürünün EN DEĞERLİ çıktısıdır; içerik üreticisi buna bakarak karar verecek. Kurallar:
   - "insight" (Tespit): SAYISAL VERİYE DAYALI olmak ZORUNDA. En az İKİ sayısal referans içermeli:
     * İlgili kategorinin yüzdesi VE bu yüzdenin kabaca kaç yoruma denk geldiği
       (örnek: "Yorumların %23'ü (~280 yorum) ses miksajından şikayetçi; bu, en büyük ikinci olumsuz tema").
     * Mümkünse karşılaştırma ekle: kategorinin diğer kategorilere veya genel duygu dağılımına oranı
       (örnek: "olumsuz yorumların %70'i tek başına bu konuda toplanıyor").
   - "action" (Aksiyon): NOKTA ATIŞI tek bir adım olmalı — içerik üreticisi bunu okuyunca bir sonraki videoda
     TAM OLARAK ne yapacağını bilmeli. Şunları içermeli:
     * Videonun NERESİNDE / HANGİ aşamasında uygulanacağı (giriş, ilk 30 saniye, kurgu aşaması, ses miksajı, kapanış vb.),
     * NE yapılacağı (ölçülebilir/denetlenebilir bir değişiklik: "intro'yu 60 saniyeden 15 saniyeye indir",
       "konuşma sesini fon müziğinin en az 2 kat üstünde miksle", "X segmentine videoda ayrı bir bölüm ayır" gibi),
     * Birden fazla önerin varsa yalnızca EN YÜKSEK ETKİLİ olanı seç; liste verme, tek net adım ver.
     "Daha iyi olun", "daha çok içerik üretin", "izleyicilerle etkileşime geçin" gibi belirsiz/jenerik laflar KESİNLİKLE YASAK.
   - "expected_impact" (Beklenen Etki): Aksiyonun hangi metriği nasıl etkileyeceğini söyle ve bunu
     yorum verisindeki sayıya bağla (örnek: "Bu şikayet kaynağı giderilirse olumsuz yorumların ~%70'ini
     oluşturan bu tema küçülür; izlenme süresi ve geri dönen izleyici oranında artış beklenir").
     Boş vaatler yerine, verideki hangi sinyalin hangi kazanca işaret ettiğini açıkla.
11. Yanıtı SADECE ve SADECE aşağıdaki JSON şemasında döndür. JSON harici hiçbir açıklama metni veya ek bilgi ekleme.

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
      "insight": "içerik üreticisine aksiyon alınabilir tavsiye",
      "example_comment_ids": [3, 17, 42]
    }}
  ],
  "overall_summary": "3-4 cümlelik, yüzdelere dayanan, çelişki/sürpriz bulguyu vurgulayan yönetici özeti",
  "top_recommendation": {{
    "insight": "en az iki sayısal referans (yüzde + yaklaşık yorum sayısı) içeren tespit",
    "action": "videonun neresinde, tam olarak ne yapılacağını söyleyen tek nokta atışı adım",
    "expected_impact": "verideki sayıya bağlanmış, hangi metriğin nasıl etkileneceğini açıklayan kazanım"
  }}
}}

SON KONTROL (cevabını göndermeden önce):
1. topics dizisindeki kategori sayısını SAY. Eğer {min_topics}'den azsa, en yüksek yüzdeli kategoriyi anlamlı iki alt kategoriye bölerek sayıyı {min_topics}'e tamamla. {max_topics}'den fazlaysa en küçük iki kategoriyi birleştir.
2. Her topic.sentiment değerinin yalnızca "positive", "negative" veya "neutral" olduğunu doğrula.
3. top_recommendation'ın üç alanının da (insight, action, expected_impact) dolu olduğunu doğrula.
4. top_recommendation.insight içinde EN AZ İKİ sayısal veri (yüzde ve yaklaşık yorum adedi) geçtiğini doğrula; yoksa ekle.
5. top_recommendation.action'ın tek bir somut adım olduğunu ve videonun hangi aşamasına ait olduğunu belirttiğini doğrula; belirsizse somutlaştır.
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Yanıttan markdown kod bloklarını temizleme (güvenlik önlemi)
        text = response.text.strip()
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
    import os
    resolved_api_key = api_key or os.getenv("GEMINI_API_KEY")
    if not resolved_api_key:
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

    genai.configure(api_key=resolved_api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")

    try:
        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )

        text = response.text.strip()
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


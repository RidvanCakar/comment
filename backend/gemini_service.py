import json
import google.generativeai as genai
from typing import Dict, Any, List

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
    
    # Yorumları ID'leri ile birlikte tek bir metin bloğu haline getiriyoruz
    comments_block = "\n---\n".join([f"[ID: {i}] {c}" for i, c in enumerate(comments)])
    comment_count = len(comments)

    # Hacme göre ZORUNLU kategori sınırları (toplam; üç sentiment'a doğal dağılım)
    if comment_count >= 800:
        min_topics, max_topics = 8, 12
    elif comment_count >= 300:
        min_topics, max_topics = 6, 8
    elif comment_count >= 100:
        min_topics, max_topics = 4, 7
    else:
        min_topics, max_topics = 3, 6
    
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
8. Her konu başlığı için, o konuyla en çok ilişkili olan/temsil eden en az 3, en fazla 5 adet temsili örnek yorumun ID'sini (sayı olarak) 'example_comment_ids' listesine ekle.
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

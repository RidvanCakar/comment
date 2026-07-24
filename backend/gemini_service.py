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
            "top_recommendation": "Yorum yapılmadığı için henüz bir tavsiye oluşturulamadı."
        }
        
    # Gemini yapılandırması
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    # Yorumları ID'leri ile birlikte tek bir metin bloğu haline getiriyoruz
    comments_block = "\n---\n".join([f"[ID: {i}] {c}" for i, c in enumerate(comments)])
    comment_count = len(comments)

    # Hacme göre hedef kategori aralığı
    if comment_count >= 800:
        topic_target = "7-8"
        topic_guidance = "Bu hacimde en az 7, en fazla 8 konu başlığı çıkar."
    elif comment_count >= 300:
        topic_target = "5-7"
        topic_guidance = "Bu hacimde en az 5, en fazla 7 konu başlığı çıkar."
    elif comment_count >= 100:
        topic_target = "4-5"
        topic_guidance = "Bu hacimde en az 4, en fazla 5 konu başlığı çıkar."
    else:
        topic_target = "3-4"
        topic_guidance = "Bu hacimde en az 3, en fazla 4 konu başlığı çıkar."
    
    prompt = f"""Sen profesyonel bir YouTube Yorum Analisti yapay zekasısın.
Aşağıdaki YouTube video yorumlarını analiz et:

TOPLAM YORUM SAYISI: {comment_count}
HEDEF KATEGORİ SAYISI: {topic_target}

YORUMLAR:
{comments_block}

ANALİZ YÖNERGELERİ:
1. Spam, reklam, anlamsız veya sadece emoji içeren yorumları analize dahil etme.
2. Yorumlar Türkçe veya İngilizce olabilir. Hepsini analiz et.
3. Raporu ve analiz sonuçlarını tamamen Türkçe olarak hazırla.
4. Konu başlığı (topic) sayısı yorum hacmine göre dinamik olmalı: {topic_guidance}
   Yorum sayısı arttıkça kategori sayısı da artmalı; az sayıda geniş kategoriye sıkıştırmaktan kaçın.
5. Kategoriler birbiriyle anlamlı şekilde ayrışmalı. "Genel beğeni", "olumlu yorumlar", "izleyici tepkisi" gibi her şeyi kapsayan tembel/geniş kategoriler KULLANMA.
   Bunun yerine yorumlardaki gerçek, somut temaları ayrı ayrı yakala (örnekler: editleme, sunucu performansı, konu seçimi, teknik kalite, mizah tarzı, ses kalitesi, tempo, karakterler, senaryo vb. — videoya özgü gerçek temalar neyse onları kullan).
6. Her konu başlığı için içerik üreticisine aksiyon alabileceği net bir tavsiye (insight) yaz.
7. Her konu başlığı için, o konuyla en çok ilişkili olan/temsil eden en az 3, en fazla 5 adet temsili örnek yorumun ID'sini (sayı olarak) 'example_comment_ids' listesine ekle.
8. "top_recommendation" (bir sonraki video için kritik tavsiye) şu kurallara uymalı:
   - Mutlaka analiz ettiğin kategorilerden en az birine doğrudan referans ver; gerekçe + aksiyon birlikte olsun.
     Format örneği: "Yorumların %34'ü X'i övüyor; bir sonraki videoda Y'yi yapmalısın."
   - Genel geçer, her videoya uyabilecek tavsiyelerden KAÇIN ("daha çok içerik üretin", "izleyicilerle etkileşime geçin", "kaliteli içerik yapın" vb.).
   - Bu videoya özgü, somut ve uygulanabilir bir öneri üret:
     * Sürekli tekrar eden bir şikayet varsa onu düzeltecek net bir aksiyon, VEYA
     * En çok övülen unsuru bir sonraki videoda nasıl daha da öne çıkarabileceği.
   - Tavsiyenin sonunda kısa bir "neden bu öneri önemli" gerekçesi ekle (örnek: "çünkü yorumların X%'i bunu doğrudan talep ediyor"), böylece öneri rastgele değil veriye dayalı olsun.
9. Yanıtı SADECE ve SADECE aşağıdaki JSON şemasında döndür. JSON harici hiçbir açıklama metni veya ek bilgi ekleme.

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
      "sentiment": "positive | negative | mixed",
      "insight": "içerik üreticisine aksiyon alınabilir tavsiye",
      "example_comment_ids": [3, 17, 42]
    }}
  ],
  "overall_summary": "genel özet paragrafı",
  "top_recommendation": "kategoriye referanslı, somut aksiyon + veriye dayalı gerekçe içeren tek kritik tavsiye"
}}
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
                
        # Konuların doğrulanması ve example_comment_ids varsayılan değeri
        for topic in result_dict.get("topics", []):
            if "example_comment_ids" not in topic:
                topic["example_comment_ids"] = []
                
        return result_dict
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini'den dönen yanıt geçerli bir JSON formatında değil: {str(e)}\nYanıt: {response.text}")
    except Exception as e:
        raise RuntimeError(f"Gemini analizi sırasında bir hata oluştu: {str(e)}")

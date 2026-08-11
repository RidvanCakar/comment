export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "Bu araç nasıl çalışıyor?",
    answer:
      "YouTube video bağlantısını giriyorsun. YorumAI yorumları YouTube Data API üzerinden alıyor, spam ve anlamsız içerikleri ayıklıyor; ardından Gemini ile duygu dağılımı, konu kategorileri, yönetici özeti ve bir sonraki video önerisini hazırlıyor.",
  },
  {
    question: "Hangi videoları analiz edebilirim, bir limit var mı?",
    answer:
      "Herkese açık ve yorumları açık olan YouTube videolarını analiz edebilirsin. Gizli, silinmiş veya yorumları kapatılmış videolarda YouTube yorum verisi sunmadığı için analiz yapılamaz.",
  },
  {
    question: "Yorumlarım ve verilerim güvende mi, paylaşılıyor mu?",
    answer:
      "Analiz sonucu uygulamanın yerel SQLite önbelleğinde tutulur; kamuya açık bir profil veya veri pazarı oluşturulmaz. Analiz için yorumlar YouTube API'den alınır ve yapay zekâ değerlendirmesi amacıyla Google Gemini servisine gönderilir. Hassas veya özel veri yüklememeni öneririz.",
  },
  {
    question: "Analiz ne kadar sürüyor?",
    answer:
      "Süre yorum sayısına ve servis yoğunluğuna göre değişir. Küçük videolar daha hızlı tamamlanırken, yüzlerce veya binlerce yorum içeren videoların analizi birkaç dakika sürebilir. Daha önce analiz edilen bir video önbellekten çok daha hızlı açılır.",
  },
  {
    question: "Ücretsiz mi?",
    answer:
      "Mevcut sürümü ücretsiz deneyebilirsin. Uygulama YouTube Data API ve Gemini API kotalarını kullanır; bu servislerin ücretsiz kullanım sınırları dolduğunda geçici sınırlamalar yaşanabilir.",
  },
  {
    question: "Kaç yorum analiz ediliyor?",
    answer:
      "YorumAI bir videodan en fazla 1.500 üst seviye yorumu analiz eder. Daha az yorum varsa mevcut yorumların tamamı değerlendirilir. Spam, reklam ve yalnızca emojiden oluşan yorumlar rapora dahil edilmez.",
  },
  {
    question: "Sonuçlar kesin mi?",
    answer:
      "Rapor, incelenen yorumlardan çıkarılan yapay zekâ destekli bir karar desteğidir; mutlak gerçek değildir. En iyi sonuç için yüzdeleri, örnek yorumları ve öneriyi kanal deneyiminle birlikte değerlendirmeni öneririz.",
  },
  {
    question: "Aynı videoyu yeniden analiz edebilir miyim?",
    answer:
      "Evet. Normalde aynı video hızlı açılması için önbellekten gelir. Yeni yorumları dahil etmek istediğinde “Yeniden analiz et (önbelleği atla)” seçeneğini kullanabilirsin.",
  },
];

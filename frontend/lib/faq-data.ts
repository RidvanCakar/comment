export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "Kanal Geneli Analiz (Channel Insights) nedir?",
    answer:
      "Bir YouTube kanalının son 5 videosunun tüm yorumlarını tarayarak çapraz analiz yapar. Kanal Sağlık Skoru (0-100), Duygu Trendi (Yükseliş/Düşüş/Denge), videolar arasında tekrar eden kronik şikâyetler ve kanalın geneli için kritik bir büyüme stratejisi sunar.",
  },
  {
    question: "Bu araç nasıl çalışıyor?",
    answer:
      "YouTube video veya kanal bağlantısını (@handle veya kanal linki) giriyorsun. YorumAI yorumları YouTube Data API üzerinden alıyor, spam ve anlamsız içerikleri ayıklıyor; ardından Gemini 2.5 Flash ile duygu dağılımı, konu kategorileri, yönetici özeti ve aksiyon planını hazırlıyor.",
  },
  {
    question: "Hangi videoları ve kanalları analiz edebilirim?",
    answer:
      "Herkese açık ve yorumları açık olan YouTube videolarını veya kanallarını analiz edebilirsin. Gizli veya yorumları kapatılmış videolarda YouTube yorum verisi sunmadığı için analiz yapılamaz.",
  },
  {
    question: "Kanal analizi ne kadar sürer?",
    answer:
      "Kanal analizi 5 videonun yorumlarını ve yapay zeka sentezini içerdiği için kanalın toplam yorum hacmine bağlı olarak 1-3 dakika arasında tamamlanır.",
  },
  {
    question: "Krediler nasıl çalışır?",
    answer:
      "Yeni kayıt olan her kullanıcıya 5 analiz kredisi tanımlanır. Tekil video analizi 1 kredi, çoklu video kapsayan Kanal Geneli Analiz ise 3 kredi harcar.",
  },
  {
    question: "Kaç yorum analiz ediliyor?",
    answer:
      "YorumAI bir videodan 1.500'e kadar üst seviye yorumu analiz eder. Spam, reklam ve yalnızca emojiden oluşan yorumlar elenerek en temsili ve etkileşimli yorumlar yapay zekaya aktarılır.",
  },
  {
    question: "Aynı video veya kanalı yeniden analiz edebilir miyim?",
    answer:
      "Evet. Daha önce analiz edilen video ve kanallar hızlı açılması ve ek kredi harcamaması için önbellekten gelir. Güncel yorumları dahil etmek istediğinde 'Önbelleği atla' seçeneğini kullanabilirsin.",
  },
];


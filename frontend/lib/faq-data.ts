export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "Kanal Geneli Analiz (Channel Insights) nedir?",
    answer:
      "Bir YouTube kanalının son 5 videosundaki tüm izleyici geri bildirimlerini tarayarak kitle hafızasını ve genel performansını haritalandırır. Kanal Sağlık Skoru (0-100), Kitle Trendi (Yükseliş/Düşüş/Denge), tekrar eden izleyici talepleri ve kanalın geneli için stratejik bir büyüme yol haritası sunar.",
  },
  {
    question: "Bu araç nasıl çalışıyor?",
    answer:
      "Video veya kanal linkini (@handle veya kanal bağlantısı) yapıştırın. CommentLab binlerce izleyici yorumunu saniyeler içinde tarar, gürültüyü temizleyip sadece değerli kitle fikirlerine odaklanır; ardından kitle duygu dağılımı, içerik kategorileri, yönetici özeti ve eyleme dönüştürülebilir aksiyon planını hazırlar.",
  },
  {
    question: "Hangi videoları ve kanalları analiz edebilirim?",
    answer:
      "Herkese açık ve yorumları açık olan tüm YouTube videolarını veya kanallarını analiz edebilirsiniz. Gizli veya yorumları kapatılmış videolarda yorum verisi bulunmadığı için analiz yapılamaz.",
  },
  {
    question: "Kanal analizi ne kadar sürer?",
    answer:
      "Kanal analizi 5 videonun tüm izleyici yorumlarını tarayıp kapsamlı bir stratejik rapor oluşturduğu için kanalın toplam yorum hacmine bağlı olarak genellikle 1-3 dakika arasında tamamlanır.",
  },
  {
    question: "Krediler nasıl çalışır?",
    answer:
      "Yeni kayıt olan her kullanıcıya 5 analiz kredisi tanımlanır. Tekil video analizi 1 kredi, çoklu video kapsayan Kanal Geneli Analiz ise 3 kredi harcar.",
  },
  {
    question: "Kaç yorum analiz ediliyor?",
    answer:
      "CommentLab bir videodan 1.500'e kadar en etkileşimli izleyici yorumunu tarar. Gürültüyü ve spam tekrarları eleyerek en değerli kitle fikirlerini analiz raporuna aktarır.",
  },
  {
    question: "Aynı video veya kanalı yeniden analiz edebilir miyim?",
    answer:
      "Evet. Daha önce analiz edilen video ve kanallar hızlı açılması ve ek kredi harcamaması için güvenle önbellekten sunulur. En güncel yorumları dahil etmek istediğinizde 'Önbelleği atla' seçeneğini kullanabilirsiniz.",
  },
];

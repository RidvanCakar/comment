import { SectionIntro } from "./HowItWorks";
import Reveal from "./Reveal";

const faqs = [
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

export default function FAQ() {
  return (
    <section id="sss" className="scroll-mt-24 border-t border-border-subtle bg-bg-surface/25 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Reveal>
          <SectionIntro
            eyebrow="Merak ettiklerin"
            title="Sıkça sorulan sorular"
            description="Başlamadan önce bilmek isteyebileceğin temel noktaları açık ve kısa şekilde yanıtladık."
          />
        </Reveal>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={(index % 4) * 45}>
              <details className="landing-faq group rounded-xl border border-border-subtle bg-bg-surface/75 transition-colors open:border-accent-record/25 open:bg-bg-surface">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left sm:px-5">
                  <span className="font-display text-sm font-bold text-text-primary sm:text-base">
                    {faq.question}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-base/60 text-lg text-text-muted transition-transform duration-300 group-open:rotate-45 group-open:border-accent-record/30 group-open:text-accent-record">
                    +
                  </span>
                </summary>
                <div className="border-t border-border-subtle px-4 pb-5 pt-4 sm:px-5">
                  <p className="text-sm leading-7 text-text-muted sm:text-base">{faq.answer}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

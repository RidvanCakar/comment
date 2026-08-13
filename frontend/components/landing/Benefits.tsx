import LandingIcon, { type LandingIconName } from "./LandingIcon";
import { SectionIntro } from "./HowItWorks";
import Reveal from "./Reveal";

const benefits: {
  icon: LandingIconName;
  title: string;
  description: string;
  accent: string;
}[] = [
  {
    icon: "chart",
    title: "Kanal Sağlık Skoru (0-100) ve Trend",
    description:
      "Son 5 videonun izleyici algısını karşılaştırarak kanalının yükselişte mi yoksa düşüşte mi olduğunu anında gör.",
    accent:
      "text-accent-record bg-accent-record/10 border-accent-record/25",
  },
  {
    icon: "shield",
    title: "Kronik Tekrar Eden Sorunları Yakala",
    description:
      "Birden fazla videoda sürekli tekrar eden teknik aksaklık veya içerik şikâyetlerini tespit et.",
    accent:
      "text-sentiment-negative bg-sentiment-negative/10 border-sentiment-negative/25",
  },
  {
    icon: "target",
    title: "Kanal Geneli Büyüme Stratejisi",
    description:
      "Yalnızca tek video değil, kanalının genel izleyici kitlesini büyütmek için yapay zekâ destekli tek bir kritik eyleme odaklan.",
    accent: "text-sentiment-positive bg-sentiment-positive/10 border-sentiment-positive/25",
  },
  {
    icon: "clock",
    title: "Saatler Süren Okuma Derdine Son",
    description:
      "Binlerce izleyici yorumunu saniyeler içinde özetle; zamanını yorum okumaya değil, yeni içerik üretmeye ayır.",
    accent: "text-accent-record bg-accent-record/10 border-accent-record/25",
  },
];

export default function Benefits() {
  return (
    <section id="faydalar" className="scroll-mt-24 border-y border-border-subtle bg-bg-surface/30 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Reveal>
          <SectionIntro
            eyebrow="İçerik üreticileri için"
            title="Yorumlar yalnızca geri bildirim değil, büyüme verisidir."
            description="YorumAI, izleyicinin ne söylediğini sadeleştirir ve bu sinyali içerik stratejine bağlar."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:gap-6">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={(index % 2) * 80}>
              <article className="group flex h-full gap-4 rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 transition-all hover:border-accent-record/25 hover:shadow-xl hover:shadow-black/5 sm:gap-5 sm:p-7">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${benefit.accent}`}>
                  <LandingIcon name={benefit.icon} className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold leading-snug text-text-primary">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
                    {benefit.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

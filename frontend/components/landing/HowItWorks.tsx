import LandingIcon, { type LandingIconName } from "./LandingIcon";
import Reveal from "./Reveal";

const steps: {
  number: string;
  icon: LandingIconName;
  title: string;
  description: string;
}[] = [
  {
    number: "01",
    icon: "link",
    title: "Video veya Kanal Linki Gir",
    description:
      "Tek bir YouTube video linki veya kanal kullanıcı adını (@handle) yapıştır.",
  },
  {
    number: "02",
    icon: "sparkles",
    title: "Gemini 2.5 Flash Analiz Etsin",
    description:
      "Yapay zekâ binlerce yorumu ayıklar; duygu dağılımı, temalar ve çoklu video sentezi yapar.",
  },
  {
    number: "03",
    icon: "clipboard",
    title: "Stratejik Raporunu Al",
    description:
      "Kanal Sağlık Skoru, duygu trendi, kronik sorunlar ve bir sonraki videon için net aksiyonu gör.",
  },
];

export default function HowItWorks() {
  return (
    <section id="nasil-calisir" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Reveal>
          <SectionIntro
            eyebrow="Üç basit adım"
            title="Dakikalarca yorum okumadan izleyicini anla."
            description="Bağlantıyı ver; gerisini YorumAI senin için düzenli, okunabilir ve uygulanabilir bir rapora dönüştürsün."
          />
        </Reveal>

        <div className="relative mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          <div className="absolute left-[16.66%] right-[16.66%] top-12 hidden border-t border-dashed border-accent-record/25 md:block" />
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 90}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/70 p-6 backdrop-blur-lg transition-all hover:-translate-y-1 hover:border-accent-record/30 hover:shadow-xl hover:shadow-black/5 sm:p-7">
                <span className="absolute right-4 top-2 font-mono text-5xl font-black text-fill-muted">
                  {step.number}
                </span>
                <div className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-accent-record/25 bg-accent-record/10 text-accent-record">
                  <LandingIcon name={step.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-text-muted sm:text-base">{step.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  centered = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={`${centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-record">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-text-primary sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-text-muted sm:text-lg">{description}</p>
    </div>
  );
}

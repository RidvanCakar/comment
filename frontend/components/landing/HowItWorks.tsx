"use client";

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
    title: "Video veya Kanal URL'si Girin",
    description:
      "Tek bir YouTube video bağlantısı veya kanal kullanıcı adını (@handle) yapıştırın.",
  },
  {
    number: "02",
    icon: "sparkles",
    title: "CommentLab AI Engine Analiz Etsin",
    description:
      "Gürültüyü temizleyip değerli kitle fikirlerini ayıklar; kitle duygu durumunu çıkarır ve gizli büyüme fırsatlarını belirler.",
  },
  {
    number: "03",
    icon: "clipboard",
    title: "Stratejik Büyüme Raporunu Alın",
    description:
      "Kanal Sağlık Skoru, kitle tepkileri ve bir sonraki videonuz için uygulanabilir eylem planını anında görün.",
  },
];

export default function HowItWorks() {
  return (
    <section id="nasil-calisir" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Reveal>
          <SectionIntro
            eyebrow="ÜÇ BASİT ADIM"
            title="Dakikalarca yorum okumadan kitlenizi anlayın."
            description="Bağlantıyı yapıştırın; CommentLab dağınık kitle sesini organize, ölçülebilir ve uygulanabilir bir büyüme raporuna dönüştürsün."
          />
        </Reveal>

        <div className="relative mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          <div className="absolute left-[16.66%] right-[16.66%] top-12 hidden border-t border-dashed border-zinc-800 md:block" />
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 90}>
              <article className="group relative h-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70 sm:p-8">
                <span className="absolute right-5 top-3 font-mono text-5xl font-black text-zinc-800/80 group-hover:text-zinc-700 transition">
                  {step.number}
                </span>
                <div className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
                  <LandingIcon name={step.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{step.description}</p>
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
      <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-400">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">{description}</p>
    </div>
  );
}

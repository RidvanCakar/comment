import Link from "next/link";
import LandingIcon from "./LandingIcon";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-accent-record/10 blur-[100px]" />
        <div className="absolute right-[-10rem] top-32 h-80 w-80 rounded-full bg-sentiment-positive/10 blur-[100px]" />
        <div className="landing-grid absolute inset-0 opacity-35" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-record/25 bg-accent-record/10 px-3 py-1.5 text-xs font-bold text-accent-record">
              <LandingIcon name="sparkles" className="h-4 w-4" />
              Yapay zekâ destekli içerik içgörüleri
            </div>

            <h1 className="font-display text-[2.55rem] font-extrabold leading-[1.06] tracking-[-0.045em] text-text-primary sm:text-6xl lg:text-[4.25rem]">
              YouTube yorumlarını{" "}
              <span className="landing-gradient-text">büyüme kararlarına</span>{" "}
              dönüştür.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-text-muted sm:text-lg sm:leading-8 lg:mx-0">
              YorumAI; içerik üreticileri ve ekipleri için binlerce yorumu
              analiz eder, gerçek izleyici temalarını ortaya çıkarır ve bir
              sonraki videon için somut aksiyon sunar.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
              <Link
                href="/analyze"
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent-record px-6 py-3.5 font-display text-sm font-bold text-[#17130b] shadow-xl shadow-accent-record/20 transition-all hover:-translate-y-0.5 hover:bg-accent-record/90"
              >
                Ücretsiz Analiz Et
                <LandingIcon name="arrow" className="h-5 w-5" />
              </Link>
              <a
                href="#rapor"
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border-subtle bg-bg-surface/70 px-6 py-3.5 text-sm font-semibold text-text-primary backdrop-blur-md transition-colors hover:border-accent-record/35"
              >
                <LandingIcon name="eye" className="h-5 w-5 text-text-muted" />
                Örnek raporu gör
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-text-muted lg:justify-start">
              {["Kredi kartı gerekmez", "Kurulum yok", "1500 yoruma kadar"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <LandingIcon name="check" className="h-4 w-4 text-sentiment-positive" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="mx-auto w-full max-w-2xl">
          <HeroMockup />
        </Reveal>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-accent-record/20 via-transparent to-sentiment-positive/15 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/85 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex h-11 items-center justify-between border-b border-border-subtle px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sentiment-negative/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-record/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-sentiment-positive/80" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            YorumAI analiz raporu
          </span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-sentiment-positive" />
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-record">
                Analiz tamamlandı
              </span>
              <h2 className="mt-1 font-display text-base font-bold text-text-primary sm:text-lg">
                Yeni video stratejisi nasıl kurulur?
              </h2>
              <p className="mt-1 text-xs text-text-muted">1.248 yorum incelendi</p>
            </div>
            <span className="rounded-md border border-sentiment-positive/20 bg-sentiment-positive/10 px-2.5 py-1 text-xs font-bold text-sentiment-positive">
              %68 olumlu
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              ["Olumlu", "%68", "bg-sentiment-positive"],
              ["Olumsuz", "%14", "bg-sentiment-negative"],
              ["Nötr", "%18", "bg-sentiment-neutral"],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-lg border border-border-subtle bg-bg-base/55 p-3">
                <span className={`mb-2 block h-1 w-8 rounded-full ${color}`} />
                <strong className="block font-mono text-lg text-text-primary">{value}</strong>
                <span className="text-[11px] text-text-muted">{label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {[
              ["Anlatım netliği", 42, "bg-sentiment-positive"],
              ["Kurgu temposu", 27, "bg-accent-record"],
              ["Ses dengesi", 18, "bg-sentiment-negative"],
            ].map(([label, value, color]) => (
              <div key={String(label)} className="rounded-lg border border-border-subtle bg-bg-base/40 p-3">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-medium text-text-primary">{label}</span>
                  <span className="font-mono text-text-muted">%{value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-fill-muted">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-accent-record/25 bg-accent-record/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-record">
              <LandingIcon name="target" className="h-4 w-4" />
              Kritik öneri
            </div>
            <p className="text-xs leading-5 text-text-primary/90 sm:text-sm">
              İlk 30 saniyedeki uzun girişi 15 saniyeye indir; izleyicilerin
              %18&apos;inin tekrar ettiği tempo şikâyetini doğrudan azalt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

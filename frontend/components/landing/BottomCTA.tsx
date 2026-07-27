import Link from "next/link";
import LandingIcon from "./LandingIcon";
import Reveal from "./Reveal";

export default function BottomCTA() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <Reveal className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl border border-accent-record/25 bg-bg-surface p-7 text-center shadow-2xl shadow-black/10 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-record/15 blur-[90px]" />
            <div className="landing-grid absolute inset-0 opacity-30" />
          </div>
          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-record/25 bg-accent-record/10 px-3 py-1.5 text-xs font-bold text-accent-record">
              <LandingIcon name="sparkles" className="h-4 w-4" />
              İlk raporunu şimdi oluştur
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-[-0.035em] text-text-primary sm:text-5xl">
              İzleyicinin ne istediğini tahmin etme. Gör.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
              Bir YouTube bağlantısı yeterli. YorumAI, dağınık geri bildirimi
              içerik stratejine yön veren net bir rapora dönüştürsün.
            </p>
            <Link
              href="/analyze"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent-record px-7 py-3.5 font-display text-sm font-bold text-[#17130b] shadow-xl shadow-accent-record/20 transition-all hover:-translate-y-0.5 hover:bg-accent-record/90 sm:w-auto"
            >
              Hemen Ücretsiz Dene
              <LandingIcon name="arrow" className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

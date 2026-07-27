import Link from "next/link";
import LandingIcon from "./LandingIcon";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border-subtle px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-record/30 bg-accent-record/10 text-accent-record">
              <LandingIcon name="message" className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold text-text-primary">
              Yorum<span className="text-accent-record">AI</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-6 text-text-muted">
            YouTube yorumlarını içerik üreticileri için net, ölçülebilir ve
            uygulanabilir büyüme içgörülerine dönüştürür.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-text-muted sm:items-end">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/analyze" className="min-h-11 content-center transition-colors hover:text-text-primary">
              Analiz aracı
            </Link>
          </div>
          <p className="text-xs">© 2026 YorumAI. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { whatsappDisplayNumber, whatsappUrl } from "@/lib/support";

export default function CreditsExhaustedState() {
  const message =
    "Merhaba, YorumAI için ek analiz kredisi almak istiyorum.";

  return (
    <div className="mx-auto my-6 w-full max-w-xl min-w-0 overflow-hidden rounded-2xl border border-accent-record/30 bg-accent-record/10 p-5 shadow-lg sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-record/30 bg-bg-base/60 text-xl">
          💬
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-base font-bold uppercase tracking-wide text-text-primary">
            Analiz hakkın bitti
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-text-muted sm:text-base">
            Ek analiz kredisi almak için WhatsApp üzerinden iletişime geçebilirsin.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              WhatsApp ile iletişime geç ({whatsappDisplayNumber()})
            </a>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border-subtle bg-bg-base px-4 text-sm font-semibold text-text-primary hover:border-accent-record/30"
            >
              Hesap oluştur (3 analiz hakkı)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

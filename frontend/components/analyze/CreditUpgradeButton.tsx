import Link from "next/link";
import { whatsappUrl } from "@/lib/support";

const CREDIT_MESSAGE =
  "Merhaba, YorumAI için ek analiz kredisi almak istiyorum.";

interface CreditUpgradeButtonProps {
  isGuest?: boolean;
  layout?: "side" | "inline";
}

export default function CreditUpgradeButton({
  isGuest = false,
  layout = "side",
}: CreditUpgradeButtonProps) {
  const whatsappLink = (
    <a
      href={whatsappUrl(CREDIT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      title="WhatsApp ile kredi al"
      className={
        layout === "side"
          ? "credit-upgrade-btn group relative flex w-11 flex-col items-center gap-2 rounded-2xl border border-accent-record/45 bg-gradient-to-b from-bg-surface via-bg-surface to-bg-base px-2 py-3.5 shadow-lg shadow-accent-record/15 transition-all hover:-translate-y-0.5 hover:border-accent-record/80 hover:shadow-accent-record/30"
          : "credit-upgrade-btn group inline-flex min-h-9 items-center gap-2 rounded-full border border-accent-record/45 bg-gradient-to-r from-bg-surface to-bg-base px-3.5 py-2 shadow-md shadow-accent-record/10 transition-all hover:border-accent-record/70 hover:shadow-accent-record/25"
      }
    >
      <span className="credit-upgrade-spark h-1.5 w-1.5 shrink-0 rounded-full bg-accent-record" />
      {layout === "side" ? (
        <>
          <span
            className="font-display text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent-record"
            style={{ writingMode: "vertical-rl" }}
          >
            Kredi Al
          </span>
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-[#25D366]" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 2C6.486 2 2 6.486 2 12c0 1.77.464 3.433 1.277 4.874L2 22l5.236-1.372A9.96 9.96 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18.182a8.16 8.16 0 01-4.126-1.12l-.295-.176-3.107.816.83-3.032-.193-.307A8.168 8.168 0 014.818 12c0-4.514 3.668-8.182 8.182-8.182S20.182 7.486 20.182 12 16.514 20.182 12 20.182z" />
          </svg>
        </>
      ) : (
        <>
          <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-accent-record">
            Kredi Al
          </span>
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-[#25D366]" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 2C6.486 2 2 6.486 2 12c0 1.77.464 3.433 1.277 4.874L2 22l5.236-1.372A9.96 9.96 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18.182a8.16 8.16 0 01-4.126-1.12l-.295-.176-3.107.816.83-3.032-.193-.307A8.168 8.168 0 014.818 12c0-4.514 3.668-8.182 8.182-8.182S20.182 7.486 20.182 12 16.514 20.182 12 20.182z" />
          </svg>
        </>
      )}

      <span className="pointer-events-none absolute -left-2 top-1/2 hidden -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-md border border-accent-record/25 bg-bg-surface px-2 py-1 text-[10px] text-text-muted opacity-0 shadow-md transition-opacity group-hover:opacity-100 sm:block">
        Analiz hakkın bitti
      </span>
    </a>
  );

  if (layout === "inline") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {whatsappLink}
        {isGuest && (
          <Link
            href="/register"
            className="text-[11px] font-medium text-text-muted underline-offset-2 hover:text-accent-record hover:underline"
          >
            veya kayıt ol
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {whatsappLink}
      {isGuest && (
        <Link
          href="/register"
          className="text-[9px] font-medium text-text-muted/80 hover:text-accent-record"
        >
          Kayıt ol
        </Link>
      )}
    </div>
  );
}

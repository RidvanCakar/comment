import type { QuotaInfo } from "@/lib/api";

export default function QuotaBanner({ quota }: { quota: QuotaInfo | null }) {
  if (!quota || quota.unlimited) return null;

  const remaining = quota.credits_remaining ?? 0;
  const total = quota.credits_total ?? remaining;
  const label = quota.is_guest ? "Misafir analiz hakkı" : "Kalan analiz kredin";

  return (
    <div className="mx-auto mb-5 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-surface/70 px-4 py-3">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent-record">{label}</p>
        <p className="mt-1 text-sm text-text-muted">
          {remaining > 0
            ? `${remaining} / ${total} analiz hakkın kaldı.`
            : "Analiz hakkın kalmadı."}
        </p>
      </div>
      {quota.is_guest && (
        <p className="text-xs text-text-muted">Kayıt olursan 3 analiz hakkı kazanırsın.</p>
      )}
    </div>
  );
}

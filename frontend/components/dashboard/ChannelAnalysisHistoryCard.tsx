import Link from "next/link";
import type { ChannelAnalysisHistoryEntry } from "@/lib/analysis-history";
import { formatAnalysisDate } from "@/lib/analysis-history";

export default function ChannelAnalysisHistoryCard({
  entry,
}: {
  entry: ChannelAnalysisHistoryEntry;
}) {
  const trendConfig = {
    IMPROVING: {
      text: "Yükseliş Trendinde",
      badge: "border-sentiment-positive/30 bg-sentiment-positive/10 text-sentiment-positive",
      icon: "↑",
    },
    DECLINING: {
      text: "Düşüş Trendinde",
      badge: "border-sentiment-negative/30 bg-sentiment-negative/10 text-sentiment-negative",
      icon: "↓",
    },
    STABLE: {
      text: "Dengeli / Durağan",
      badge: "border-border-subtle bg-bg-surface text-text-muted",
      icon: "→",
    },
  };

  const trend = trendConfig[entry.sentimentTrend] || trendConfig.STABLE;

  return (
    <div className="group block overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/80 transition-all hover:border-accent-record/35 hover:shadow-lg hover:shadow-accent-record/5">
      <article className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-accent-record/20 bg-accent-record/10 text-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-accent-record font-bold">SKOR</span>
            <span className="font-display text-xl font-extrabold text-text-primary">{entry.healthScore}</span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-accent-record/30 bg-accent-record/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent-record">
                Kanal Analizi
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${trend.badge}`}>
                <span>{trend.icon}</span>
                <span>{trend.text}</span>
              </span>
            </div>

            <h3 className="mt-1.5 font-display text-lg font-bold text-text-primary transition-colors group-hover:text-accent-record">
              {entry.channelTitle}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted sm:text-sm">
              {entry.summary}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border-subtle pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <span className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-text-muted">
            {formatAnalysisDate(entry.analyzedAt)}
          </span>

          <Link
            href={`/kanal-analizi?channel=${encodeURIComponent(entry.channelId || entry.channelTitle)}`}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-accent-record/30 bg-accent-record/10 px-3.5 text-xs font-bold text-accent-record transition-colors hover:bg-accent-record hover:text-[#17130b]"
          >
            <span>Raporu Gör</span>
            <span>→</span>
          </Link>
        </div>
      </article>
    </div>
  );
}

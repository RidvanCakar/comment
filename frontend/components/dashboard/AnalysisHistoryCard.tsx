import Link from "next/link";
import type { AnalysisHistoryEntry } from "@/lib/analysis-history";
import { formatAnalysisDate, youtubeThumbnail } from "@/lib/analysis-history";

export default function AnalysisHistoryCard({ entry }: { entry: AnalysisHistoryEntry }) {
  const detailHref = `/analizlerim/${encodeURIComponent(entry.videoId)}`;

  return (
    <Link
      href={detailHref}
      className="group block overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/80 transition-all hover:border-accent-record/35 hover:shadow-lg hover:shadow-accent-record/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-record/40"
    >
      <article className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
        <div className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-bg-base sm:w-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={youtubeThumbnail(entry.videoId)}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold text-text-primary transition-colors group-hover:text-accent-record">
                {entry.videoTitle}
              </h3>
              <p className="mt-1 text-sm text-text-muted">{entry.channelTitle}</p>
            </div>
            <span className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-text-muted">
              {formatAnalysisDate(entry.analyzedAt)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-sentiment-positive/10 px-3 py-1 text-sentiment-positive">
              Olumlu %{Math.round(entry.positivePercent)}
            </span>
            <span className="rounded-full bg-sentiment-negative/10 px-3 py-1 text-sentiment-negative">
              Olumsuz %{Math.round(entry.negativePercent)}
            </span>
            <span className="rounded-full bg-fill-muted px-3 py-1 text-text-muted">
              {entry.commentCount.toLocaleString("tr-TR")} yorum
            </span>
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-6 text-text-muted">{entry.summary}</p>

          <span className="mt-4 inline-flex min-h-10 items-center text-sm font-bold text-accent-record group-hover:underline">
            Analizi aç →
          </span>
        </div>
      </article>
    </Link>
  );
}

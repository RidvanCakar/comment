"use client";

import { useMemo, useState } from "react";
import {
  InsightSection,
  MetaPill,
  sentimentBadgeClass,
  sentimentLabel,
} from "@/components/analyze/InsightSection";

export interface HighlightMoment {
  timestamp_label: string;
  timestamp_seconds: number;
  total_engagement: number;
  comment_count: number;
  sample_comment: string;
  top_comment_engagement: number;
  sentiment?: string;
}

const COUNT_OPTIONS = [5, 10, 15] as const;

export default function HighlightMoments({
  moments,
  videoId,
}: {
  moments: HighlightMoment[];
  videoId: string;
}) {
  const [count, setCount] = useState<number>(10);
  const visible = useMemo(() => moments.slice(0, count), [moments, count]);

  if (!moments.length) return null;

  return (
    <InsightSection
      icon={
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-accent-record" aria-hidden>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      }
      iconClassName="border-accent-record/30 bg-accent-record/10"
      title="Öne Çıkan Anlar"
      subtitle="Videoda en çok etkileşim alan anlar"
      count={count}
      countOptions={[...COUNT_OPTIONS]}
      onCountChange={setCount}
    >
      {visible.map((moment) => {
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}&t=${moment.timestamp_seconds}s`;
        const sentiment = moment.sentiment || "neutral";

        return (
          <article
            key={`${moment.timestamp_seconds}-${moment.timestamp_label}`}
            className="rounded-xl border border-border-subtle bg-bg-base/45 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-surface px-3 py-1.5 font-mono text-sm font-bold text-text-primary transition-colors hover:border-accent-record/40 hover:text-accent-record"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-text-muted" aria-hidden>
                  <path d="M8 5v14l11-7L8 5Z" />
                </svg>
                {moment.timestamp_label}
                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-text-muted" aria-hidden>
                  <path
                    d="M14 5h5v5M10 14L19 5M15 5h4v4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              <MetaPill className={sentimentBadgeClass(sentiment)}>
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                  <path
                    d="M12 20s-6.5-4.5-6.5-9a4.5 4.5 0 019 0c0 4.5-6.5 9-6.5 9Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
                {sentimentLabel(sentiment)}
              </MetaPill>

              <MetaPill>
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                  <path
                    d="M7 8h10v7H11l-4 3V8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
                {moment.comment_count}
              </MetaPill>
            </div>

            <p className="mt-3 break-words text-sm leading-6 text-text-primary/90">
              {moment.sample_comment}
            </p>
          </article>
        );
      })}
    </InsightSection>
  );
}

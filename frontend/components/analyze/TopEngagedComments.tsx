"use client";

import { useMemo, useState } from "react";
import {
  InsightSection,
  MetaPill,
  avatarColorClass,
  avatarInitial,
  formatHandle,
  sentimentBadgeClass,
  sentimentLabel,
} from "@/components/analyze/InsightSection";

export interface EngagedComment {
  text: string;
  author?: string;
  like_count: number;
  reply_count: number;
  engagement_score: number;
  sentiment?: string;
  topic?: string;
}

const COUNT_OPTIONS = [5, 10, 15, 20] as const;

export default function TopEngagedComments({
  comments,
}: {
  comments: EngagedComment[];
}) {
  const [count, setCount] = useState<number>(10);
  const visible = useMemo(() => comments.slice(0, count), [comments, count]);

  if (!comments.length) return null;

  return (
    <InsightSection
      icon={
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-violet-400" aria-hidden>
          <path
            d="M5 6.5h14v9H9l-4 3v-12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      }
      iconClassName="border-violet-400/30 bg-violet-500/10"
      title="En Beğenilen Yorumlar"
      subtitle="Videodaki en çok beğeni alan yorumlar"
      count={count}
      countOptions={[...COUNT_OPTIONS]}
      onCountChange={setCount}
    >
      {visible.map((comment, index) => {
        const author = comment.author || "Anonim";
        const handle = formatHandle(author);
        const sentiment = comment.sentiment || "neutral";
        const topic = comment.topic || "Genel";

        return (
          <article
            key={`${index}-${comment.text.slice(0, 24)}`}
            className="rounded-xl border border-border-subtle bg-bg-base/45 p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${avatarColorClass(author)}`}
              >
                {avatarInitial(author)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold text-text-primary">{handle}</span>
                  <MetaPill className="border-border-subtle bg-bg-surface text-text-muted">
                    #{index + 1}
                  </MetaPill>
                </div>
              </div>
            </div>

            <p className="mt-3 break-words text-sm leading-6 text-text-primary/90">
              {comment.text}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <MetaPill>
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                    <path
                      d="M7 11v8a1 1 0 001 1h2v-9H7Zm4-1V9a2 2 0 012-2h1.5l1.2-2.4A1 1 0 0116.6 4H17a2 2 0 012 2v5h2.2a1 1 0 01.98 1.2l-1.2 6A2 2 0 0119 20h-8a2 2 0 01-2-2v-7Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {comment.like_count.toLocaleString("tr-TR")}
                </MetaPill>
                <MetaPill className={sentimentBadgeClass(sentiment)}>
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                    <path
                      d="M7 8h10M7 12h6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  {sentimentLabel(sentiment)}
                </MetaPill>
                <MetaPill className="border-accent-record/25 bg-accent-record/10 text-accent-record">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                    <path
                      d="M4 16l4-4 4 4 4-8 4 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {topic}
                </MetaPill>
              </div>
              {comment.reply_count > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                    <path
                      d="M7 7h10v7H11l-4 3V7Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {comment.reply_count} yanıt
                </span>
              )}
            </div>
          </article>
        );
      })}
    </InsightSection>
  );
}

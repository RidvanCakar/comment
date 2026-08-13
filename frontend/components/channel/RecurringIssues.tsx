"use client";

import React from "react";
import type { RecurringIssue } from "@/lib/api";

interface RecurringIssuesProps {
  issues: RecurringIssue[];
}

export default function RecurringIssues({ issues }: RecurringIssuesProps) {
  const hasIssues = issues && issues.length > 0;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 shadow-xl sm:p-8">
      <div className="flex items-center justify-between border-b border-border-subtle pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-sentiment-negative/30 bg-sentiment-negative/10 text-sentiment-negative">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </span>
            <h3 className="font-display text-lg font-bold text-text-primary sm:text-xl">
              Tekrar Eden Kronik Sorunlar
            </h3>
          </div>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            Birden fazla videoda izleyiciler tarafından sürekli dile getirilen şikayet ve teknik eksiklikler.
          </p>
        </div>

        {hasIssues && (
          <span className="rounded-md border border-sentiment-negative/30 bg-sentiment-negative/10 px-2.5 py-1 text-xs font-mono font-bold text-sentiment-negative">
            {issues.length} Tespit
          </span>
        )}
      </div>

      <div className="mt-6">
        {!hasIssues ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-bg-base/30 py-8 px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sentiment-positive/10 text-sentiment-positive">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-text-primary">
              Kronik veya Tekrar Eden Kritik Bir Sorun Tespit Edilmedi
            </p>
            <p className="mt-1 max-w-md text-xs text-text-muted">
              Son videolardaki izleyici geri bildirimleri genel olarak istikrarlı ve bağımsız temalara odaklanmış durumda.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-sentiment-negative/20 bg-sentiment-negative/5 p-4.5 transition-all hover:border-sentiment-negative/40 hover:bg-sentiment-negative/10"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-sentiment-negative/30 bg-sentiment-negative/15 px-2 py-0.5 text-xs font-mono font-bold text-sentiment-negative">
                      {issue.affected_videos_count} Videoda Görüldü
                    </span>
                    <span className="font-mono text-xs text-text-muted">#{idx + 1}</span>
                  </div>

                  <h4 className="mt-3 text-sm font-bold text-text-primary leading-snug">
                    {issue.issue}
                  </h4>
                </div>

                {issue.first_noticed_video && (
                  <div className="mt-3 border-t border-border-subtle/40 pt-2.5 text-xs text-text-muted">
                    <span className="font-medium text-text-primary/80">İlk Görüldüğü Video: </span>
                    <span className="italic">{issue.first_noticed_video}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

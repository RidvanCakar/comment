"use client";

import React from "react";
import type { RecurringIssue } from "@/lib/api";

interface SilentKillersCardProps {
  issues: RecurringIssue[];
}

export default function SilentKillersCard({ issues }: SilentKillersCardProps) {
  const hasIssues = issues && issues.length > 0;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-7 shadow-xl shadow-black/5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-5">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
            Modül 02 • Kronik Kusurlar
          </span>
          <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
            Kanalı Yavaşlatan Gizli Kusurlar & Kör Noktalar
          </h2>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            İzleyicilerin videolarda sürekli belirttiği prodüksiyon, ses, tempo veya kurgu şikayetleri.
          </p>
        </div>

        {hasIssues && (
          <span className="rounded-md border border-sentiment-negative/30 bg-sentiment-negative/10 px-3 py-1 font-mono text-xs font-bold text-sentiment-negative">
            {issues.length} Kritik Tespit
          </span>
        )}
      </div>

      <div className="mt-6">
        {!hasIssues ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-bg-base/40 py-8 px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sentiment-positive/10 text-sentiment-positive">
              ✓
            </div>
            <p className="mt-3 text-sm font-semibold text-text-primary">
              Kronik veya Tekrar Eden Kritik Bir Kusur Tespit Edilmedi
            </p>
            <p className="mt-1 max-w-md text-xs text-text-muted">
              Son videolardaki izleyici geri bildirimleri genel olarak dengeli ve bağımsız konulara odaklanmış durumda.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="group flex flex-col justify-between rounded-xl border border-border-subtle bg-bg-base/60 p-4 sm:p-5 transition-all hover:border-sentiment-negative/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md border border-border-subtle bg-bg-surface px-2.5 py-0.5 font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {issue.category || "Prodüksiyon & Kurgu"}
                    </span>
                    <span className="rounded bg-bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold text-text-muted">
                      {issue.affected_videos_count} Videoda Tekrar Etti
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-text-primary leading-snug">
                    {issue.issue}
                  </h3>

                  {issue.first_noticed_video && (
                    <p className="mt-1 text-[11px] text-text-muted truncate">
                      İlk Görüldüğü Video: <span className="italic">{issue.first_noticed_video}</span>
                    </p>
                  )}
                </div>

                {/* Urgent Fix Prescription */}
                <div className="mt-4 rounded-xl border border-sentiment-positive/20 bg-sentiment-positive/10 p-3 text-xs text-sentiment-positive">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-sentiment-positive block mb-1">
                    ⚡ Acil Stüdyo Reçetesi (Sonraki Video)
                  </span>
                  <p className="leading-relaxed text-text-primary/90">
                    {issue.urgent_fix || "Bu teknik veya kurgu noktasını bir sonraki videoda optimize ederek izleyici bağlılığını artırın."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

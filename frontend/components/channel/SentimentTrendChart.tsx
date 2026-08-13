"use client";

import React from "react";
import type { AnalyzedVideoReportItem } from "@/lib/api";

interface SentimentTrendChartProps {
  videos: AnalyzedVideoReportItem[];
}

export default function SentimentTrendChart({ videos }: SentimentTrendChartProps) {
  if (!videos || videos.length === 0) {
    return null;
  }

  // Videoları yayın tarihine göre kronolojik sıralayabiliriz veya mevcut listeyi gösterebiliriz
  const sortedVideos = [...videos].reverse(); // Eskiden yeniye doğru kronolojik akış

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 shadow-xl sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-record" />
            <h3 className="font-display text-lg font-bold text-text-primary sm:text-xl">
              Video Bazlı Duygu Dağılım Trendi
            </h3>
          </div>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            Son 5 videonun izleyici yorumlarındaki olumlu, olumsuz ve nötr duygu oranlarının değişimi.
          </p>
        </div>

        {/* Legend / Gösterge */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#8FB89B]" />
            <span className="text-text-primary">Olumlu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#D96C6C]" />
            <span className="text-text-primary">Olumsuz</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#6B7280]" />
            <span className="text-text-primary">Nötr</span>
          </div>
        </div>
      </div>

      {/* Video Dağılım Çubukları */}
      <div className="mt-6 space-y-5">
        {sortedVideos.map((video, idx) => {
          const sentiment = video.analysis?.sentiment_distribution || {
            positive_percent: 0,
            negative_percent: 0,
            neutral_percent: 100,
          };

          const pos = Math.max(0, sentiment.positive_percent || 0);
          const neg = Math.max(0, sentiment.negative_percent || 0);
          const neu = Math.max(0, sentiment.neutral_percent || 0);

          const formattedDate = video.published_at
            ? new Date(video.published_at).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : null;

          return (
            <div
              key={video.video_id || idx}
              className="group rounded-xl border border-border-subtle/70 bg-bg-base/40 p-4 transition-all hover:border-accent-record/30 hover:bg-bg-base/80"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-bg-surface font-mono text-xs font-bold text-accent-record">
                    #{idx + 1}
                  </span>
                  <p className="truncate text-sm font-semibold text-text-primary group-hover:text-accent-record transition-colors">
                    {video.title}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs text-text-muted">
                  {formattedDate && <span>{formattedDate}</span>}
                  <span>•</span>
                  <span>{video.comment_count_analyzed} yorum</span>
                </div>
              </div>

              {/* Stacked Bar */}
              <div className="mt-3">
                <div className="flex h-4 w-full overflow-hidden rounded-md bg-fill-muted">
                  {pos > 0 && (
                    <div
                      style={{ width: `${pos}%` }}
                      className="h-full bg-[#8FB89B] transition-all duration-700 ease-out relative group/bar"
                      title={`Olumlu: %${pos}`}
                    />
                  )}
                  {neg > 0 && (
                    <div
                      style={{ width: `${neg}%` }}
                      className="h-full bg-[#D96C6C] transition-all duration-700 ease-out relative group/bar"
                      title={`Olumsuz: %${neg}`}
                    />
                  )}
                  {neu > 0 && (
                    <div
                      style={{ width: `${neu}%` }}
                      className="h-full bg-[#6B7280] transition-all duration-700 ease-out relative group/bar"
                      title={`Nötr: %${neu}`}
                    />
                  )}
                </div>

                {/* Yüzde Değerleri */}
                <div className="mt-2 flex items-center justify-between text-xs font-mono text-text-muted">
                  <span className="text-[#8FB89B] font-semibold">%{pos} Olumlu</span>
                  <span className="text-[#D96C6C] font-semibold">%{neg} Olumsuz</span>
                  <span className="text-text-muted font-semibold">%{neu} Nötr</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

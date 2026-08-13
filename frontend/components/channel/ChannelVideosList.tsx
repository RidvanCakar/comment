"use client";

import React from "react";
import Link from "next/link";
import type { AnalyzedVideoReportItem } from "@/lib/api";

interface ChannelVideosListProps {
  videos: AnalyzedVideoReportItem[];
}

export default function ChannelVideosList({ videos }: ChannelVideosListProps) {
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 shadow-xl sm:p-8">
      <div className="flex items-center justify-between border-b border-border-subtle pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-record" />
            <h3 className="font-display text-lg font-bold text-text-primary sm:text-xl">
              Analiz Edilen Videolar ({videos.length})
            </h3>
          </div>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            Kanal sentezine dahil edilen son yayınlanan videoların özetleri.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, idx) => {
          const sentiment = video.analysis?.sentiment_distribution || {
            positive_percent: 0,
            negative_percent: 0,
            neutral_percent: 100,
          };
          const videoUrl = `https://www.youtube.com/watch?v=${video.video_id}`;
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
              className="flex flex-col justify-between overflow-hidden rounded-xl border border-border-subtle bg-bg-base/50 transition-all hover:border-accent-record/40 hover:shadow-lg"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-bg-base">
                  {video.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-text-muted">
                      <span>Video Görseli</span>
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
                    {video.comment_count_analyzed} Yorum
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                    {formattedDate && <span>{formattedDate}</span>}
                    {video.cached && (
                      <span className="rounded bg-fill-muted px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
                        Önbellek
                      </span>
                    )}
                  </div>

                  <h4
                    className="line-clamp-2 text-sm font-bold text-text-primary"
                    title={video.title}
                  >
                    {video.title}
                  </h4>

                  {/* Mini Sentiment Bar */}
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-[#8FB89B] font-semibold">
                      %{sentiment.positive_percent} Olumlu
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="text-[#D96C6C] font-semibold">
                      %{sentiment.negative_percent} Olumsuz
                    </span>
                  </div>

                  {video.analysis?.overall_summary && (
                    <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-text-muted">
                      {video.analysis.overall_summary}
                    </p>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="border-t border-border-subtle/60 p-3 bg-bg-base/70 flex items-center justify-between gap-2">
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  YouTube
                </a>

                <Link
                  href={`/analyze?url=${encodeURIComponent(videoUrl)}`}
                  className="inline-flex items-center gap-1 rounded-md border border-accent-record/30 bg-accent-record/10 px-2.5 py-1 text-xs font-semibold text-accent-record hover:bg-accent-record/20 transition-colors"
                >
                  Detaylı İncele
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

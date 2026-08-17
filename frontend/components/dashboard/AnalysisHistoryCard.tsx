"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { AnalysisHistoryEntry } from "@/lib/analysis-history";
import { formatAnalysisDate, youtubeThumbnail } from "@/lib/analysis-history";

interface AnalysisHistoryCardProps {
  entry: AnalysisHistoryEntry;
  isAdmin?: boolean;
  onDelete?: (videoId: string) => Promise<void> | void;
}

export default function AnalysisHistoryCard({
  entry,
  isAdmin = false,
  onDelete,
}: AnalysisHistoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const detailHref = `/analizlerim/${encodeURIComponent(entry.videoId)}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      setIsDeleting(true);
      if (onDelete) {
        await onDelete(entry.videoId);
      }
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(false);
  };

  return (
    <div className="group relative block overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/80 transition-all hover:border-accent-record/35 hover:shadow-lg hover:shadow-accent-record/5">
      <Link
        href={detailHref}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-record/40"
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

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-text-muted">
                  {formatAnalysisDate(entry.analyzedAt)}
                </span>

                {/* Sadece Admin İçin Silme Butonu */}
                {isAdmin && onDelete && (
                  <div
                    className="relative z-10 flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {confirmDelete ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? "Siliniyor..." : "Onayla"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelDelete}
                          className="rounded-lg border border-border-subtle bg-bg-base px-2 py-1 text-xs text-text-muted hover:text-text-primary transition cursor-pointer"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                        title="Yönetici: Analizi Veritabanından ve Geçmişten Sil"
                        aria-label="Analizi Sil"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
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
    </div>
  );
}

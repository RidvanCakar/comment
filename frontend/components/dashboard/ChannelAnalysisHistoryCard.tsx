"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ChannelAnalysisHistoryEntry } from "@/lib/analysis-history";
import { formatAnalysisDate } from "@/lib/analysis-history";

interface ChannelAnalysisHistoryCardProps {
  entry: ChannelAnalysisHistoryEntry;
  isAdmin?: boolean;
  onDelete?: (channelIdOrKey: string) => Promise<void> | void;
}

export default function ChannelAnalysisHistoryCard({
  entry,
  isAdmin = false,
  onDelete,
}: ChannelAnalysisHistoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rawTrend = String(entry.sentimentTrend || "dengeli").toLowerCase();
  const isImproving = rawTrend.includes("yuksel") || rawTrend === "improving";
  const isDeclining = rawTrend.includes("dusus") || rawTrend === "declining";

  const trend = isImproving
    ? {
        text: "Yükselişte",
        badge: "border-sentiment-positive/30 bg-sentiment-positive/10 text-sentiment-positive",
        icon: "↑",
      }
    : isDeclining
    ? {
        text: "Düşüş Eğiliminde",
        badge: "border-sentiment-negative/30 bg-sentiment-negative/10 text-sentiment-negative",
        icon: "↓",
      }
    : {
        text: "Dengeli / Durağan",
        badge: "border-border-subtle bg-bg-surface text-text-muted",
        icon: "→",
      };

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
        await onDelete(entry.channelId || entry.id || entry.channelTitle);
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
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-text-muted">
              {formatAnalysisDate(entry.analyzedAt)}
            </span>

            {/* Sadece Admin İçin Silme Butonu */}
            {isAdmin && onDelete && (
              <div className="flex items-center gap-1">
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
                    title="Yönetici: Kanal Analizini Veritabanından ve Geçmişten Sil"
                    aria-label="Kanal Analizini Sil"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

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

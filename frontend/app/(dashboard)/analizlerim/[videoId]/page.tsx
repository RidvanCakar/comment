"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AnalysisResultsView from "@/components/analyze/AnalysisResultsView";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  findAnalysisEntry,
  formatAnalysisDate,
  youtubeThumbnail,
  type AnalysisHistoryEntry,
} from "@/lib/analysis-history";
import { requestVideoAnalysis, type AnalyzeResult } from "@/lib/analyze-request";

function resolveEntry(
  userId: string | number,
  videoId: string,
): AnalysisHistoryEntry | null {
  if (!videoId) return null;
  const stored = findAnalysisEntry(userId, videoId);
  if (stored) return stored;
  return {
    id: videoId,
    videoId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    videoTitle: "Video analizi",
    channelTitle: "",
    commentCount: 0,
    summary: "",
    positivePercent: 0,
    negativePercent: 0,
    neutralPercent: 0,
    analyzedAt: new Date().toISOString(),
  };
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const videoId = String(params.videoId || "");
  const { user } = useAuth();
  const entry = useMemo(
    () => (user ? resolveEntry(user.id, videoId) : null),
    [user, videoId],
  );
  const [data, setData] = useState<AnalyzeResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadStarted = useRef(false);

  const loadAnalysis = useCallback(async () => {
    if (!entry) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await requestVideoAnalysis(entry.videoUrl, false);
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Analiz yüklenemedi.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [entry]);

  useEffect(() => {
    if (!user || !videoId) return;
    if (!entry) {
      setIsLoading(false);
      return;
    }
    if (loadStarted.current) return;
    loadStarted.current = true;
    void loadAnalysis();
  }, [user, videoId, entry, loadAnalysis]);

  if (!user) return null;

  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl py-8 text-center">
        <h1 className="font-display text-2xl font-bold">Geçersiz analiz</h1>
        <Link
          href="/analizlerim"
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent-record px-5 text-sm font-bold text-[#17130b]"
        >
          Analizlerime dön
        </Link>
      </div>
    );
  }

  const title = data?.video_title || entry.videoTitle;
  const channel = data?.channel_title || entry.channelTitle;
  const analyzedAt = data?.created_at || entry.analyzedAt;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/analizlerim"
            className="inline-flex min-h-10 items-center text-sm font-semibold text-text-muted transition-colors hover:text-accent-record"
          >
            ← Analizlerim
          </Link>
          <h1 className="mt-3 break-words font-display text-2xl font-extrabold sm:text-3xl">
            {title}
          </h1>
          {channel && <p className="mt-1 text-text-muted">{channel}</p>}
          <p className="mt-2 font-mono text-xs uppercase tracking-wider text-text-muted">
            {formatAnalysisDate(analyzedAt)}
          </p>
        </div>

        <a
          href={entry.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-40 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-base sm:w-48"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={youtubeThumbnail(entry.videoId)}
            alt=""
            className="aspect-video w-full object-cover"
          />
        </a>
      </div>

      <div className="mt-8">
        {isLoading && <LoadingState />}

        {error && !isLoading && (
          <ErrorState message={error} onRetry={() => void loadAnalysis()} />
        )}

        {!isLoading && !error && data && <AnalysisResultsView data={data} />}
      </div>
    </div>
  );
}

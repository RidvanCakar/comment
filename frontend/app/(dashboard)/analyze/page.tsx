"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AnalyzeForm from "@/components/AnalyzeForm";
import CreditsExhaustedState from "@/components/analyze/CreditsExhaustedState";
import CreditUpgradeButton from "@/components/analyze/CreditUpgradeButton";
import AnalysisResultsView from "@/components/analyze/AnalysisResultsView";
import QuotaBanner from "@/components/analyze/QuotaBanner";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiRequest, isCreditsExhausted, type QuotaInfo } from "@/lib/api";
import { requestVideoAnalysis, type AnalyzeResult } from "@/lib/analyze-request";
import { saveAnalysisHistory } from "@/lib/analysis-history";

export default function AnalyzePage() {
  const { user, refresh } = useAuth();
  const searchParams = useSearchParams();
  const prefilledUrl = searchParams.get("url") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForServer, setWaitingForServer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [data, setData] = useState<AnalyzeResult | null>(null);
  const [lastUrl, setLastUrl] = useState("");
  const analyzeInFlight = useRef(false);

  const loadQuota = useCallback(async () => {
    try {
      const next = await apiRequest<QuotaInfo>("/credits/quota", { cache: "no-store" });
      setQuota(next);
    } catch {
      setQuota(null);
    }
  }, []);

  useEffect(() => {
    void loadQuota();
  }, [loadQuota, user]);

  const handleAnalyze = async (videoUrl: string, forceRefresh: boolean) => {
    if (analyzeInFlight.current) return;
    analyzeInFlight.current = true;
    setIsLoading(true);
    setWaitingForServer(false);
    setError(null);
    setCreditsExhausted(false);
    setData(null);
    setLastUrl(videoUrl);

    try {
      const result = await requestVideoAnalysis(
        videoUrl,
        forceRefresh,
        () => setWaitingForServer(true),
      );
      setData(result);
      if (result.quota) setQuota(result.quota);
      await refresh().catch(() => undefined);
      if (user) {
        saveAnalysisHistory(user.id, {
          videoId: result.video_id,
          videoUrl,
          videoTitle: result.video_title,
          channelTitle: result.channel_title,
          commentCount: result.comment_count_analyzed,
          summary: result.analysis.overall_summary,
          positivePercent: result.analysis.sentiment_distribution.positive_percent,
          negativePercent: result.analysis.sentiment_distribution.negative_percent,
          neutralPercent: result.analysis.sentiment_distribution.neutral_percent,
          analyzedAt: result.created_at || new Date().toISOString(),
        });
      }
    } catch (err: unknown) {
      if (isCreditsExhausted(err)) {
        setCreditsExhausted(true);
        setError(null);
        void loadQuota();
      } else {
        const message =
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
        setError(message);
      }
    } finally {
      setWaitingForServer(false);
      setIsLoading(false);
      analyzeInFlight.current = false;
    }
  };

  const retryAnalysis = () => {
    if (lastUrl) {
      handleAnalyze(lastUrl, false);
    }
  };

  const showCreditUpgrade = Boolean(
    quota &&
      !quota.unlimited &&
      ((quota.credits_remaining ?? 0) <= 0 || creditsExhausted),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Üst Başlık & Açıklama */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent-record/40 bg-accent-record/15 text-accent-record">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Video Yorum Analizi
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-text-muted sm:text-sm">
            YouTube video bağlantısını yapıştırın; duygu dağılımını, izleyici temalarını ve somut önerileri keşfedin.
          </p>
        </div>

        {quota && (
          <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-surface px-3.5 py-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-accent-record" />
            <span className="text-text-muted">Mevcut Kredi:</span>
            <strong className="font-mono text-text-primary">
              {quota.unlimited ? "Sınırsız" : quota.credits_remaining ?? 0}
            </strong>
          </div>
        )}
      </div>

      {/* Form Alanı */}
      <section className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-7 shadow-xl">
        {showCreditUpgrade && (
          <div className="mb-4 flex justify-center sm:hidden animate-fade-in">
            <CreditUpgradeButton isGuest={quota?.is_guest} layout="inline" />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            {!showCreditUpgrade && <QuotaBanner quota={quota} />}
            <AnalyzeForm
              onSubmit={handleAnalyze}
              isLoading={isLoading}
              initialUrl={prefilledUrl}
              creditsBlocked={showCreditUpgrade}
            />
          </div>

          {showCreditUpgrade && (
            <aside className="hidden shrink-0 animate-fade-in sm:block">
              <div className="sticky top-24 pt-2">
                <CreditUpgradeButton isGuest={quota?.is_guest} layout="side" />
              </div>
            </aside>
          )}
        </div>
      </section>

      {creditsExhausted && !showCreditUpgrade && (
        <section className="min-w-0 animate-fade-in">
          <CreditsExhaustedState />
        </section>
      )}

      {isLoading && (
        <section aria-live="polite" className="min-w-0 animate-fade-in">
          <LoadingState
            message={
              waitingForServer
                ? "Bağlantı kesildi; analiz sunucuda tamamlanıyor olabilir. Sonuç önbellekten alınmaya çalışılıyor..."
                : undefined
            }
          />
        </section>
      )}

      {error && !isLoading && (
        <section aria-live="assertive" className="min-w-0 animate-fade-in">
          <ErrorState message={error} onRetry={lastUrl ? retryAnalysis : undefined} />
        </section>
      )}

      {data && !isLoading && !error && (
        <section className="min-w-0 animate-fade-in">
          <AnalysisResultsView data={data} />
        </section>
      )}
    </div>
  );
}

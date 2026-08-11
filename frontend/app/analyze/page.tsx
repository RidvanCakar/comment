"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AnalyzeForm from "@/components/AnalyzeForm";
import CreditsExhaustedState from "@/components/analyze/CreditsExhaustedState";
import CreditUpgradeButton from "@/components/analyze/CreditUpgradeButton";
import AnalysisResultsView from "@/components/analyze/AnalysisResultsView";
import QuotaBanner from "@/components/analyze/QuotaBanner";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import ThemeToggle from "@/components/ThemeToggle";
import AuthNav from "@/components/auth/AuthNav";
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
      // Sunucuda önbelleğe alınmış sonuç varsa tekrar kredi düşmesin.
      handleAnalyze(lastUrl, false);
    }
  };

  const showCreditUpgrade = Boolean(
    quota &&
      !quota.unlimited &&
      ((quota.credits_remaining ?? 0) <= 0 || creditsExhausted),
  );

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-bg-base text-text-primary selection:bg-accent-record/20 selection:text-accent-record">
      <header className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-border-subtle bg-bg-base/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <Link
          href="/"
          aria-label="YorumAI ana sayfa"
          className="flex min-w-0 items-center gap-2 sm:gap-3"
        >
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-record/30 bg-accent-record/10 text-accent-record">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
              <path d="M5 6.5h14v9H9l-4 3v-12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-extrabold tracking-tight text-text-primary sm:text-lg">
              Yorum<span className="text-accent-record">AI</span>
            </span>
            <span className="block truncate text-xs text-text-muted">
              YouTube yorum analiz platformu
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user && (
            <Link
              href="/dashboard"
              className="hidden min-h-11 items-center rounded-lg border border-border-subtle px-3 text-sm font-semibold text-text-muted transition-colors hover:border-accent-record/30 hover:text-text-primary sm:flex"
            >
              Panel
            </Link>
          )}
          <Link
            href="/"
            className="hidden min-h-11 items-center px-3 text-sm font-medium text-text-muted transition-colors hover:text-text-primary sm:flex"
          >
            Tanıtım sayfası
          </Link>
          <ThemeToggle />
          <AuthNav />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12">
        <section className="min-w-0">
          <div className="mx-auto mb-6 max-w-3xl text-center">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-record">
              Ücretsiz analiz
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">
              Videonun yorumlarını içgörüye dönüştür
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
              YouTube bağlantısını yapıştır; YorumAI duygu dağılımını, gerçek
              temaları ve bir sonraki videon için somut öneriyi hazırlasın.
            </p>
          </div>

          {showCreditUpgrade && (
            <div className="mb-4 flex justify-center sm:hidden animate-fade-in">
              <CreditUpgradeButton isGuest={quota?.is_guest} layout="inline" />
            </div>
          )}

          <div className="mx-auto flex max-w-3xl items-start justify-center gap-3 sm:gap-4">
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
                <div className="sticky top-24 pt-8">
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
          <section className="min-w-0 animate-fade-in">
            <LoadingState
              message={
                waitingForServer
                  ? "Bağlantı kesildi; analiz sunucuda tamamlanıyor olabilir. Sonuç önbellekten alınmaya çalışılıyor..."
                  : undefined
              }
            />
          </section>
        )}

        {error && !creditsExhausted && (
          <section className="min-w-0 animate-fade-in">
            <ErrorState message={error} onRetry={retryAnalysis} />
          </section>
        )}

        {!isLoading && !error && !data && (
          <section className="min-w-0 animate-fade-in">
            <div className="mx-auto my-4 max-w-xl rounded-sm border border-dashed border-border-subtle bg-bg-surface/40 p-8 text-center sm:my-8 sm:p-16">
              <div className="mb-4 font-mono text-lg tracking-wider text-text-muted sm:text-xl">
                [--- . --- . ---]
              </div>
              <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-text-primary sm:text-base">
                Analiz bekleniyor
              </h2>
              <p className="mx-auto max-w-sm px-1 font-sans text-sm leading-relaxed text-text-muted sm:text-base">
                Yukarıya bir YouTube video URL&apos;si girin ve yorum analizini
                başlatın.
              </p>
            </div>
          </section>
        )}

        {!isLoading && !error && data && (
          <section className="min-w-0">
            <AnalysisResultsView data={data} />
          </section>
        )}
      </main>

      <footer className="mt-auto border-t border-border-subtle px-4 py-6 text-center font-sans text-sm text-text-muted sm:py-8">
        <p>© 2026 YorumAI — YouTube yorumlarını anlamlı içgörülere dönüştürür.</p>
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import React, { useState } from "react";
import AnalyzeForm from "@/components/AnalyzeForm";
import SentimentTabs from "@/components/SentimentTabs";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import ThemeToggle from "@/components/ThemeToggle";
import LandingIcon from "@/components/landing/LandingIcon";
import PdfDownloadButton from "@/components/pdf/PdfDownloadButton";
import type { PdfReportData } from "@/components/pdf/ReportDocument";

interface AnalyzeResponse {
  video_id: string;
  video_title: string;
  channel_title: string;
  comment_count_analyzed: number;
  cached: boolean;
  created_at: string | null;
  analysis: {
    sentiment_distribution: {
      positive_percent: number;
      negative_percent: number;
      neutral_percent: number;
    };
    topics: {
      topic: string;
      percent: number;
      sentiment: "positive" | "negative" | "neutral" | "mixed";
      insight: string;
      example_comments?: string[];
    }[];
    overall_summary: string;
    top_recommendation:
      | string
      | {
          insight: string;
          action: string;
          expected_impact: string;
        };
  };
}

function normalizeRecommendation(
  rec: AnalyzeResponse["analysis"]["top_recommendation"]
): { insight: string; action: string; expected_impact: string } {
  if (typeof rec === "string") {
    return { insight: "", action: rec, expected_impact: "" };
  }
  return {
    insight: rec?.insight || "",
    action: rec?.action || "",
    expected_impact: rec?.expected_impact || "",
  };
}

function toPdfReportData(data: AnalyzeResponse): PdfReportData {
  const recommendation = normalizeRecommendation(
    data.analysis.top_recommendation
  );

  return {
    videoTitle: data.video_title,
    channelTitle: data.channel_title,
    analyzedCommentCount: data.comment_count_analyzed,
    analysisDate: data.created_at,
    summary: data.analysis.overall_summary,
    sentiment: {
      positive: data.analysis.sentiment_distribution.positive_percent,
      negative: data.analysis.sentiment_distribution.negative_percent,
      neutral: data.analysis.sentiment_distribution.neutral_percent,
    },
    topics: data.analysis.topics,
    recommendation: {
      insight: recommendation.insight,
      action: recommendation.action,
      expectedImpact: recommendation.expected_impact,
    },
  };
}

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [lastUrl, setLastUrl] = useState("");

  const handleAnalyze = async (videoUrl: string, forceRefresh: boolean) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setLastUrl(videoUrl);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: videoUrl,
          force_refresh: forceRefresh,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Sunucu hatası: ${res.statusText}`);
      }

      const result: AnalyzeResponse = await res.json();
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const retryAnalysis = () => {
    if (lastUrl) {
      handleAnalyze(lastUrl, true);
    }
  };

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
          <Link
            href="/"
            className="hidden min-h-11 items-center px-3 text-sm font-medium text-text-muted transition-colors hover:text-text-primary sm:flex"
          >
            Tanıtım sayfası
          </Link>
          <ThemeToggle />
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
          <AnalyzeForm onSubmit={handleAnalyze} isLoading={isLoading} />
        </section>

        {isLoading && (
          <section className="min-w-0 animate-fade-in">
            <LoadingState />
          </section>
        )}

        {error && (
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
          <section className="flex min-w-0 flex-col gap-8 animate-fade-in sm:gap-10">
            <div className="relative flex min-w-0 flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 shadow-xl shadow-black/5 backdrop-blur-xl md:flex-row md:items-center sm:p-7">
              <div className="pointer-events-none absolute -left-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-accent-record/10 blur-3xl" />
              <div className="relative flex w-full min-w-0 items-start gap-4 md:w-auto">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-record/30 bg-accent-record/10 text-accent-record">
                  <LandingIcon name="message" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
                    Analiz edilen video
                  </span>
                  <h2 className="mt-1 break-words font-display text-lg font-extrabold tracking-tight text-text-primary sm:text-xl">
                    {data.video_title}
                  </h2>
                  <span className="mt-1 block break-words text-sm font-medium text-text-muted">
                    {data.channel_title}
                  </span>
                </div>
              </div>

              <div className="relative grid w-full grid-cols-2 gap-2 font-sans text-sm md:w-auto sm:flex sm:items-stretch sm:gap-3">
                <MetricBox
                  label="Toplam yorum"
                  value={data.comment_count_analyzed.toLocaleString("tr-TR")}
                  icon="message"
                />
                <MetricBox
                  label="Analiz tarihi"
                  value={
                    data.created_at
                      ? new Date(data.created_at).toLocaleDateString("tr-TR")
                      : "—"
                  }
                  icon="clock"
                />
                <PdfDownloadButton data={toPdfReportData(data)} />
                {data.cached && (
                  <div className="col-span-2 flex min-h-14 items-center justify-center gap-2 rounded-xl border border-sentiment-positive/25 bg-sentiment-positive/10 px-4 text-xs font-bold uppercase tracking-widest text-sentiment-positive sm:col-span-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-sentiment-positive" />
                    Önbellek
                  </div>
                )}
              </div>
            </div>

            <div className="relative min-w-0 overflow-hidden rounded-2xl border border-accent-record/25 bg-gradient-to-br from-accent-record/10 via-bg-surface to-bg-surface p-5 shadow-xl shadow-black/5 sm:p-7">
              <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-accent-record/10 blur-3xl" />
              <div className="relative flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-record/30 bg-accent-record/10 text-accent-record">
                  <LandingIcon name="clipboard" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
                    Yönetici özeti
                  </span>
                  <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
                    İzleyicinin videoya verdiği genel tepki
                  </h2>
                  <p className="mt-4 max-w-5xl break-words text-sm leading-7 text-text-primary/90 sm:text-base sm:leading-8">
                    {data.analysis.overall_summary}
                  </p>
                </div>
              </div>
            </div>

            <SentimentTabs
              topics={data.analysis.topics}
              positivePercent={data.analysis.sentiment_distribution.positive_percent}
              negativePercent={data.analysis.sentiment_distribution.negative_percent}
              neutralPercent={data.analysis.sentiment_distribution.neutral_percent}
            />

            {(() => {
              const rec = normalizeRecommendation(data.analysis.top_recommendation);
              return (
                <div className="relative flex min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border border-accent-record/35 bg-gradient-to-br from-accent-record/16 via-bg-surface to-bg-surface p-5 shadow-2xl shadow-accent-record/5 sm:p-7">
                  <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-accent-record/12 blur-[70px]" />
                  <div className="relative flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent-record/40 bg-accent-record/15 text-accent-record shadow-lg shadow-accent-record/10">
                      <LandingIcon name="target" className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
                        Öncelikli aksiyon
                      </span>
                      <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
                        Bir sonraki video için kritik tavsiye
                      </h2>
                    </div>
                  </div>

                  <div className="relative grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3 sm:gap-4">
                    {rec.insight && <RecommendationPart label="Neden?" text={rec.insight} />}
                    {rec.action && <RecommendationPart label="Ne yapmalısın?" text={rec.action} accent />}
                    {rec.expected_impact && <RecommendationPart label="Ne kazanırsın?" text={rec.expected_impact} positive />}
                  </div>
                </div>
              );
            })()}
          </section>
        )}
      </main>

      <footer className="mt-auto border-t border-border-subtle px-4 py-6 text-center font-sans text-sm text-text-muted sm:py-8">
        <p>© 2026 YorumAI — YouTube yorumlarını anlamlı içgörülere dönüştürür.</p>
      </footer>
    </div>
  );
}

function MetricBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof LandingIcon>["name"];
}) {
  return (
    <div className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-border-subtle bg-bg-base/50 px-3.5 py-2.5 sm:min-w-[9rem]">
      <LandingIcon name={icon} className="h-4 w-4 shrink-0 text-text-muted" />
      <div className="min-w-0">
        <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <span className="mt-0.5 block truncate font-mono text-sm font-bold text-text-primary">
          {value}
        </span>
      </div>
    </div>
  );
}

function RecommendationPart({
  label,
  text,
  accent = false,
  positive = false,
}: {
  label: string;
  text: string;
  accent?: boolean;
  positive?: boolean;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 rounded-xl border p-4 sm:p-5 ${accent ? "border-accent-record/35 bg-accent-record/12 shadow-lg shadow-accent-record/5" : "border-border-subtle bg-bg-base/45"}`}>
      <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${accent ? "text-accent-record" : positive ? "text-sentiment-positive" : "text-text-muted"}`}>
        {label}
      </span>
      <p className={`break-words text-sm leading-6 text-text-primary sm:text-base sm:leading-7 ${accent ? "font-display font-semibold" : "font-sans"}`}>
        {text}
      </p>
    </div>
  );
}

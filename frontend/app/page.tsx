"use client";

import React, { useState } from "react";
import AnalyzeForm from "@/components/AnalyzeForm";
import SentimentBar from "@/components/SentimentBar";
import TopicMeter from "@/components/TopicMeter";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import ThemeToggle from "@/components/ThemeToggle";

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
      sentiment: "positive" | "negative" | "mixed";
      insight: string;
      example_comments?: string[];
    }[];
    overall_summary: string;
    top_recommendation: string;
  };
}

export default function Home() {
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
        headers: {
          "Content-Type": "application/json",
        },
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
      const message = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
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
    <div className="flex flex-col min-h-screen bg-bg-base text-text-primary selection:bg-accent-record/20 selection:text-accent-record overflow-x-hidden">
      <header className="border-b border-border-subtle bg-bg-base/80 backdrop-blur-md sticky top-0 z-50 py-3 px-4 sm:py-4 sm:px-6 flex justify-between items-center gap-3 select-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative w-3 h-3 flex items-center justify-center shrink-0">
            <span className="absolute w-2 h-2 bg-accent-record rounded-full animate-record-dot inline-block" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-sm sm:text-base tracking-widest text-text-primary uppercase truncate">
              Comment Analyse
            </h1>
            <p className="text-xs font-sans text-text-muted tracking-wide mt-0.5 truncate">
              Yorum analiz sistemi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 font-sans text-xs text-text-muted bg-bg-surface px-3 py-2 rounded-sm border border-border-subtle">
            <span className="w-1.5 h-1.5 bg-sentiment-positive rounded-full animate-pulse" />
            Online
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 sm:gap-10 min-w-0">
        <section className="min-w-0">
          <AnalyzeForm onSubmit={handleAnalyze} isLoading={isLoading} />
        </section>

        {isLoading && (
          <section className="animate-fade-in min-w-0">
            <LoadingState />
          </section>
        )}

        {error && (
          <section className="animate-fade-in min-w-0">
            <ErrorState message={error} onRetry={retryAnalysis} />
          </section>
        )}

        {!isLoading && !error && !data && (
          <section className="animate-fade-in min-w-0">
            <div className="border border-dashed border-border-subtle bg-bg-surface/40 p-8 sm:p-16 text-center rounded-sm max-w-xl mx-auto my-4 sm:my-8">
              <div className="font-mono text-lg sm:text-xl text-text-muted mb-4 tracking-wider">
                [--- . --- . ---]
              </div>
              <h3 className="font-display font-bold text-sm sm:text-base tracking-widest text-text-primary uppercase mb-2">
                Analiz bekleniyor
              </h3>
              <p className="text-text-muted text-sm sm:text-base font-sans leading-relaxed max-w-sm mx-auto px-1">
                Yukarıya bir YouTube video URL&apos;si girin ve yorum analizini başlatın.
              </p>
            </div>
          </section>
        )}

        {!isLoading && !error && data && (
          <section className="flex flex-col gap-6 sm:gap-8 animate-fade-in min-w-0">
            <div className="bg-bg-surface border border-border-subtle rounded-sm p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden min-w-0">
              <div className="absolute top-0 left-0 h-full w-[2px] bg-accent-record" />

              <div className="flex flex-col gap-1.5 min-w-0 w-full md:w-auto pl-1">
                <span className="font-sans text-xs text-accent-record tracking-widest uppercase">
                  Analiz edilen video
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg text-text-primary tracking-wide break-words">
                  {data.video_title}
                </h3>
                <span className="text-sm text-text-muted font-sans font-medium break-words">
                  Kanal: <span className="text-text-primary">{data.channel_title}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 font-sans text-sm items-stretch w-full md:w-auto">
                <div className="bg-bg-base border border-border-subtle px-3 py-2 rounded-sm flex flex-col min-w-[7.5rem] flex-1 sm:flex-none">
                  <span className="text-text-muted text-xs uppercase tracking-wider">Yorum sayısı</span>
                  <span className="font-bold text-text-primary text-base">
                    {data.comment_count_analyzed}
                  </span>
                </div>
                <div className="bg-bg-base border border-border-subtle px-3 py-2 rounded-sm flex flex-col min-w-[7.5rem] flex-1 sm:flex-none">
                  <span className="text-text-muted text-xs uppercase tracking-wider">Kayıt tarihi</span>
                  <span className="font-bold text-text-primary text-sm sm:text-base break-all">
                    {data.created_at
                      ? new Date(data.created_at).toISOString().slice(0, 19).replace("T", " ")
                      : "—"}
                  </span>
                </div>
                {data.cached && (
                  <div className="bg-sentiment-positive/10 border border-sentiment-positive/20 px-3 py-2.5 rounded-sm flex items-center justify-center gap-1.5 text-sentiment-positive font-bold tracking-widest uppercase text-xs min-h-11">
                    <span className="w-1.5 h-1.5 bg-sentiment-positive rounded-full animate-ping" />
                    Önbellek
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6 min-w-0">
              <div className="md:col-span-3 bg-bg-surface border border-border-subtle p-5 sm:p-6 rounded-sm flex flex-col justify-between min-w-0 overflow-hidden">
                <div className="min-w-0">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-4 pb-2 border-b border-border-subtle">
                    <h4 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary">
                      Özet rapor
                    </h4>
                    <span className="font-sans text-xs text-text-muted">Summary</span>
                  </div>
                  <p className="text-sm sm:text-base text-text-primary/95 leading-relaxed font-sans break-words">
                    {data.analysis.overall_summary}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 min-w-0">
                <SentimentBar
                  positive={data.analysis.sentiment_distribution.positive_percent}
                  neutral={data.analysis.sentiment_distribution.neutral_percent}
                  negative={data.analysis.sentiment_distribution.negative_percent}
                />
              </div>
            </div>

            {/* Kritik tavsiye — mobilde görsel ağırlığını korur */}
            <div className="bg-gradient-to-br from-accent-record/15 via-accent-record/10 to-accent-record/5 border-2 border-accent-record/35 rounded-sm p-5 sm:p-7 flex flex-col sm:flex-row items-start gap-4 sm:gap-5 relative overflow-hidden min-w-0 shadow-[0_0_40px_-12px_rgba(242,169,59,0.35)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-record/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded border border-accent-record/40 bg-accent-record/15 flex items-center justify-center text-accent-record text-2xl font-bold shrink-0">
                💡
              </div>
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <span className="font-display text-sm sm:text-base text-accent-record tracking-widest uppercase font-bold">
                  Bir sonraki video için kritik tavsiye
                </span>
                <p className="text-base sm:text-lg font-display font-semibold tracking-wide text-text-primary leading-relaxed break-words">
                  {data.analysis.top_recommendation}
                </p>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-border-subtle pb-2">
                <h4 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary">
                  Konu kategorileri
                </h4>
                <span className="font-sans text-xs text-text-muted uppercase">
                  {data.analysis.topics.length} kategori
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {data.analysis.topics.map((t, idx) => (
                  <TopicMeter
                    key={idx}
                    topic={t.topic}
                    percent={t.percent}
                    sentiment={t.sentiment}
                    insight={t.insight}
                    exampleComments={t.example_comments}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border-subtle py-6 sm:py-8 text-center text-sm font-sans text-text-muted tracking-wide mt-auto select-none px-4">
        <p>© 2026 Yorum — Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}

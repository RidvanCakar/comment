"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  analyzeChannel,
  ApiError,
  isCreditsExhausted,
  type ChannelAnalyzeResult,
} from "@/lib/api";
import {
  saveChannelAnalysisHistory,
  findChannelAnalysisEntry,
} from "@/lib/analysis-history";
import ChannelHealthCard from "@/components/channel/ChannelHealthCard";
import SentimentTrendChart from "@/components/channel/SentimentTrendChart";
import RecurringIssues from "@/components/channel/RecurringIssues";
import ChannelStrategyCard from "@/components/channel/ChannelStrategyCard";
import ChannelVideosList from "@/components/channel/ChannelVideosList";

export default function ChannelAnalysisPage() {
  const { user, refresh } = useAuth();
  const searchParams = useSearchParams();
  const prefilledChannel = searchParams.get("channel") || "";
  const [channelUrl, setChannelUrl] = useState(prefilledChannel);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [result, setResult] = useState<ChannelAnalyzeResult | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  // URL'den gelen kanal varsa ve hafızada kayıtlıysa yükle
  useEffect(() => {
    if (!prefilledChannel) return;
    setChannelUrl(prefilledChannel);
    if (user) {
      const existing = findChannelAnalysisEntry(user.id, prefilledChannel);
      if (existing) {
        setResult({
          channel_id: existing.channelId,
          channel_title: existing.channelTitle,
          video_count: existing.videoCount,
          channel_report: existing.report,
          analyzed_videos: existing.analyzedVideos,
          created_at: existing.analyzedAt,
        });
      }
    }
  }, [prefilledChannel, user]);

  // Stepped loader adımları simülasyonu
  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;

    if (loading) {
      setLoadingStep(1);
      timer1 = setTimeout(() => {
        setLoadingStep(2);
      }, 5000);

      timer2 = setTimeout(() => {
        setLoadingStep(3);
      }, 15000);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [loading]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    let clean = channelUrl.trim();
    if (clean.startsWith("@http://") || clean.startsWith("@https://")) {
      clean = clean.slice(1);
    }
    if (!clean || loading) return;

    setError(null);
    setLoading(true);

    try {
      const data = await analyzeChannel(clean, forceRefresh, 5);
      setResult(data);
      await refresh().catch(() => undefined);

      if (user) {
        saveChannelAnalysisHistory(user.id, {
          channelId: data.channel_id || clean,
          channelTitle: data.channel_title,
          videoCount: data.analyzed_videos.length,
          healthScore: data.channel_report.overall_health_score,
          sentimentTrend: data.channel_report.sentiment_trend,
          summary: data.channel_report.summary,
          analyzedAt: data.created_at || new Date().toISOString(),
          report: data.channel_report,
          analyzedVideos: data.analyzed_videos,
        });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (isCreditsExhausted(err) || err.status === 402) {
          setError({
            message:
              "Kanal analizi için en az 3 analiz kredisi gerekmektedir. Yetersiz bakiye nedeniyle işlem yapılamadı.",
            code: "INSUFFICIENT_CREDITS",
          });
        } else {
          setError({
            message: err.message || "Kanal analizi yapılırken bir hata oluştu.",
          });
        }
      } else {
        setError({
          message: "Beklenmedik bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const remainingCredits = user?.role === "admin" ? "Sınırsız" : user?.analysis_credits ?? 0;
  const isCreditsLow = typeof remainingCredits === "number" && remainingCredits < 3;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Üst Başlık & Açıklama */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent-record/40 bg-accent-record/15 text-accent-record">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <h1 className="font-display text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
              Kanal Geneli Toplu Analiz
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-text-muted">
            YouTube kanalınızın son 5 normal (uzun) videosunu tarayarak genel kanal sağlığını, kitle eğilimlerini ve kronik sorunları yapay zeka ile sentezleyin (Shorts videoları otomatik olarak elenir).
          </p>
        </div>

        {/* Kredi Bilgi Rozeti */}
        <div className="inline-flex items-center gap-2.5 rounded-xl border border-border-subtle bg-bg-surface px-4 py-2.5 shadow-sm shrink-0">
          <span className="flex h-2.5 w-2.5 rounded-full bg-accent-record animate-pulse" />
          <div className="text-xs">
            <span className="text-text-muted">Mevcut Krediniz: </span>
            <strong className="font-mono text-sm text-accent-record">
              {remainingCredits}
            </strong>
          </div>
        </div>
      </div>

      {/* Kanal Giriş Formu */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-6 shadow-xl sm:p-8">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-accent-record/5 blur-2xl pointer-events-none" />

        <form onSubmit={handleAnalyze} className="space-y-4">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
            YouTube Kanal Linki veya Kullanıcı Adı
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input
                type="text"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="YouTube kanal linki, @kullanıcıadı veya Kanal ID..."
                disabled={loading}
                className="w-full min-h-12 rounded-xl border border-border-subtle bg-bg-base/70 pl-11 pr-4 text-sm sm:text-base font-sans text-text-primary placeholder-text-muted/50 outline-none transition-all focus:border-accent-record focus:ring-2 focus:ring-accent-record/20 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !channelUrl.trim() || isCreditsLow}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent-record px-7 py-3 font-display text-sm font-bold uppercase tracking-wider text-bg-base transition-all hover:bg-accent-record/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none shrink-0"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Analiz Ediliyor...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Kanal Analizi Yap (3 Kredi)</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-text-muted">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={forceRefresh}
                onChange={(e) => setForceRefresh(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-border-subtle text-accent-record focus:ring-accent-record/40"
              />
              <span>Videoların önbelleğini atla ve sıfırdan çek</span>
            </label>

            <span className="font-mono">
              ⚡ Son 5 normal video taranır (Shorts hariç) • Maliyet: <strong>3 Kredi</strong>
            </span>
          </div>

          {isCreditsLow && (
            <div className="mt-3 rounded-xl border border-sentiment-negative/30 bg-sentiment-negative/10 p-3.5 text-xs text-sentiment-negative">
              <strong>Yetersiz Bakiye: </strong> Kanal analizi için en az 3 krediniz olmalıdır. Kredi yüklemek için lütfen iletişime geçin.
            </div>
          )}
        </form>
      </div>

      {/* Stepped Loader / Analiz Aşamaları */}
      {loading && (
        <div className="rounded-2xl border border-accent-record/30 bg-bg-surface p-6 shadow-2xl sm:p-8">
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-record/15 text-accent-record mb-3">
              <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </span>
            <h3 className="font-display text-xl font-bold text-text-primary">
              Kanal Analizi ve Sentez İşlemi Devam Ediyor
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-text-muted">
              Kanalın son 5 videosunun tüm izleyici yorumları çekilip Gemini 2.5 Flash ile çoklu video çapraz analizine tabi tutuluyor. Yorum hacmine bağlı olarak bu işlem 1-3 dakika sürebilir, lütfen sayfayı kapatmayın.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {/* Adım 1 */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                loadingStep >= 1
                  ? "border-accent-record/50 bg-accent-record/10 text-text-primary"
                  : "border-border-subtle bg-bg-base/40 text-text-muted"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
                    loadingStep > 1
                      ? "bg-sentiment-positive text-bg-base"
                      : loadingStep === 1
                      ? "bg-accent-record text-bg-base animate-pulse"
                      : "bg-fill-muted text-text-muted"
                  }`}
                >
                  {loadingStep > 1 ? "✓" : "1"}
                </span>
                <strong className="text-xs sm:text-sm font-semibold">Kanal & Video Tespiti</strong>
              </div>
              <p className="mt-2 text-xs text-text-muted">
                Kanalın son 5 videosu YouTube Data API üzerinden çekiliyor.
              </p>
            </div>

            {/* Adım 2 */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                loadingStep >= 2
                  ? "border-accent-record/50 bg-accent-record/10 text-text-primary"
                  : "border-border-subtle bg-bg-base/40 text-text-muted"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
                    loadingStep > 2
                      ? "bg-sentiment-positive text-bg-base"
                      : loadingStep === 2
                      ? "bg-accent-record text-bg-base animate-pulse"
                      : "bg-fill-muted text-text-muted"
                  }`}
                >
                  {loadingStep > 2 ? "✓" : "2"}
                </span>
                <strong className="text-xs sm:text-sm font-semibold">Yorum & Duygu Analizi</strong>
              </div>
              <p className="mt-2 text-xs text-text-muted">
                Her videonun izleyici yorumları kategorize ediliyor.
              </p>
            </div>

            {/* Adım 3 */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                loadingStep >= 3
                  ? "border-accent-record/50 bg-accent-record/10 text-text-primary"
                  : "border-border-subtle bg-bg-base/40 text-text-muted"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
                    loadingStep === 3
                      ? "bg-accent-record text-bg-base animate-pulse"
                      : "bg-fill-muted text-text-muted"
                  }`}
                >
                  3
                </span>
                <strong className="text-xs sm:text-sm font-semibold">Gemini Kanal Sentezi</strong>
              </div>
              <p className="mt-2 text-xs text-text-muted">
                Kanal sağlık skoru, trend ve büyüme stratejisi oluşturuluyor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hata Durumu */}
      {error && (
        <div className="rounded-2xl border border-sentiment-negative/30 bg-sentiment-negative/10 p-6 shadow-xl">
          <div className="flex items-start gap-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sentiment-negative/20 text-sentiment-negative">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-sentiment-negative">
                Analiz Başarısız Oldu
              </h3>
              <p className="mt-1 text-sm text-text-primary/90 leading-relaxed">
                {error.message}
              </p>
              {error.code === "INSUFFICIENT_CREDITS" && (
                <div className="mt-4">
                  <a
                    href="https://wa.me/905000000000?text=Merhaba,%20YorumAI%20kanal%20analizi%20için%20ek%20kredi%20almak%20istiyorum."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-sentiment-positive px-4 py-2 text-xs font-bold text-bg-base hover:bg-sentiment-positive/90 transition-colors"
                  >
                    WhatsApp ile Kredi Yükle
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sonuç Raporu */}
      {result && result.channel_report && (
        <div className="space-y-8 animate-fade-in">
          {/* 1. Kanal Sağlık & Yönetici Özeti Kartı */}
          <ChannelHealthCard
            report={result.channel_report}
            videoCount={result.video_count || result.analyzed_videos?.length || 5}
            createdAt={result.created_at}
          />

          {/* 2. Gemini Strateji ve Aksiyon Planı Kartı */}
          <ChannelStrategyCard
            strategy={result.channel_report.actionable_channel_strategy}
          />

          {/* 3. Duygu Dağılım Trend Grafiği */}
          <SentimentTrendChart videos={result.analyzed_videos} />

          {/* 4. Tekrar Eden Kronik Sorunlar Kartı */}
          <RecurringIssues issues={result.channel_report.recurring_issues} />

          {/* 5. Analiz Edilen Videoların Listesi */}
          <ChannelVideosList videos={result.analyzed_videos} />
        </div>
      )}
    </div>
  );
}

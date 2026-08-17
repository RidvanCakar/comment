"use client";

import React from "react";
import type { ChannelReport, AnalyzedVideoReportItem } from "@/lib/api";
import ChannelPdfDownloadButton from "@/components/pdf/ChannelPdfDownloadButton";

interface ChannelHealthCardProps {
  report: ChannelReport;
  videoCount: number;
  createdAt: string | null;
  channelId?: string;
  analyzedVideos?: AnalyzedVideoReportItem[];
}

export default function ChannelHealthCard({
  report,
  videoCount,
  createdAt,
  channelId = "channel",
  analyzedVideos,
}: ChannelHealthCardProps) {
  const score = report.overall_health_score ?? 75;
  const loyalty = report.loyalty_rate ?? Math.min(95, Math.max(50, score - 5));
  const resonance = report.audience_resonance ?? Math.min(98, Math.max(55, score + 2));
  const verdict =
    report.retention_verdict ||
    (score >= 80 ? "Güçlü Kitle Bağlılığı" : score >= 60 ? "İstikrarlı İzleyici İlgisi" : "Kritik İzleyici Kaybı");

  let strokeColor = "#10B981";
  let scoreTextColor = "text-sentiment-positive";

  if (score < 60) {
    strokeColor = "#F43F5E";
    scoreTextColor = "text-sentiment-negative";
  } else if (score < 78) {
    strokeColor = "#F59E0B";
    scoreTextColor = "text-amber-400";
  }

  const rawTrend = String(report.sentiment_trend || "dengeli").toLowerCase();
  const isImproving = rawTrend.includes("yuksel") || rawTrend === "improving";
  const isDeclining = rawTrend.includes("dusus") || rawTrend === "declining";

  const trendConfig = isImproving
    ? {
        badge: "▲ YÜKSELİŞTE",
        color: "text-sentiment-positive border-sentiment-positive/30 bg-sentiment-positive/10",
      }
    : isDeclining
    ? {
        badge: "▼ DÜŞÜŞ EĞİLİMİNDE",
        color: "text-sentiment-negative border-sentiment-negative/30 bg-sentiment-negative/10",
      }
    : {
        badge: "● DENGELİ / İSTİKRARLI",
        color: "text-text-muted border-border-subtle bg-bg-base/60",
      };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Bugün";

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const pdfData = {
    channelTitle: report.channel_title || "YouTube Kanalı",
    channelId,
    videoCount,
    analysisDate: createdAt,
    report,
    analyzedVideos,
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-7 shadow-xl shadow-black/5 backdrop-blur-xl">
      {/* Top Meta Bar & Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-accent-record/30 bg-accent-record/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent-record">
            <span className="h-2 w-2 rounded-full bg-accent-record animate-pulse" />
            Kanal İstihbarat Raporu
          </span>
          <span className="rounded-md border border-border-subtle bg-bg-base/70 px-2.5 py-1 font-mono text-xs font-semibold text-text-muted">
            Son {videoCount} Video Sentezi
          </span>
          <span className="rounded-md border border-border-subtle bg-bg-base/70 px-2.5 py-1 font-mono text-xs text-text-muted">
            {formattedDate}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-bold ${trendConfig.color}`}>
            {trendConfig.badge}
          </div>
          <ChannelPdfDownloadButton data={pdfData} />
        </div>
      </div>

      {/* Channel Header & Telemetry Tiles */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Channel Overview */}
        <div className="lg:col-span-7 space-y-3">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
            Kanal Kimliği & Kitle Karnesi
          </span>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
            @{report.channel_title || "YouTube Kanalı"}
          </h1>
          <div className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-base/70 px-3.5 py-1.5 font-mono text-xs text-text-muted">
            <span>KİTLE KORUMA VERDİCT&apos;İ:</span>
            <strong className={`font-bold ${scoreTextColor}`}>{verdict}</strong>
          </div>
          <p className="text-sm leading-relaxed text-text-muted sm:text-base pt-1">
            {report.summary || "Kanal için kapsamlı kitle sağlığı ve büyüme analizi hazırlandı."}
          </p>
        </div>

        {/* Right Column: 3 Clean Metric Tiles */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-3">
          {/* Tile 1: Circular Gauge */}
          <div className="col-span-3 sm:col-span-1 rounded-xl border border-border-subtle bg-bg-base/60 p-3.5 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center">
              <svg className="h-20 w-20 -rotate-90 transform" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r={radius} className="stroke-border-subtle" strokeWidth="7" fill="transparent" />
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  stroke={strokeColor}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-mono text-xl font-extrabold text-text-primary">{score}</span>
                <span className="font-mono text-[8px] text-text-muted">/100</span>
              </div>
            </div>
            <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Sağlık Skoru
            </span>
          </div>

          {/* Tile 2: Loyalty */}
          <div className="col-span-3 sm:col-span-1 rounded-xl border border-border-subtle bg-bg-base/60 p-3.5 flex flex-col justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Sadakat Oranı
            </span>
            <div className="my-1">
              <p className="font-mono text-2xl font-black text-cyan-400">%{loyalty}</p>
              <span className="text-[10px] text-text-muted">Superfan İndeksi</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${loyalty}%` }} />
            </div>
          </div>

          {/* Tile 3: Resonance */}
          <div className="col-span-3 sm:col-span-1 rounded-xl border border-border-subtle bg-bg-base/60 p-3.5 flex flex-col justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Kitle Rezonansı
            </span>
            <div className="my-1">
              <p className="font-mono text-2xl font-black text-sentiment-positive">%{resonance}</p>
              <span className="text-[10px] text-text-muted">Beklenti Uyumu</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
              <div className="h-full bg-sentiment-positive rounded-full" style={{ width: `${resonance}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

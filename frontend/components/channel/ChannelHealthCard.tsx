"use client";

import React from "react";
import type { ChannelReport } from "@/lib/api";

interface ChannelHealthCardProps {
  report: ChannelReport;
  videoCount: number;
  createdAt: string | null;
}

export default function ChannelHealthCard({
  report,
  videoCount,
  createdAt,
}: ChannelHealthCardProps) {
  const score = report.overall_health_score ?? 70;
  
  // Renk ve durum belirleme
  let scoreColor = "text-sentiment-positive border-sentiment-positive/40 bg-sentiment-positive/10";
  let scoreStatus = "Yüksek Performans";
  let strokeColor = "#8FB89B";

  if (score < 50) {
    scoreColor = "text-sentiment-negative border-sentiment-negative/40 bg-sentiment-negative/10";
    scoreStatus = "Dikkat / Riskli";
    strokeColor = "#D96C6C";
  } else if (score < 75) {
    scoreColor = "text-accent-record border-accent-record/40 bg-accent-record/10";
    scoreStatus = "Dengeli / Geliştirilebilir";
    strokeColor = "#F2A93B";
  }

  // Trend özellikleri
  const trend = report.sentiment_trend || "STABLE";
  const trendConfig = {
    IMPROVING: {
      label: "Yükseliş Eğiliminde",
      desc: "İzleyici memnuniyeti son videolarda düzenli artış gösteriyor.",
      color: "text-sentiment-positive bg-sentiment-positive/10 border-sentiment-positive/30",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    DECLINING: {
      label: "Düşüş Eğiliminde",
      desc: "İzleyici yorumlarında olumsuz eğilim ve şikayetler yükselişte.",
      color: "text-sentiment-negative bg-sentiment-negative/10 border-sentiment-negative/30",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
    },
    STABLE: {
      label: "Dengeli / İstikrarlı",
      desc: "Kanal izleyici tepkileri ve duygu oranları sabit bir çizgide ilerliyor.",
      color: "text-text-muted bg-fill-muted border-border-subtle",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14" />
        </svg>
      ),
    },
  }[trend];

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Dairesel ilerleme çubuğu için çevre hesabı (r=40, C=2*pi*40 ≈ 251.32)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-6 shadow-xl sm:p-8">
      {/* Arka plan ışık vurgusu */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-record/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Sol: Kanal Başlığı ve Rozetler */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-accent-record/30 bg-accent-record/10 px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-accent-record">
              <span className="h-2 w-2 rounded-full bg-accent-record animate-pulse" />
              Kanal Analiz Raporu
            </span>
            <span className="inline-flex items-center rounded-md border border-border-subtle bg-bg-base/60 px-2.5 py-1 text-xs font-medium text-text-muted">
              {videoCount} Son Video Sentezi
            </span>
            {formattedDate && (
              <span className="inline-flex items-center rounded-md border border-border-subtle bg-bg-base/60 px-2.5 py-1 text-xs font-medium text-text-muted">
                {formattedDate}
              </span>
            )}
          </div>

          <h2 className="truncate font-display text-2xl font-extrabold text-text-primary sm:text-3xl">
            {report.channel_title || "YouTube Kanalı"}
          </h2>

          <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold sm:text-sm transition-colors shadow-xs">
            <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium ${trendConfig.color}`}>
              {trendConfig.icon}
              {trendConfig.label}
            </span>
            <span className="text-xs text-text-muted hidden sm:inline">{trendConfig.desc}</span>
          </div>
        </div>

        {/* Sağ: Kanal Sağlık Skoru Göstergesi */}
        <div className="flex items-center gap-5 rounded-xl border border-border-subtle bg-bg-base/70 p-4 shrink-0 sm:p-5">
          <div className="relative flex items-center justify-center">
            <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-fill-muted"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={strokeColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-display text-2xl font-black text-text-primary sm:text-3xl">
                {score}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">/100</span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
              Kanal Sağlık Skoru
            </span>
            <span className={`mt-0.5 text-sm font-bold sm:text-base ${scoreColor.split(" ")[0]}`}>
              {scoreStatus}
            </span>
            <p className="mt-1 max-w-[140px] text-[11px] text-text-muted leading-tight">
              Son {videoCount} videodaki etkileşim, duygu ve izleyici sadakati puanı.
            </p>
          </div>
        </div>
      </div>

      {/* Alt: Kronolojik Yönetici Özeti */}
      <div className="mt-6 border-t border-border-subtle pt-6">
        <div className="rounded-xl border border-border-subtle/80 bg-bg-base/50 p-4 sm:p-5">
          <h3 className="mb-2 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-accent-record">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Yönetici Özeti & Kanal Dinamikleri
          </h3>
          <p className="font-sans text-sm sm:text-base leading-relaxed text-text-primary/95">
            {report.summary || "Kanal için özet analiz hazırlandı."}
          </p>
          {report.audience_shift_insights && (
            <div className="mt-3 border-t border-border-subtle/50 pt-3 text-xs sm:text-sm text-text-muted">
              <strong className="text-text-primary font-semibold">İzleyici Kitlesi Tepkileri: </strong>
              {report.audience_shift_insights}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

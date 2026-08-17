"use client";

import React from "react";
import Link from "next/link";
import type { GrowthBlueprint, ActionableChannelStrategy } from "@/lib/api";

interface GrowthBlueprintCardProps {
  blueprint?: GrowthBlueprint;
  strategy: ActionableChannelStrategy;
  channelTitle: string;
}

export default function GrowthBlueprintCard({
  blueprint,
  strategy,
  channelTitle,
}: GrowthBlueprintCardProps) {
  const day30 = blueprint?.day_30_focus || "İlk 20 saniye açılış temposunu ve ses miksajını standartlaştırın.";
  const day60 = blueprint?.day_60_focus || "En çok talep edilen 3 video konseptini 'Rehber' serisi olarak yayına alın.";
  const day90 = blueprint?.day_90_focus || "Kitle sadakatini topluluk ve sponsorluk gelirine dönüştürün.";

  return (
    <div className="space-y-6">
      {/* 90-Day Growth Blueprint Card */}
      <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-7 shadow-xl shadow-black/5 backdrop-blur-xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-5">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
              Büyüme & Eylem Planı
            </span>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
              90 Günlük Adım Adım Büyüme Planı
            </h2>
            <p className="mt-1 text-xs text-text-muted sm:text-sm">
              İzleyici geri bildirimlerine dayalı 3 aşamalı somut optimizasyon ve gelişim planı.
            </p>
          </div>

          <span className="rounded-full border border-accent-record/30 bg-accent-record/10 px-3 py-1 font-mono text-xs font-bold text-accent-record">
            Eylem Planı
          </span>
        </div>

        {/* 3 Steps */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-xl border border-border-subtle bg-bg-base/60 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <span className="rounded-md border border-border-subtle bg-bg-surface px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                01 - 30 GÜN • HIZLI DÜZELTMELER
              </span>
              <h3 className="mt-3 text-sm font-bold text-text-primary">
                Prodüksiyon & Tempo İyileştirmesi
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                {day30}
              </p>
            </div>
            <div className="mt-4 border-t border-border-subtle pt-2 text-[11px] font-mono text-sentiment-negative">
              Hedef: Terk Oranını Düşür
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-border-subtle bg-bg-base/60 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <span className="rounded-md border border-border-subtle bg-bg-surface px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                30 - 60 GÜN • İÇERİK MOTORU
              </span>
              <h3 className="mt-3 text-sm font-bold text-text-primary">
                Kitle Talebi Odaklı Video Serisi
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                {day60}
              </p>
            </div>
            <div className="mt-4 border-t border-border-subtle pt-2 text-[11px] font-mono text-amber-400">
              Hedef: +%30 Tıklanma / CTR Artışı
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-border-subtle bg-bg-base/60 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <span className="rounded-md border border-border-subtle bg-bg-surface px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                60 - 90 GÜN • MONETİZASYON
              </span>
              <h3 className="mt-3 text-sm font-bold text-text-primary">
                Sponsorluk & Sadakat Ölçekleme
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                {day90}
              </p>
            </div>
            <div className="mt-4 border-t border-border-subtle pt-2 text-[11px] font-mono text-sentiment-positive">
              Hedef: Sponsorluk & Topluluk Geliri
            </div>
          </div>
        </div>

        {/* Core Strategy Callout */}
        {strategy && (strategy.action || strategy.insight) && (
          <div className="mt-6 rounded-xl border border-accent-record/35 bg-gradient-to-br from-accent-record/10 via-bg-surface to-bg-surface p-5 sm:p-6 shadow-md">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-accent-record mb-2">
              <span>⚡ EN YÜKSEK ETKİLİ TEK STRATEJİK ADIM</span>
            </div>
            <h4 className="text-base sm:text-lg font-display font-extrabold text-text-primary">
              {strategy.action}
            </h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs text-text-muted">
              {strategy.insight && (
                <div className="rounded-lg border border-border-subtle bg-bg-base/60 p-3">
                  <strong className="text-text-muted font-mono text-[10px] uppercase block mb-1">Tespit Edilen Durum:</strong>
                  <span className="text-text-primary/90">{strategy.insight}</span>
                </div>
              )}
              {strategy.expected_impact && (
                <div className="rounded-lg border border-border-subtle bg-bg-base/60 p-3">
                  <strong className="text-sentiment-positive font-mono text-[10px] uppercase block mb-1">Beklenen Fayda:</strong>
                  <span className="text-sentiment-positive font-medium">{strategy.expected_impact}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Report Footer Conversion Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/90 p-6 sm:p-8 text-center shadow-lg">
        <div className="relative mx-auto max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-record/30 bg-accent-record/10 px-3 py-1 font-mono text-xs font-bold text-accent-record uppercase">
            CommentLab Creator Audit
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary">
            @{channelTitle} İçin Bir Sonraki Videonuz Hazır mı?
          </h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Bu rapor <strong>CommentLab AI Engine</strong> ile üretilmiştir. Kitlenizin nabzını her yeni videoda takip etmek, kronik şikayetleri anında yakalamak için yeni videolarınızı analiz edin.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-record px-6 py-2.5 font-display text-xs sm:text-sm font-bold text-[#17130b] shadow-md shadow-accent-record/20 transition hover:-translate-y-0.5"
            >
              <span>Yeni Video Analiz Et</span>
              <span>→</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-base px-6 py-2.5 font-display text-xs sm:text-sm font-bold text-text-primary transition hover:border-accent-record/40"
            >
              <span>Dashboard&apos;a Dön</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import type { ActionableChannelStrategy } from "@/lib/api";

interface ChannelStrategyCardProps {
  strategy: ActionableChannelStrategy;
}

export default function ChannelStrategyCard({ strategy }: ChannelStrategyCardProps) {
  if (!strategy || (!strategy.action && !strategy.insight)) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent-record/40 bg-bg-surface p-6 shadow-2xl sm:p-8">
      {/* Arka plan ışık vurguları */}
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-accent-record/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent-record/5 blur-2xl pointer-events-none" />

      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-record/40 bg-accent-record/15 text-accent-record shadow-inner">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent-record">
                Yapay Zeka Kanal Büyüme Stratejisi
              </span>
            </div>
            <h3 className="font-display text-lg font-black text-text-primary sm:text-xl">
              Kanal Geneli Aksiyon Planı & Tavsiye
            </h3>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-record/30 bg-accent-record/10 px-3 py-1 text-xs font-semibold text-accent-record">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-record animate-ping" />
          En Yüksek Etkili Adım
        </span>
      </div>

      {/* 3 Alanlı Strateji Kartları */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* 1. Tespit / Insight */}
        <div className="rounded-xl border border-border-subtle bg-bg-base/70 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-fill-muted text-text-primary">
                1
              </span>
              Veriye Dayalı Tespit
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-primary font-medium">
              {strategy.insight || "Kanal genelinde izleyici eğilimleri incelendi."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle/50 text-[11px] text-text-muted">
            Son 5 videodaki yorum sinyalleri
          </div>
        </div>

        {/* 2. Somut Aksiyon / Action */}
        <div className="rounded-xl border border-accent-record/40 bg-accent-record/5 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-accent-record">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-record text-bg-base font-black">
                2
              </span>
              Atılması Gereken Somut Adım
            </div>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-text-primary font-bold">
              {strategy.action || "Kanal içeriği için önerilen adım belirlendi."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-accent-record/20 text-[11px] text-accent-record/90 font-medium">
            Sonraki videolarda doğrudan uygulanmalı
          </div>
        </div>

        {/* 3. Beklenen Etki / Expected Impact */}
        <div className="rounded-xl border border-border-subtle bg-bg-base/70 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-sentiment-positive">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sentiment-positive/20 text-sentiment-positive">
                3
              </span>
              Beklenen Fayda & Dönüşüm
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-primary font-medium">
              {strategy.expected_impact || "Kanal izlenme süresi ve abone sadakatinde artış beklenir."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle/50 text-[11px] text-sentiment-positive font-medium">
            Öngörülen izleyici ve etkileşim kazanımı
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import type { AudiencePersona } from "@/lib/api";

interface AudiencePersonaCardProps {
  persona?: AudiencePersona;
  shiftInsights?: string;
}

export default function AudiencePersonaCard({ persona, shiftInsights }: AudiencePersonaCardProps) {
  const expertise = persona?.expertise_level || "Orta - İleri Seviye İzleyici";
  const trust = persona?.trust_sentiment || "Yüksek Güven & Sadakat";
  const motive = persona?.primary_motive || "Pratik çözümler ve net bilgi edinme";
  const shift = shiftInsights || persona?.audience_shift_insights || "Kitle uzun formattaki detaylı anlatımlara daha olumlu tepki veriyor.";

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-7 shadow-xl shadow-black/5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-5">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
            Kitle Profili & Alışkanlıkları
          </span>
          <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
            Kitle Profili ve İzleme Alışkanlıkları
          </h2>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            Yorumların tonu, kelime dağarcığı ve izleyicilerin içerik üreticisine duyduğu samimiyet.
          </p>
        </div>

        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs font-bold text-cyan-400">
          Kitle Karnesi
        </span>
      </div>

      {/* 3 Pillar Grid + Audience Shift Box */}
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Pillar 1: Expertise */}
          <div className="rounded-xl border border-border-subtle bg-bg-base/60 p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              01. UZMANLIK SEVİYESİ
            </span>
            <p className="mt-2 text-sm sm:text-base font-bold text-text-primary">
              {expertise}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Yorumlardaki teknik derinlik ve soru kalitesine dayalı seviye.
            </p>
          </div>

          {/* Pillar 2: Trust & Sentiment */}
          <div className="rounded-xl border border-border-subtle bg-bg-base/60 p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              02. GÜVEN & OTORİTE TONU
            </span>
            <p className="mt-2 text-sm sm:text-base font-bold text-cyan-400">
              {trust}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              İzleyicilerin tavsiyelerinize ve içerik kalitenize duyduğu inanç.
            </p>
          </div>

          {/* Pillar 3: Primary Motive */}
          <div className="rounded-xl border border-border-subtle bg-bg-base/60 p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              03. İZLEME MOTİVASYONU
            </span>
            <p className="mt-2 text-sm sm:text-base font-bold text-sentiment-positive">
              {motive}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Kitlenin bildirimleri açıp videoya tıklamasındaki ana sebep.
            </p>
          </div>
        </div>

        {/* Audience Shift Insights Bar */}
        <div className="rounded-xl border border-border-subtle bg-bg-base/60 p-4 sm:p-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-accent-record">
            <span>⚡ KİTLE HAFIZASI & EĞİLİM DÖNÜŞÜMÜ</span>
          </div>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-text-primary/90">
            {shift}
          </p>
        </div>
      </div>
    </div>
  );
}

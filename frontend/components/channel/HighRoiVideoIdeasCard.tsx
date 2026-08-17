"use client";

import React, { useState } from "react";
import type { NextVideoIdea } from "@/lib/api";

interface HighRoiVideoIdeasCardProps {
  ideas?: NextVideoIdea[];
}

export default function HighRoiVideoIdeasCard({ ideas }: HighRoiVideoIdeasCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!ideas || ideas.length === 0) {
    return null;
  }

  const handleCopy = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-7 shadow-xl shadow-black/5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-5">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
            Video Fikirleri & Giriş Önerileri
          </span>
          <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
            İzleyicinin İstediği 3 Video Konsepti & Giriş Cümleleri
          </h2>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            Yorumlardaki en çok merak edilen sorulardan türetilmiş içerik önerileri ve giriş stratejileri.
          </p>
        </div>

        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400">
          Garanti Kitle İlgisi
        </span>
      </div>

      {/* 3 Video Cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {ideas.map((idea, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-xl border border-border-subtle bg-bg-base/60 p-4 sm:p-5 transition-all hover:border-accent-record/40"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3">
                <span className="rounded-md border border-border-subtle bg-bg-surface px-2.5 py-0.5 font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  VİDEO KONSEPTİ #{idx + 1}
                </span>
                <span className="font-mono text-xs font-bold text-sentiment-positive">
                  {idea.audience_demand_score || "%88+ Talep"}
                </span>
              </div>

              {/* Title & Copy Action */}
              <div className="mt-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                  Önerilen Tıklanma Başlığı
                </span>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-text-primary leading-snug">
                    &ldquo;{idea.concept_title}&rdquo;
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopy(idea.concept_title, idx)}
                    className="shrink-0 rounded-lg border border-border-subtle bg-bg-surface p-1.5 text-text-muted hover:border-accent-record/40 hover:text-text-primary transition cursor-pointer"
                    title="Başlığı Kopyala"
                  >
                    {copiedIndex === idx ? (
                      <span className="text-sentiment-positive text-xs font-bold">✓</span>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Hook */}
              <div className="mt-4 rounded-xl border border-border-subtle bg-bg-surface/80 p-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent-record block mb-1">
                  🎯 İlk 15 Saniyede Söylenecek Giriş Cümlesi
                </span>
                <p className="text-xs text-text-primary/90 leading-relaxed italic">
                  {idea.hook}
                </p>
              </div>
            </div>

            {/* Why It Works */}
            <div className="mt-4 border-t border-border-subtle pt-3 text-[11px] text-text-muted">
              <strong className="text-text-primary font-semibold">Neden Tutacak? </strong>
              {idea.why_it_works}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

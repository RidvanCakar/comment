"use client";

import React, { useState } from "react";
import type { CommercialValue } from "@/lib/api";

interface CommercialValueCardProps {
  commercial?: CommercialValue;
}

export default function CommercialValueCard({ commercial }: CommercialValueCardProps) {
  const [copied, setCopied] = useState(false);

  const spendingAreas = commercial?.target_spending_areas || [
    "İlgili Sektör Ürünleri: Kitle videolarda adı geçen araç ve ekipmanları denemeye istekli.",
    "Eğitim ve Dijital Servisler: Yorumlarda kişisel gelişim ve uzmanlaşma talepleri yoğun.",
    "Donanım ve Ekipman: İzleyiciler stüdyo ve çalışma araçlarına bütçe ayırabiliyor.",
  ];

  const adTips =
    commercial?.ad_integration_tips ||
    "Kitleniz samimiyete ve tarafsız görüşlerinize çok önem veriyor. Bahis veya alakasız mobil oyunlar yerine videonun konusuna doğal olarak entegre edilen güvenilir markaları tercih edin.";

  const pitch =
    commercial?.monetization_pitch ||
    "Kanalımız, içeriklerimizde tavsiye ettiğimiz araçlara, ürünlere ve markalara yüksek güven duyan, satın alma gücü ve sadakati yüksek bir izleyici kitlesine sahiptir.";

  const niches = commercial?.recommended_niches || ["Teknoloji & Yazılım", "Donanım", "Eğitim & Kariyer"];

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-7 shadow-xl shadow-black/5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-5">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
            Sponsorluk & Gelir Fırsatları
          </span>
          <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
            Sponsorluk & Gelir Fırsatları Rehberi
          </h2>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            İzleyicilerin para harcamaya hazır olduğu alanlar, reklam alma tüyoları ve markalara atılacak hazır e-posta notu.
          </p>
        </div>

        <span className="rounded-full border border-sentiment-positive/30 bg-sentiment-positive/10 px-3 py-1 font-mono text-xs font-bold text-sentiment-positive">
          Gelir Stratejisi
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {/* 1. Kategori ve Harcama Alanları */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Satın Almaya Hazır Alanlar */}
          <div className="rounded-xl border border-border-subtle bg-bg-base/60 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-sentiment-positive mb-3">
                <span>🛒 İZLEYİCİNİN SATIN ALMAYA HAZIR OLDUĞU ALANLAR</span>
              </div>
              <ul className="space-y-2.5">
                {spendingAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-text-primary/90">
                    <span className="text-sentiment-positive font-bold mt-0.5">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle/70">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                Önerilen Sektörler:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {niches.map((niche, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-border-subtle bg-bg-surface px-2.5 py-0.5 font-mono text-xs text-text-primary"
                  >
                    ✓ {niche}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Kitleyi Kaçırmama Kuralı */}
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                <span>⚠️ KİTLEYİ KIZDIRMADAN SPONSORLUK ALMA TÜYOSU</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-text-primary/90 pt-1">
                {adTips}
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-300">
              💡 <strong>İpucu:</strong> Videolarınızda reklamı ayrı bir blok gibi değil, konunun doğal bir parçası veya çözüm aracı olarak anlatın.
            </div>
          </div>
        </div>

        {/* 2. Hazır E-posta Cümlesi (Pitch Notu) */}
        <div className="rounded-xl border border-sentiment-positive/30 bg-sentiment-positive/5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-sentiment-positive">
              <span>✉️ MARKALARA / AJANSLARA GÖNDERİLECEK HAZIR E-POSTA CÜMLESİ (PITCH)</span>
            </div>
            <button
              type="button"
              onClick={handleCopyPitch}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sentiment-positive/30 bg-sentiment-positive/10 px-3 py-1 text-xs font-bold text-sentiment-positive hover:bg-sentiment-positive hover:text-[#17130b] transition cursor-pointer"
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Cümleyi Kopyala</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-text-primary italic font-medium pt-1">
            &ldquo;{pitch}&rdquo;
          </p>
          <div className="mt-3 border-t border-sentiment-positive/20 pt-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Sponsorluk teklif maillerinizde ve medya kitinizde doğrudan kullanabilirsiniz.</span>
            <span className="text-sentiment-positive font-mono font-bold">CommentLab Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

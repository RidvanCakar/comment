"use client";

import React, { useState } from "react";

interface AnalyzeFormProps {
  onSubmit: (videoUrl: string, forceRefresh: boolean) => void;
  isLoading: boolean;
  initialUrl?: string;
  creditsBlocked?: boolean;
}

export default function AnalyzeForm({
  onSubmit,
  isLoading,
  initialUrl = "",
  creditsBlocked = false,
}: AnalyzeFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [forceRefresh, setForceRefresh] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onSubmit(url.trim(), forceRefresh);
  };

  return (
    <div className="w-full max-w-3xl mx-auto min-w-0">
      <div className="flex items-center justify-between w-full h-8 opacity-30 mb-2 px-1 sm:px-2">
        <svg viewBox="0 0 600 40" className="w-full h-full stroke-text-muted fill-none stroke-[1.5]" aria-hidden>
          <path
            d="M0 20 L 100 20 Q 120 20 130 10 T 150 30 T 170 10 T 190 20 L 250 20 Q 260 20 270 5 T 290 35 T 310 5 T 330 20 L 400 20 Q 410 20 420 15 T 440 25 T 460 15 T 480 20 L 600 20"
            className={isLoading ? "animate-pulse" : ""}
          />
        </svg>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`bg-bg-surface border rounded-sm p-5 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 ${
          creditsBlocked
            ? "border-accent-record/20"
            : "border-border-subtle hover:border-accent-record/20"
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-record/5 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-5 sm:mb-6">
          <h2 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-text-primary flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full border border-accent-record flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-record animate-ping" />
            </span>
            Analizi Başlat
          </h2>
        </div>

        <div className="flex flex-col gap-3 items-stretch sm:flex-row">
          <div className="flex-1 min-w-0 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="YouTube video linki veya video ID girin..."
              disabled={isLoading}
              className="w-full min-h-11 h-12 px-4 bg-bg-base/70 border border-border-subtle focus:border-accent-record rounded-sm text-text-primary text-base font-sans placeholder-text-muted/50 outline-none focus:ring-1 focus:ring-accent-record/40 transition-all disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto min-h-11 h-12 px-6 bg-accent-record hover:bg-accent-record/90 disabled:opacity-50 text-bg-base font-display font-bold text-sm tracking-widest uppercase rounded-sm transition-all shadow-md cursor-pointer select-none shrink-0"
          >
            {isLoading ? "Analiz ediliyor..." : "Analizi Başlat"}
          </button>
        </div>

        {creditsBlocked && (
          <p className="mt-3 text-center text-xs leading-relaxed text-text-muted">
            Yeni video analizi için kredi gerekir. Daha önce analiz ettiğin videolar önbellekten ücretsiz açılır.
          </p>
        )}

        <div className="flex items-center gap-3 mt-4 select-none">
          <label className="flex items-center gap-3 cursor-pointer min-h-11 py-2">
            <span className="relative inline-flex w-9 h-5 shrink-0">
              <input
                type="checkbox"
                checked={forceRefresh}
                onChange={(e) => setForceRefresh(e.target.checked)}
                disabled={isLoading}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full bg-fill-muted transition-colors peer-checked:bg-accent-record peer-focus-visible:ring-2 peer-focus-visible:ring-accent-record/40" />
              <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-text-primary transition-transform peer-checked:translate-x-4" />
            </span>
            <span className="text-sm font-sans text-text-muted leading-snug">
              Yeniden analiz et (önbelleği atla)
            </span>
          </label>
        </div>
      </form>
    </div>
  );
}

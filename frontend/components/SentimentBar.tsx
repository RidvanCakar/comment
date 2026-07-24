"use client";

import React, { useEffect, useState } from "react";

interface SentimentBarProps {
  positive: number;
  neutral: number;
  negative: number;
}

export default function SentimentBar({ positive, neutral, negative }: SentimentBarProps) {
  const [widths, setWidths] = useState({ pos: 0, neu: 0, neg: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidths({ pos: positive, neu: neutral, neg: negative });
    }, 100);
    return () => clearTimeout(timer);
  }, [positive, neutral, negative]);

  const total = positive + neutral + negative || 1;
  const posPct = ((widths.pos / total) * 100).toFixed(0);
  const neuPct = ((widths.neu / total) * 100).toFixed(0);
  const negPct = ((widths.neg / total) * 100).toFixed(0);

  return (
    <div className="bg-bg-surface border border-border-subtle p-5 sm:p-6 rounded-sm shadow-xl min-w-0 h-full">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h4 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary">
          Duygu dağılımı
        </h4>
        <span className="font-mono text-xs text-text-muted uppercase tracking-wider">Spectrum</span>
      </div>

      <div className="h-4 w-full bg-bg-base rounded-sm overflow-hidden flex shadow-inner border border-border-subtle">
        {positive > 0 && (
          <div
            className="h-full bg-sentiment-positive transition-all duration-1000 ease-out min-w-0"
            style={{ width: `${(widths.pos / total) * 100}%` }}
          />
        )}
        {neutral > 0 && (
          <div
            className="h-full bg-sentiment-neutral transition-all duration-1000 ease-out min-w-0"
            style={{ width: `${(widths.neu / total) * 100}%` }}
          />
        )}
        {negative > 0 && (
          <div
            className="h-full bg-sentiment-negative transition-all duration-1000 ease-out min-w-0"
            style={{ width: `${(widths.neg / total) * 100}%` }}
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 pt-3 border-t border-border-subtle text-center">
        <div className="min-w-0 px-0.5">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-xs font-sans text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-sentiment-positive shrink-0" />
            <span className="truncate">Olumlu</span>
          </div>
          <div className="font-mono font-bold text-base sm:text-lg text-sentiment-positive break-all">
            %{posPct}
          </div>
        </div>
        <div className="min-w-0 px-0.5">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-xs font-sans text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-sentiment-neutral shrink-0" />
            <span className="truncate">Nötr</span>
          </div>
          <div className="font-mono font-bold text-base sm:text-lg text-sentiment-neutral break-all">
            %{neuPct}
          </div>
        </div>
        <div className="min-w-0 px-0.5">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-xs font-sans text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-sentiment-negative shrink-0" />
            <span className="truncate">Olumsuz</span>
          </div>
          <div className="font-mono font-bold text-base sm:text-lg text-sentiment-negative break-all">
            %{negPct}
          </div>
        </div>
      </div>
    </div>
  );
}

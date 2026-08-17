"use client";

import React, { useEffect, useState } from "react";

const loadingSteps = [
  "İzleyici yorumları taranıyor...",
  "Gürültü ve spam filtreleniyor...",
  "Kitle nabzı ve duygu dağılımı ölçülüyor...",
  "Büyüme fırsatları ve temalar çıkarılıyor...",
  "Stratejik analiz raporu hazırlanıyor...",
];

export default function LoadingState({ message }: { message?: string }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-10 text-center w-full max-w-lg mx-auto my-6 sm:my-12 shadow-2xl overflow-hidden backdrop-blur-xl">
      <div className="flex justify-center items-center gap-2 sm:gap-2.5 h-16 sm:h-20 mb-6 sm:mb-8">
        {[20, 48, 32, 64, 40, 56, 28, 44, 24].map((height, i) => {
          const delay = `${i * 0.12}s`;
          return (
            <div
              key={i}
              className="w-1.5 rounded-full bg-accent-record waveform-bar"
              style={{
                height: `${height}px`,
                animationDelay: delay,
              }}
            />
          );
        })}
      </div>

      <div className="font-display text-accent-record font-bold text-xs uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-accent-record animate-record-dot inline-block" />
        Analiz Sürüyor
      </div>

      <p className="text-text-primary text-sm sm:text-base font-sans tracking-wide min-h-6 px-1 break-words font-medium">
        {message || loadingSteps[stepIndex]}
      </p>

      <div className="w-full bg-bg-base h-1.5 rounded-full overflow-hidden mt-6 sm:mt-8 border border-border-subtle">
        <div
          className="bg-accent-record h-full transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${((stepIndex + 1) / loadingSteps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

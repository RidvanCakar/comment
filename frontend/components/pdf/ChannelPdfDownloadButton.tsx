"use client";

import React, { useState } from "react";
import type { ChannelPdfData } from "./ChannelReportDocument";

export default function ChannelPdfDownloadButton({
  data,
  className = "",
}: {
  data: ChannelPdfData;
  className?: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const [{ pdf }, { default: ChannelReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ChannelReportDocument"),
      ]);

      const blob = await pdf(<ChannelReportDocument data={data} />).toBlob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = createFileName(data.channelTitle, data.analysisDate);
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (cause) {
      console.error("Kanal analizi PDF oluşturulamadı:", cause);
      setError("PDF oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={downloadPdf}
        disabled={isGenerating}
        aria-busy={isGenerating}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-2 text-xs font-bold text-zinc-100 shadow-sm transition-all hover:border-zinc-500 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-wait disabled:opacity-70 cursor-pointer"
        title="Tüm modülleri içeren kurumsal PDF raporunu indir"
      >
        {isGenerating ? (
          <>
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-white"
              aria-hidden
            />
            <span>PDF Hazırlanıyor...</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4 text-accent-record"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Raporu PDF Olarak İndir</span>
          </>
        )}
      </button>
      {error && (
        <span
          role="alert"
          className="mt-1 text-center text-[11px] text-rose-400"
        >
          {error}
        </span>
      )}
    </div>
  );
}

function createFileName(channelTitle: string, analysisDate: string | null) {
  const normalized = channelTitle
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const date = analysisDate ? new Date(analysisDate) : new Date();
  const safeDate = Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);

  return `@${normalized || "kanal"}-commentlab-audit-${safeDate}.pdf`;
}

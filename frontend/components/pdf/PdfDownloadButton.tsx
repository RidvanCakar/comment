"use client";

import { useState } from "react";
import type { PdfReportData } from "./ReportDocument";

export default function PdfDownloadButton({
  data,
}: {
  data: PdfReportData;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const [{ pdf }, { default: ReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ReportDocument"),
      ]);

      const blob = await pdf(<ReportDocument data={data} />).toBlob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = createFileName(data.videoTitle, data.analysisDate);
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (cause) {
      console.error("PDF oluşturulamadı:", cause);
      setError("PDF oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="col-span-2 flex min-w-0 flex-col sm:col-span-1">
      <button
        type="button"
        onClick={downloadPdf}
        disabled={isGenerating}
        aria-busy={isGenerating}
        className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-xl border border-accent-record/35 bg-accent-record px-4 text-sm font-bold text-[#17130b] shadow-lg shadow-accent-record/15 transition-all hover:-translate-y-0.5 hover:bg-accent-record/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-record/50 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {isGenerating ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-[#17130b]/25 border-t-[#17130b]"
              aria-hidden
            />
            PDF hazırlanıyor...
          </>
        ) : (
          <>
            <DownloadIcon />
            PDF Olarak İndir
          </>
        )}
      </button>
      {error && (
        <span
          role="alert"
          className="mt-1.5 text-center text-xs text-sentiment-negative"
        >
          {error}
        </span>
      )}
    </div>
  );
}

function createFileName(title: string, analysisDate: string | null) {
  const normalizedTitle = title
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
  const date = analysisDate ? new Date(analysisDate) : new Date();
  const safeDate = Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);

  return `CommentLab-Analiz-${normalizedTitle || "YouTube-Video"}-${safeDate}.pdf`;
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden
    >
      <path
        d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

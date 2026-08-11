import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    absolute: "Ücretsiz YouTube Yorum Analizi | YorumAI",
  },
  description:
    "YouTube video bağlantını yapıştır; yorumların duygu dağılımını, öne çıkan temaları ve bir sonraki videon için veriye dayalı önerileri keşfet.",
};

export default function AnalyzeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">Analiz aracı yükleniyor…</main>}>
      {children}
    </Suspense>
  );
}

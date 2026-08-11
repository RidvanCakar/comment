"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AnalysisHistoryCard from "@/components/dashboard/AnalysisHistoryCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { readAnalysisHistory, type AnalysisHistoryEntry } from "@/lib/analysis-history";

export default function AnalizlerimPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = () => setHistory(readAnalysisHistory(user.id));
    load();
    window.addEventListener("yorumai:analysis-history", load);
    return () => window.removeEventListener("yorumai:analysis-history", load);
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-record">Geçmiş</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">Analizlerim</h1>
          <p className="mt-2 text-text-muted">Tamamladığın video analizlerini burada görüntüle.</p>
        </div>
        <Link
          href="/analyze"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border-subtle bg-text-primary px-5 text-sm font-bold text-bg-base"
        >
          + Yeni Analiz
        </Link>
      </div>

      {history.length > 0 ? (
        <div className="mt-8 space-y-4">
          {history.map((entry) => (
            <AnalysisHistoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border-subtle bg-bg-surface/50 p-12 text-center">
          <h2 className="font-display text-xl font-bold">Henüz analiz yok</h2>
          <p className="mt-2 text-text-muted">Giriş yaptıktan sonra yaptığın analizler burada listelenir.</p>
          <Link href="/analyze" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-accent-record px-5 text-sm font-bold text-[#17130b]">
            Video analizine git
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AnalysisHistoryCard from "@/components/dashboard/AnalysisHistoryCard";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  countThisMonth,
  readAnalysisHistory,
  type AnalysisHistoryEntry,
} from "@/lib/analysis-history";

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = () => setHistory(readAnalysisHistory(user.id));
    load();
    window.addEventListener("yorumai:analysis-history", load);
    return () => window.removeEventListener("yorumai:analysis-history", load);
  }, [user]);

  if (!user) return null;

  const firstName = user.name.trim().split(/\s+/)[0] || user.name;
  const recent = history.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Hoş geldin, {firstName}</h1>
          <p className="mt-2 text-text-muted">YouTube içeriklerini analiz et ve içgörülerini takip et.</p>
        </div>
        <Link
          href="/analyze"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border-subtle bg-text-primary px-5 text-sm font-bold text-bg-base transition-opacity hover:opacity-90"
        >
          <span aria-hidden>+</span> Yeni Analiz
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Toplam Analiz" value={history.length.toLocaleString("tr-TR")} />
        <StatCard label="Bu Ay" value={countThisMonth(history).toLocaleString("tr-TR")} />
        <StatCard
          label="Kalan Kredi"
          value={user.role === "admin" ? "∞" : String(user.analysis_credits ?? 0)}
        />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">Son Analizler</h2>
          {history.length > 0 && (
            <Link href="/analizlerim" className="text-sm font-semibold text-accent-record hover:underline">
              Tümünü Gör →
            </Link>
          )}
        </div>

        {recent.length > 0 ? (
          <div className="mt-5 space-y-4">
            {recent.map((entry) => (
              <AnalysisHistoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-border-subtle bg-bg-surface/50 p-10 text-center">
            <p className="text-text-muted">Henüz kayıtlı bir analizin yok.</p>
            <Link href="/analyze" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-accent-record px-5 text-sm font-bold text-[#17130b]">
              İlk analizini başlat
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-6">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl font-extrabold text-text-primary">{value}</p>
    </div>
  );
}

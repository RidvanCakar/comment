"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AnalysisHistoryCard from "@/components/dashboard/AnalysisHistoryCard";
import ChannelAnalysisHistoryCard from "@/components/dashboard/ChannelAnalysisHistoryCard";
import FeedbackModal from "@/components/feedback/FeedbackModal";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  countThisMonth,
  readAnalysisHistory,
  readChannelAnalysisHistory,
  type AnalysisHistoryEntry,
  type ChannelAnalysisHistoryEntry,
} from "@/lib/analysis-history";

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [channelHistory, setChannelHistory] = useState<ChannelAnalysisHistoryEntry[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      setHistory(readAnalysisHistory(user.id));
      setChannelHistory(readChannelAnalysisHistory(user.id));
    };
    load();
    window.addEventListener("yorumai:analysis-history", load);
    window.addEventListener("yorumai:channel-analysis-history", load);
    return () => {
      window.removeEventListener("yorumai:analysis-history", load);
      window.removeEventListener("yorumai:channel-analysis-history", load);
    };
  }, [user]);

  if (!user) return null;

  const firstName = user.name.trim().split(/\s+/)[0] || user.name;
  const recentVideos = history.slice(0, 3);
  const recentChannels = channelHistory.slice(0, 2);
  const totalCount = history.length + channelHistory.length;
  const monthCount = countThisMonth([...history, ...channelHistory]);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Hoş geldin, {firstName}</h1>
          <p className="mt-2 text-text-muted">YouTube video ve kanal içgörülerini tek ekrandan yönet.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/analyze"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-subtle bg-bg-surface px-4 text-xs font-bold text-text-primary transition-colors hover:border-accent-record/40"
          >
            <span>+ Video Analizi</span>
          </Link>
          <Link
            href="/kanal-analizi"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-record px-4 text-xs font-bold text-[#17130b] shadow-md shadow-accent-record/20 transition-transform hover:-translate-y-0.5"
          >
            <span>⚡ Kanal Analizi</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Toplam Analiz" value={totalCount.toLocaleString("tr-TR")} />
        <StatCard label="Bu Ay" value={monthCount.toLocaleString("tr-TR")} />
        <StatCard
          label="Kalan Kredi"
          value={user.role === "admin" ? "∞" : String(user.analysis_credits ?? 0)}
        />
      </div>

      {/* Kanal Analizleri Bölümü */}
      {recentChannels.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Kanal Analizleri</h2>
              <p className="text-xs text-text-muted">Son gerçekleştirilen kanal geneli çoklu video analizleri.</p>
            </div>
            <Link href="/kanal-analizi" className="text-sm font-semibold text-accent-record hover:underline">
              Yeni Kanal Analizi →
            </Link>
          </div>

          <div className="space-y-3">
            {recentChannels.map((entry) => (
              <ChannelAnalysisHistoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {/* Video Analizleri Bölümü */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">Son Video Analizleri</h2>
            <p className="text-xs text-text-muted">Tekil YouTube video yorum raporları.</p>
          </div>
          {history.length > 0 && (
            <Link href="/analizlerim" className="text-sm font-semibold text-accent-record hover:underline">
              Tümünü Gör →
            </Link>
          )}
        </div>

        {recentVideos.length > 0 ? (
          <div className="space-y-4">
            {recentVideos.map((entry) => (
              <AnalysisHistoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-bg-surface/50 p-10 text-center">
            <p className="text-text-muted">Henüz kayıtlı bir video analizin yok.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/analyze" className="inline-flex min-h-11 items-center rounded-lg bg-accent-record px-5 text-sm font-bold text-[#17130b]">
                İlk video analizini başlat
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 💡 Fikir & Geri Bildirim Banner'ı */}
      <section className="rounded-2xl border border-border-subtle bg-bg-surface/60 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-record/30 bg-accent-record/10 text-2xl">
            💡
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-text-primary">
              Bir Fikrin veya Özellik Önerin mi Var?
            </h3>
            <p className="text-xs text-text-muted">
              YorumAI'yi seninle birlikte geliştiriyoruz. Önerilerini doğrudan geliştirici ekibine ilet.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-accent-record/40 bg-accent-record/10 px-5 text-xs font-bold text-accent-record transition hover:bg-accent-record hover:text-[#17130b] shrink-0 cursor-pointer"
        >
          <span>Fikir / Öneri Gönder</span>
          <span>→</span>
        </button>
      </section>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
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

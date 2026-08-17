"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AnalysisHistoryCard from "@/components/dashboard/AnalysisHistoryCard";
import ChannelAnalysisHistoryCard from "@/components/dashboard/ChannelAnalysisHistoryCard";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  readAnalysisHistory,
  readChannelAnalysisHistory,
  removeAnalysisEntry,
  removeChannelAnalysisEntry,
  type AnalysisHistoryEntry,
  type ChannelAnalysisHistoryEntry,
} from "@/lib/analysis-history";
import {
  deleteAdminVideoAnalysis,
  deleteAdminChannelAnalysis,
} from "@/lib/api";

export default function AnalizlerimPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"video" | "channel">("video");
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [channelHistory, setChannelHistory] = useState<ChannelAnalysisHistoryEntry[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user) return;
    const load = () => {
      setHistory(readAnalysisHistory(user.id));
      setChannelHistory(readChannelAnalysisHistory(user.id));
    };
    load();
    window.addEventListener("commentlab:analysis-history", load);
    window.addEventListener("commentlab:channel-analysis-history", load);
    window.addEventListener("yorumai:analysis-history", load);
    window.addEventListener("yorumai:channel-analysis-history", load);
    return () => {
      window.removeEventListener("commentlab:analysis-history", load);
      window.removeEventListener("commentlab:channel-analysis-history", load);
      window.removeEventListener("yorumai:analysis-history", load);
      window.removeEventListener("yorumai:channel-analysis-history", load);
    };
  }, [user]);

  const handleDeleteVideo = async (videoId: string) => {
    if (!user || !isAdmin) return;
    try {
      // 1. Backend'den kalıcı olarak sil
      await deleteAdminVideoAnalysis(videoId);
      // 2. LocalStorage'dan sil
      const updated = removeAnalysisEntry(user.id, videoId);
      setHistory(updated);
      setActionMessage("Video analizi veritabanından ve geçmişinizden kalıcı olarak silindi.");
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Silme işlemi sırasında hata oluştu.";
      setActionMessage(`Hata: ${msg}`);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleDeleteChannel = async (channelIdOrKey: string) => {
    if (!user || !isAdmin) return;
    try {
      // 1. Backend'den kalıcı olarak sil
      await deleteAdminChannelAnalysis(channelIdOrKey);
      // 2. LocalStorage'dan sil
      const updated = removeChannelAnalysisEntry(user.id, channelIdOrKey);
      setChannelHistory(updated);
      setActionMessage("Kanal analizi veritabanından ve geçmişinizden kalıcı olarak silindi.");
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Silme işlemi sırasında hata oluştu.";
      setActionMessage(`Hata: ${msg}`);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-record">
            Geçmiş
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">Analizlerim</h1>
          <p className="mt-2 text-text-muted">Tamamladığınız video ve kanal analizlerini burada görüntüleyin.</p>
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

      {actionMessage && (
        <div className="rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 text-xs font-medium text-text-primary animate-fade-in shadow-md">
          {actionMessage}
        </div>
      )}

      {/* Sekmeler (Tabs) */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === "video"
              ? "bg-text-primary text-bg-base"
              : "text-text-muted hover:bg-bg-surface hover:text-text-primary"
          }`}
        >
          <span>Video Analizleri</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
            activeTab === "video" ? "bg-bg-base/20 text-bg-base" : "bg-bg-surface text-text-muted"
          }`}>
            {history.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("channel")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === "channel"
              ? "bg-text-primary text-bg-base"
              : "text-text-muted hover:bg-bg-surface hover:text-text-primary"
          }`}
        >
          <span>Kanal Analizleri</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
            activeTab === "channel" ? "bg-bg-base/20 text-bg-base" : "bg-bg-surface text-text-muted"
          }`}>
            {channelHistory.length}
          </span>
        </button>
      </div>

      {/* İçerik */}
      {activeTab === "video" ? (
        history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry) => (
              <AnalysisHistoryCard
                key={entry.id}
                entry={entry}
                isAdmin={isAdmin}
                onDelete={isAdmin ? handleDeleteVideo : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-bg-surface/50 p-12 text-center">
            <h2 className="font-display text-xl font-bold">Henüz video analizi yok</h2>
            <p className="mt-2 text-text-muted">Giriş yaptıktan sonra yaptığınız video analizleri burada listelenir.</p>
            <Link href="/analyze" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-accent-record px-5 text-sm font-bold text-[#17130b]">
              Video analizine git
            </Link>
          </div>
        )
      ) : (
        channelHistory.length > 0 ? (
          <div className="space-y-3">
            {channelHistory.map((entry) => (
              <ChannelAnalysisHistoryCard
                key={entry.id}
                entry={entry}
                isAdmin={isAdmin}
                onDelete={isAdmin ? handleDeleteChannel : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-bg-surface/50 p-12 text-center">
            <h2 className="font-display text-xl font-bold">Henüz kanal analizi yok</h2>
            <p className="mt-2 text-text-muted">Bir YouTube kanalının son 5 videosunu çapraz analiz ederek genel kanal sağlığını keşfedin.</p>
            <Link href="/kanal-analizi" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-accent-record px-5 text-sm font-bold text-[#17130b]">
              Kanal analizine git
            </Link>
          </div>
        )
      )}
    </div>
  );
}

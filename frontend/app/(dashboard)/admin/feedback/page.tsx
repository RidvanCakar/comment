"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getAdminFeedbacks,
  updateAdminFeedback,
  deleteAdminFeedback,
  type FeedbackItem,
  type FeedbackStatus,
  type FeedbackCategory,
} from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: {
    label: "Beklemede",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  in_review: {
    label: "İnceleniyor",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  planned: {
    label: "Planlandı",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  completed: {
    label: "Tamamlandı",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  rejected: {
    label: "Reddedildi",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
  },
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  feature_request: { label: "Yeni Özellik / Fikir", icon: "💡" },
  improvement: { label: "İyileştirme", icon: "⚡" },
  bug_report: { label: "Hata Bildirimi", icon: "🐛" },
  general: { label: "Genel Görüş", icon: "💬" },
};

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminFeedbacks({
        status: statusFilter === "all" ? undefined : statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        search: search.trim() || undefined,
        limit: 100,
      });
      setFeedbacks(res.feedbacks);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Geri bildirimler yüklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => {
    if (user?.role === "admin") {
      void fetchFeedbacks();
    }
  }, [user, fetchFeedbacks]);

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <p className="text-sm font-semibold text-sentiment-negative">
          Bu sayfaya yalnızca sistem yöneticileri erişebilir.
        </p>
      </div>
    );
  }

  const handleStatusChange = async (feedbackId: number, newStatus: FeedbackStatus) => {
    setActionLoadingId(feedbackId);
    try {
      const res = await updateAdminFeedback(feedbackId, { status: newStatus });
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? res.feedback : f)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Durum güncellenemedi.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveNote = async (feedbackId: number) => {
    setActionLoadingId(feedbackId);
    try {
      const res = await updateAdminFeedback(feedbackId, { admin_notes: tempNote });
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? res.feedback : f)),
      );
      setEditingNoteId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Not kaydedilemedi.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (feedbackId: number) => {
    if (!window.confirm("Bu geri bildirimi kalıcı olarak silmek istediğinizden emin misiniz?")) {
      return;
    }

    setActionLoadingId(feedbackId);
    try {
      await deleteAdminFeedback(feedbackId);
      setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Geri bildirim silinemedi.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // İstatistikler
  const totalCount = feedbacks.length;
  const pendingCount = feedbacks.filter((f) => f.status === "pending").length;
  const plannedCount = feedbacks.filter((f) => f.status === "planned" || f.status === "in_review").length;
  const featureCount = feedbacks.filter((f) => f.category === "feature_request").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Üst Başlık */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent-record/40 bg-accent-record/15 text-accent-record">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h6m-3 8 4-4H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4l-4 4Z" />
              </svg>
            </span>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Kullanıcı Geri Bildirimleri & Fikirler
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-text-muted sm:text-sm">
            Kullanıcıların gönderdiği tüm öneri, özellik istekleri ve hata bildirimlerini inceleyin ve yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchFeedbacks()}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-surface px-4 text-xs font-semibold text-text-primary hover:border-accent-record/40 transition"
        >
          <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Yenile</span>
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard label="Toplam Geri Bildirim" value={totalCount} icon="📊" />
        <StatCard label="Bekleyenler" value={pendingCount} icon="⏳" highlight={pendingCount > 0} />
        <StatCard label="İncelenen / Planlanan" value={plannedCount} icon="🚀" />
        <StatCard label="Özellik & Fikirler" value={featureCount} icon="💡" />
      </div>

      {/* Filtre ve Arama Alanı */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Durum Sekmeleri */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: "all", label: "Tümü" },
            { id: "pending", label: "Beklemede" },
            { id: "in_review", label: "İnceleniyor" },
            { id: "planned", label: "Planlandı" },
            { id: "completed", label: "Tamamlandı" },
            { id: "rejected", label: "Reddedildi" },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-accent-record text-[#17130b]"
                    : "text-text-muted hover:bg-fill-muted/60 hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Kategori ve Arama */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-border-subtle bg-bg-base/70 px-3 py-1.5 text-xs font-semibold text-text-primary outline-none focus:border-accent-record"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="feature_request">💡 Yeni Özellik / Fikir</option>
            <option value="improvement">⚡ İyileştirme</option>
            <option value="bug_report">🐛 Hata Bildirimi</option>
            <option value="general">💬 Genel Görüş</option>
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Başlık, içerik veya kullanıcı ara..."
            className="w-full sm:w-60 rounded-lg border border-border-subtle bg-bg-base/70 px-3 py-1.5 text-xs text-text-primary placeholder-text-muted/50 outline-none focus:border-accent-record"
          >
          </input>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="py-16 text-center text-text-muted">
          <div className="inline-flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin text-accent-record" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Geri bildirimler yükleniyor...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-sentiment-negative/30 bg-sentiment-negative/10 p-6 text-center text-sm text-sentiment-negative">
          {error}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-12 text-center text-text-muted">
          <span className="text-3xl">📭</span>
          <h3 className="mt-3 font-display text-lg font-bold text-text-primary">
            Henüz geri bildirim bulunamadı
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            Seçili filtrelere uygun kullanıcı geri bildirimi veya önerisi bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item) => {
            const statusConfig = STATUS_LABELS[item.status] || STATUS_LABELS.pending;
            const categoryConfig = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.general;
            const isActionLoading = actionLoadingId === item.id;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 shadow-md transition hover:border-border-subtle/80"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Rozetler ve Başlık */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-bg-base px-2 py-0.5 text-[11px] font-bold text-text-primary">
                        <span>{categoryConfig.icon}</span>
                        <span>{categoryConfig.label}</span>
                      </span>

                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                      >
                        {statusConfig.label}
                      </span>

                      <span className="font-mono text-[10px] text-text-muted">
                        {new Date(item.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-extrabold text-text-primary sm:text-lg">
                      {item.title}
                    </h3>

                    <p className="text-xs leading-relaxed text-text-muted whitespace-pre-line sm:text-sm">
                      {item.message}
                    </p>

                    {/* Gönderen Bilgisi */}
                    {item.user && (
                      <div className="pt-2 flex items-center gap-2 text-xs text-text-muted">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-record/20 text-[10px] font-bold text-accent-record">
                          {item.user.full_name?.slice(0, 1) || "U"}
                        </span>
                        <strong className="text-text-primary">{item.user.full_name}</strong>
                        <span>({item.user.email})</span>
                      </div>
                    )}

                    {/* Admin Notu */}
                    {item.admin_notes && editingNoteId !== item.id && (
                      <div className="mt-3 rounded-xl border border-accent-record/25 bg-accent-record/5 p-3 text-xs">
                        <span className="font-bold text-accent-record">Admin Notu:</span>{" "}
                        <span className="text-text-muted">{item.admin_notes}</span>
                      </div>
                    )}

                    {/* Not Düzenleme Formu */}
                    {editingNoteId === item.id && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          rows={2}
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="Bu geri bildirim için dahili admin notu yazın..."
                          className="w-full rounded-xl border border-border-subtle bg-bg-base p-2.5 text-xs text-text-primary outline-none focus:border-accent-record"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleSaveNote(item.id)}
                            disabled={isActionLoading}
                            className="rounded-lg bg-accent-record px-3 py-1 text-xs font-bold text-[#17130b]"
                          >
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNoteId(null)}
                            className="rounded-lg border border-border-subtle px-3 py-1 text-xs text-text-muted"
                          >
                            Vazgeç
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 border-t border-border-subtle pt-3 sm:border-t-0 sm:pt-0">
                    <select
                      value={item.status}
                      disabled={isActionLoading}
                      onChange={(e) =>
                        void handleStatusChange(item.id, e.target.value as FeedbackStatus)
                      }
                      className="rounded-lg border border-border-subtle bg-bg-base px-2.5 py-1.5 text-xs font-bold text-text-primary outline-none focus:border-accent-record disabled:opacity-50"
                    >
                      <option value="pending">⏳ Beklemede</option>
                      <option value="in_review">🔍 İnceleniyor</option>
                      <option value="planned">🚀 Planlandı</option>
                      <option value="completed">✅ Tamamlandı</option>
                      <option value="rejected">❌ Reddedildi</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(item.id);
                        setTempNote(item.admin_notes || "");
                      }}
                      className="rounded-lg border border-border-subtle px-2.5 py-1.5 text-[11px] font-semibold text-text-muted hover:text-text-primary hover:border-accent-record/30 transition"
                    >
                      {item.admin_notes ? "Notu Düzenle" : "+ Not Ekle"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(item.id)}
                      disabled={isActionLoading}
                      className="rounded-lg border border-sentiment-negative/20 px-2.5 py-1.5 text-[11px] font-semibold text-sentiment-negative hover:bg-sentiment-negative/10 transition disabled:opacity-50"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        highlight
          ? "border-accent-record/40 bg-accent-record/10"
          : "border-border-subtle bg-bg-surface"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span className="font-mono text-xl font-extrabold sm:text-2xl text-text-primary">
          {value}
        </span>
      </div>
      <p className="mt-2 text-[11px] font-semibold text-text-muted sm:text-xs">{label}</p>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyFeedbacks, type FeedbackItem } from "@/lib/api";
import FeedbackModal from "@/components/feedback/FeedbackModal";

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Beklemede", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  in_review: { label: "İnceleniyor", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  planned: { label: "Planlandı", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  completed: { label: "Tamamlandı", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  rejected: { label: "Reddedildi", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
};

const CATEGORY_ICONS: Record<string, string> = {
  feature_request: "💡",
  improvement: "⚡",
  bug_report: "🐛",
  general: "💬",
};

export default function FikirlerPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState<FeedbackItem[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await getMyFeedbacks();
      setMyFeedbacks(res.feedbacks);
    } catch {
      // sessizce geç
    } finally {
      setLoadingFeedbacks(false);
    }
  }, []);

  useEffect(() => {
    void fetchFeedbacks();
  }, [fetchFeedbacks]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Üst Başlık */}
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-record">
          Topluluk & Katkı
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-text-primary">
          Fikir & Öneri Paylaşımı
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Platformda görmek istediğin özellikleri, iyileştirme fikirlerini veya karşılaştığın hataları doğrudan bize ilet.
        </p>
      </div>

      {/* 💡 Ana Fikir & Geri Bildirim Banner'ı */}
      <section className="relative overflow-hidden rounded-3xl border border-accent-record/35 bg-gradient-to-br from-bg-surface via-bg-surface to-accent-record/5 p-6 sm:p-8 shadow-xl">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-accent-record/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-record/30 bg-accent-record/15 px-3 py-1 text-xs font-bold text-accent-record">
              <span>💡</span>
              <span>Geliştiriciye Öneri Gönder</span>
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary">
              Bir Fikrin veya Ek Özellik İsteğin mi Var?
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              YorumAI kullanıcı deneyimlerini ön planda tutarak geliştiriliyor. Yeni bir özellik veya tasarım önerisi için hemen bize yaz.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-accent-record px-6 font-display text-sm font-bold text-[#17130b] shadow-xl shadow-accent-record/20 transition-all hover:bg-accent-record/90 hover:-translate-y-0.5 shrink-0 cursor-pointer"
          >
            <span>Fikir / Öneri Gönder</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Gönderilen Geri Bildirimler */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text-primary">
            Gönderdiğin Fikir ve Öneriler
          </h2>
          <span className="font-mono text-xs text-text-muted">
            {myFeedbacks.length} bildirim
          </span>
        </div>

        {loadingFeedbacks ? (
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-8 text-center text-xs text-text-muted">
            Yükleniyor...
          </div>
        ) : myFeedbacks.length === 0 ? (
          <div className="rounded-2xl border border-border-subtle bg-bg-surface/60 p-7 text-center text-xs text-text-muted">
            Henüz bir fikir veya öneri göndermedin. İlk önerini yukarıdaki butona tıklayarak paylaşabilirsin!
          </div>
        ) : (
          <div className="space-y-3">
            {myFeedbacks.map((item) => {
              const statusCfg = STATUS_BADGES[item.status] || STATUS_BADGES.pending;
              const icon = CATEGORY_ICONS[item.category] || "💬";

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:p-5 transition hover:border-border-subtle/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{icon}</span>
                        <h3 className="font-display text-sm sm:text-base font-bold text-text-primary truncate">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {item.admin_notes && (
                        <div className="mt-2 rounded-xl border border-accent-record/25 bg-accent-record/5 p-2.5 text-xs text-text-muted">
                          <strong className="text-accent-record">Yönetici Notu:</strong> {item.admin_notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {new Date(item.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal */}
      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => void fetchFeedbacks()}
      />
    </div>
  );
}

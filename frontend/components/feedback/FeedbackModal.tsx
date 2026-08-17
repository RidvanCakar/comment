"use client";

import { FormEvent, useState } from "react";
import { submitFeedback, type FeedbackCategory } from "@/lib/api";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: { id: FeedbackCategory; label: string; icon: string; desc: string }[] = [
  {
    id: "feature_request",
    label: "Yeni Özellik / Fikir",
    icon: "💡",
    desc: "Platformda görmek istediğin yeni bir özellik",
  },
  {
    id: "improvement",
    label: "İyileştirme Önerisi",
    icon: "⚡",
    desc: "Mevcut özelliklerin daha iyi çalışması için önerin",
  },
  {
    id: "bug_report",
    label: "Hata Bildirimi",
    icon: "🐛",
    desc: "Karşılaştığın teknik bir aksaklık veya problem",
  },
  {
    id: "general",
    label: "Genel Görüş",
    icon: "💬",
    desc: "CommentLab deneyimin hakkında düşüncelerin",
  },
];

export default function FeedbackModal({ isOpen, onClose, onSuccess }: FeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>("feature_request");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError("Lütfen en az 3 karakterlik bir başlık yazın.");
      return;
    }

    if (message.trim().length < 5) {
      setError("Lütfen en az 5 karakterlik açıklayıcı bir mesaj yazın.");
      return;
    }

    setLoading(true);

    try {
      await submitFeedback({
        category,
        title: title.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Geri bildirim iletilemedi. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setTitle("");
    setMessage("");
    setError(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Arka Plan Karartma */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleResetAndClose}
      />

      {/* Modal Kutusu */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-2xl backdrop-blur-xl sm:p-8 animate-fade-in z-10 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleResetAndClose}
          aria-label="Kapat"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle text-text-muted hover:border-accent-record/40 hover:text-text-primary transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-record/40 bg-accent-record/15 text-3xl text-accent-record shadow-lg shadow-accent-record/15">
              🎉
            </div>

            <div>
              <h3 className="font-display text-2xl font-extrabold text-text-primary">
                Geri Bildirimin Alındı!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-text-muted leading-relaxed">
                Değerli önerin ve katkın için çok teşekkür ederiz. Tüm geri bildirimler geliştirici ekibimiz tarafından incelenmektedir.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent-record px-6 font-display text-sm font-bold text-[#17130b] shadow-lg shadow-accent-record/20 transition hover:bg-accent-record/90"
              >
                Harika, Kapat
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-record/30 bg-accent-record/10 text-accent-record text-xl">
                💡
              </span>
              <div>
                <h2 className="font-display text-xl font-extrabold text-text-primary">
                  Fikir & Geri Bildirim Paylaş
                </h2>
                <p className="text-xs text-text-muted">
                  CommentLab'i geliştirmek için önerilerini ve karşılaştığın sorunları bizimle paylaş.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Kategori Seçici */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Kategori Seçin
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                  {CATEGORIES.map((cat) => {
                    const selected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-accent-record bg-accent-record/10 text-text-primary ring-1 ring-accent-record/30"
                            : "border-border-subtle bg-bg-base/50 text-text-muted hover:border-border-subtle hover:text-text-primary"
                        }`}
                      >
                        <span className="text-xl shrink-0">{cat.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-text-primary">{cat.label}</p>
                          <p className="text-[10px] leading-tight text-text-muted line-clamp-1">{cat.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Başlık */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Başlık
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    category === "feature_request"
                      ? "Örn: Analiz sonuçlarını PDF / Excel olarak indirme..."
                      : category === "bug_report"
                        ? "Örn: Video analizi sırasında zaman aşımı alıyorum..."
                        : "Geri bildiriminizin kısa özeti..."
                  }
                  required
                  maxLength={200}
                  disabled={loading}
                  className="w-full rounded-xl border border-border-subtle bg-bg-base/70 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 outline-none transition focus:border-accent-record focus:ring-1 focus:ring-accent-record"
                />
              </div>

              {/* Mesaj */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Detaylı Açıklama
                  </label>
                  <span className="font-mono text-[10px] text-text-muted">
                    {message.length}/5000
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Aklındaki fikir nedir? Nasıl çalışmalı ve sana nasıl bir fayda sağlamalı? Lütfen detaylandır..."
                  required
                  maxLength={5000}
                  disabled={loading}
                  className="w-full rounded-xl border border-border-subtle bg-bg-base/70 p-3.5 text-sm text-text-primary placeholder-text-muted/50 outline-none transition focus:border-accent-record focus:ring-1 focus:ring-accent-record resize-none"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-sentiment-negative/30 bg-sentiment-negative/10 p-3 text-xs text-sentiment-negative">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  disabled={loading}
                  className="rounded-xl border border-border-subtle px-4 py-2.5 text-xs font-bold text-text-muted hover:border-border-subtle hover:text-text-primary transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !message.trim()}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-accent-record px-6 text-xs font-bold uppercase tracking-wider text-[#17130b] shadow-lg shadow-accent-record/15 transition hover:bg-accent-record/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <span>Gönder</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

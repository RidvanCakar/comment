"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=%2Fdashboard");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
        Panel yükleniyor…
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <div className="flex min-h-screen">
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="fixed inset-y-0 left-0 w-72">
            <DashboardSidebar />
          </div>
        </div>

        {mobileOpen && (
          <>
            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
              <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border-subtle bg-bg-base/90 px-4 py-3 backdrop-blur-xl lg:hidden">
            <button
              type="button"
              aria-label="Menüyü aç"
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle text-text-primary"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <span className="font-display text-lg font-extrabold">
              Yorum<span className="text-accent-record">AI</span>
            </span>
          </header>

          {!user.is_verified && !user.isVerified && (
            <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>
                    <strong>E-posta adresiniz henüz doğrulanmadı.</strong> Tüm analiz ve platform özelliklerine erişmek için lütfen mailinizi doğrulayın.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <UnverifiedResendButton email={user.email} />
                </div>
              </div>
            </div>
          )}

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

function UnverifiedResendButton({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState<string | null>(null);

  const handleSend = async () => {
    setSending(true);
    setSentMsg(null);
    try {
      const { resendVerification } = await import("@/lib/api");
      const res = await resendVerification(email);
      setSentMsg(res.message || "E-posta gönderildi!");
    } catch {
      setSentMsg("Gönderilemedi, tekrar deneyin.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {sentMsg ? (
        <span className="text-xs font-semibold text-emerald-400">{sentMsg}</span>
      ) : (
        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="rounded-lg bg-amber-500/20 px-3 py-1.5 font-semibold text-amber-300 hover:bg-amber-500/30 transition disabled:opacity-50"
        >
          {sending ? "Gönderiliyor…" : "Tekrar Gönder"}
        </button>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [countdown, setCountdown] = useState(4);

  const nextUrl = pathname ? `/login?next=${encodeURIComponent(pathname)}` : "/login?next=%2Fdashboard";
  const registerUrl = pathname ? `/register?next=${encodeURIComponent(pathname)}` : "/register";

  useEffect(() => {
    if (loading || user) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.replace(nextUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, user, router, nextUrl]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 animate-spin text-accent-record" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Panel yükleniyor…</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base px-4 py-12 text-center">
        <div className="mx-auto max-w-md rounded-3xl border border-accent-record/30 bg-bg-surface p-7 sm:p-9 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-record/30 bg-accent-record/15 text-accent-record">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <span className="mt-4 inline-block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-record">
            Yetkilendirme Gerekli
          </span>

          <h2 className="mt-2 font-display text-2xl font-extrabold text-text-primary">
            Giriş Yapmanız Gerekiyor
          </h2>

          <p className="mt-3 text-xs leading-relaxed text-text-muted sm:text-sm">
            Kanal analizi ve gelişmiş platform özelliklerini kullanabilmek için lütfen giriş yapın veya ücretsiz hesap oluşturun.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={nextUrl}
              className="flex min-h-11 items-center justify-center rounded-xl bg-accent-record px-5 text-sm font-bold text-[#17130b] shadow-lg shadow-accent-record/20 transition-all hover:bg-accent-record/90 hover:-translate-y-0.5"
            >
              Giriş Yap
            </Link>

            <Link
              href={registerUrl}
              className="flex min-h-11 items-center justify-center rounded-xl border border-border-subtle bg-bg-base/70 px-5 text-sm font-bold text-text-primary transition-all hover:border-accent-record/40"
            >
              Ücretsiz Kayıt Ol (+5 Kredi)
            </Link>
          </div>

          <p className="mt-5 font-mono text-[11px] text-text-muted">
            {countdown > 0 ? (
              <span>{countdown} saniye içinde giriş sayfasına yönlendiriliyorsunuz...</span>
            ) : (
              <span>Yönlendiriliyor...</span>
            )}
          </p>
        </div>
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

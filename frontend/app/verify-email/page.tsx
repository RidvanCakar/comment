"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { resendVerification, verifyEmailToken, ApiError } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { user, refresh } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">(
    token ? "loading" : "idle"
  );
  const [message, setMessage] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    async function runVerification() {
      try {
        const res = await verifyEmailToken(token as string);
        if (mounted) {
          setStatus("success");
          setMessage(res.message || "E-posta adresiniz başarıyla doğrulandı!");
          await refresh();
        }
      } catch (err) {
        if (mounted) {
          setStatus("error");
          if (err instanceof ApiError) {
            setMessage(err.message);
          } else {
            setMessage("E-posta doğrulanamadı. Bağlantı geçersiz veya süresi dolmuş olabilir.");
          }
        }
      }
    }

    void runVerification();
    return () => {
      mounted = false;
    };
  }, [token, refresh]);

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await resendVerification(user?.email);
      setResendStatus({ type: "success", text: res.message || "Doğrulama e-postası tekrar gönderildi." });
    } catch (err) {
      if (err instanceof ApiError) {
        setResendStatus({ type: "error", text: err.message });
      } else {
        setResendStatus({ type: "error", text: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin." });
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-4 py-12 text-text-primary">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-surface/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <Link href="/" className="inline-block font-display text-2xl font-black">
            Yorum<span className="text-accent-record">AI</span>
          </Link>
        </div>

        {status === "loading" && (
          <div className="mt-8 flex flex-col items-center py-6 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-record/30 border-t-accent-record" />
            <h2 className="mt-6 text-xl font-bold">E-posta Doğrulanıyor…</h2>
            <p className="mt-2 text-sm text-text-muted">
              Lütfen bekleyin, doğrulama jetonunuz kontrol ediliyor.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="mt-8 flex flex-col items-center py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/5">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-white">E-posta Doğrulandı!</h2>
            <p className="mt-2 text-sm text-text-muted">{message}</p>
            <div className="mt-8 w-full">
              <Link
                href="/dashboard"
                className="flex w-full justify-center rounded-xl bg-accent-record py-3.5 text-center font-semibold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98]"
              >
                Panele Git
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mt-8 flex flex-col items-center py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 ring-8 ring-rose-500/5">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-white">Doğrulama Başarısız</h2>
            <p className="mt-2 text-sm text-text-muted">{message}</p>

            {resendStatus && (
              <div
                className={`mt-4 w-full rounded-lg p-3 text-xs font-medium ${
                  resendStatus.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {resendStatus.text}
              </div>
            )}

            <div className="mt-8 flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex w-full items-center justify-center rounded-xl bg-bg-surface-hover py-3.5 font-semibold text-text-primary border border-border-subtle transition hover:bg-border-subtle/50 active:scale-[0.98] disabled:opacity-50"
              >
                {resending ? "Gönderiliyor…" : "Yeniden Mail Gönder"}
              </button>
              <Link
                href="/login"
                className="text-xs text-text-muted hover:text-white transition"
              >
                Giriş sayfasına dön
              </Link>
            </div>
          </div>
        )}

        {status === "idle" && (
          <div className="mt-8 flex flex-col items-center py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-record/10 text-accent-record ring-8 ring-accent-record/5">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-white">Mail Adresinizi Doğrulayın</h2>
            <p className="mt-2 text-sm text-text-muted">
              Hesabınıza tam erişim sağlamak için e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.
            </p>

            {resendStatus && (
              <div
                className={`mt-4 w-full rounded-lg p-3 text-xs font-medium ${
                  resendStatus.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {resendStatus.text}
              </div>
            )}

            <div className="mt-8 flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex w-full items-center justify-center rounded-xl bg-accent-record py-3.5 font-semibold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {resending ? "Gönderiliyor…" : "Yeniden Mail Gönder"}
              </button>
              <Link
                href="/dashboard"
                className="text-xs text-text-muted hover:text-white transition"
              >
                Panele dön
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Yükleniyor…
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

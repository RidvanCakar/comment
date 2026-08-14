"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import AuthShell, { inputClass, primaryButtonClass } from "@/components/auth/AuthShell";
import { resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Geçersiz şifre sıfırlama bağlantısı. Lütfen e-postanızdaki bağlantıyı kontrol edin.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.");
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Şifre sıfırlanamadı.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Geçersiz Bağlantı"
        description="Şifre sıfırlama bağlantısı geçersiz veya eksik."
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-sentiment-negative/30 bg-sentiment-negative/10 text-sentiment-negative">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <p className="text-sm text-text-muted">
            Lütfen e-postanıza gönderilen bağlantıyı eksiksiz açtığınızdan emin olun veya yeni bir sıfırlama talebinde bulunun.
          </p>

          <Link href="/forgot-password" className={primaryButtonClass}>
            Yeni Sıfırlama Bağlantısı İste
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell
        title="Şifreniz Güncellendi"
        description="Yeni şifreniz başarıyla kaydedildi."
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <p className="text-sm text-text-muted">
            Hesap güvenliğiniz için önceki oturumlarınız sonlandırıldı. Yeni şifrenizle hemen giriş yapabilirsiniz.
          </p>

          <Link href="/login" className={primaryButtonClass}>
            Giriş Yap
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Yeni Şifre Belirle"
      description="Hesabınız için güçlü ve güvenli yeni bir şifre oluşturun."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold">
          Yeni Şifre
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            required
            placeholder="En az 8 karakter (Büyük, küçük harf ve rakam)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </label>

        <label className="block text-sm font-semibold">
          Yeni Şifre Tekrar
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            required
            placeholder="Yeni şifrenizi tekrar girin"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
          />
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-sentiment-negative/25 bg-sentiment-negative/10 p-3 text-sm text-sentiment-negative"
          >
            {error}
          </p>
        )}

        <button
          className={primaryButtonClass}
          disabled={submitting || !password || !confirmPassword}
        >
          {submitting ? "Güncelleniyor…" : "Şifreyi Güncelle"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Yükleniyor…
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthShell, { inputClass, primaryButtonClass } from "@/components/auth/AuthShell";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Şifre sıfırlama bağlantısı gönderilemedi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthShell
        title="E-posta Gönderildi"
        description="Şifre sıfırlama talimatları e-posta adresinize iletildi."
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-record/30 bg-accent-record/10 text-accent-record">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="rounded-xl border border-border-subtle bg-bg-base/60 p-4 text-left text-xs leading-relaxed text-text-muted">
            <p className="font-semibold text-text-primary">
              <span className="text-accent-record">{email}</span> adresine bir bağlantı gönderdik.
            </p>
            <p className="mt-2">
              Lütfen gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol edin. Bağlantı 1 saat boyunca geçerlidir.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              className="text-xs font-semibold text-accent-record hover:underline"
            >
              Farklı bir e-posta ile tekrar dene
            </button>

            <Link
              href="/login"
              className={primaryButtonClass}
            >
              Giriş Ekranına Dön
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Şifremi Unuttum"
      description="Hesabınıza kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold">
          E-posta
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            placeholder="ornek@alanadi.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button className={primaryButtonClass} disabled={submitting || !email.trim()}>
          {submitting ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Şifreni hatırladın mı?{" "}
        <Link href="/login" className="font-bold text-accent-record hover:underline">
          Giriş yap
        </Link>
      </p>
    </AuthShell>
  );
}

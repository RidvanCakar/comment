"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import AuthShell, { inputClass, primaryButtonClass } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { safeLocalPath } from "@/lib/auth-navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const next = safeLocalPath(params.get("next"));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.replace(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Giriş yapılamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Tekrar hoş geldin" description="Analizlerini ve hesap ayarlarını yönetmek için giriş yap.">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold">
          E-posta
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </label>
        <div>
          <div className="flex items-center justify-between pb-1">
            <label className="text-sm font-semibold">Şifre</label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-accent-record hover:underline"
            >
              Şifremi unuttum
            </Link>
          </div>
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-sentiment-negative/25 bg-sentiment-negative/10 p-3 text-sm text-sentiment-negative"
          >
            {error}
          </p>
        )}
        <button className={primaryButtonClass} disabled={submitting}>
          {submitting ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-text-muted">
        Hesabın yok mu?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="font-bold text-accent-record hover:underline"
        >
          Kayıt ol
        </Link>
      </p>
    </AuthShell>
  );
}

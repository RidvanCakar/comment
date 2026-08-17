"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import AuthShell, { inputClass, primaryButtonClass } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { safeLocalPath } from "@/lib/auth-navigation";

const passwordValid = (value: string) =>
  value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const next = safeLocalPath(params.get("next"));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!passwordValid(form.password)) {
      setError("Şifre en az 8 karakter, büyük harf, küçük harf ve rakam içermelidir.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      router.replace(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kayıt oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <AuthShell
      title="Hesabını oluştur"
      description="CommentLab hesabını birkaç saniye içinde oluşturarak başlayabilirsin."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold">
          Ad soyad
          <input
            className={inputClass}
            autoComplete="name"
            minLength={2}
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            disabled={submitting}
          />
        </label>
        <label className="block text-sm font-semibold">
          E-posta
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            disabled={submitting}
          />
        </label>
        <label className="block text-sm font-semibold">
          Şifre
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            disabled={submitting}
          />
          <span className="mt-2 block text-xs font-normal leading-5 text-text-muted">
            En az 8 karakter; büyük harf, küçük harf ve rakam.
          </span>
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-sentiment-negative/25 bg-sentiment-negative/10 p-3 text-sm text-sentiment-negative"
          >
            {error}
          </p>
        )}
        <button className={primaryButtonClass} disabled={submitting}>
          {submitting ? "Hesap oluşturuluyor…" : "Hesap oluştur"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-text-muted">
        Zaten hesabın var mı?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-bold text-accent-record hover:underline"
        >
          Giriş yap
        </Link>
      </p>
    </AuthShell>
  );
}

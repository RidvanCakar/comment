"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

function Avatar({ name, src }: { name: string; src?: string | null }) {
  if (src) {
    return (
      // External avatar hosts are intentionally unrestricted.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-8 w-8 rounded-full object-cover" />
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-record/15 font-display text-xs font-bold text-accent-record">
      {name.trim().slice(0, 2).toLocaleUpperCase("tr-TR")}
    </span>
  );
}

export default function AuthNav() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (loading) {
    return <div className="h-11 w-24 animate-pulse rounded-lg bg-fill-muted" aria-label="Oturum yükleniyor" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Link href="/login" className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-text-muted transition-colors hover:text-text-primary">
          Giriş
        </Link>
        <Link href="/register" className="flex min-h-11 items-center rounded-lg border border-accent-record/35 bg-accent-record/10 px-3 text-sm font-bold text-accent-record transition-colors hover:bg-accent-record/20">
          Kayıt
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setOpen(false);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-11 items-center gap-2 rounded-lg border border-border-subtle bg-bg-surface/70 px-2.5 text-left transition-colors hover:border-accent-record/30"
      >
        <Avatar name={user.name} src={user.avatar_url} />
        <span className="hidden max-w-28 truncate text-sm font-semibold text-text-primary lg:block">{user.name}</span>
        <span className="text-xs text-text-muted" aria-hidden>▾</span>
      </button>
      {open && (
        <>
          <button type="button" aria-label="Menüyü kapat" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border-subtle bg-bg-surface p-1.5 shadow-2xl">
            <div className="border-b border-border-subtle px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-text-primary">{user.name}</p>
              <p className="truncate text-xs text-text-muted">{user.email}</p>
            </div>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-text-primary hover:bg-fill-muted">
              Panel
            </Link>
            <Link href="/ayarlar" onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-text-primary hover:bg-fill-muted">
              Ayarlar
            </Link>
            {user.role === "admin" && (
              <Link href="/admin/users" onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-text-primary hover:bg-fill-muted">
                Kullanıcı yönetimi
              </Link>
            )}
            <button type="button" disabled={loggingOut} onClick={handleLogout} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-sentiment-negative hover:bg-sentiment-negative/10 disabled:opacity-50">
              {loggingOut ? "Çıkış yapılıyor…" : "Çıkış yap"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

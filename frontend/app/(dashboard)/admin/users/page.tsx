"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiRequest, normalizeUser, type AuthUser, type UsersPage } from "@/lib/api";

interface UsersPayload {
  users?: AuthUser[];
  items?: AuthUser[];
  data?: AuthUser[];
  page?: number;
  page_size?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
  pages?: number;
}

function normalizeUsers(payload: UsersPayload | AuthUser[], requestedPage: number): UsersPage {
  const rawUsers = Array.isArray(payload) ? payload : payload.users || payload.items || payload.data || [];
  const users = rawUsers.map(normalizeUser);
  const meta = Array.isArray(payload) ? {} : payload;
  const pageSize = meta.page_size || meta.limit || Math.max(users.length, 20);
  const total = meta.total ?? users.length;
  return {
    users,
    page: meta.page || requestedPage,
    page_size: pageSize,
    total,
    total_pages: meta.total_pages || meta.pages || Math.max(1, Math.ceil(total / pageSize)),
  };
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<UsersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [deleting, setDeleting] = useState<AuthUser | null>(null);
  const [toppingCredits, setToppingCredits] = useState<AuthUser | null>(null);
  const [creditAmount, setCreditAmount] = useState("3");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.replace(user ? "/dashboard" : "/login?next=%2Fadmin%2Fusers");
    }
  }, [authLoading, router, user]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ page: String(page), page_size: "20" });
    Object.entries(applied).forEach(([key, value]) => {
      if (!value) return;
      if (key === "status") query.set("is_active", String(value === "active"));
      else query.set(key, value);
    });
    try {
      const payload = await apiRequest<UsersPayload | AuthUser[]>(`/admin/users?${query}`, { cache: "no-store" });
      setResult(normalizeUsers(payload, page));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kullanıcılar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [applied, page]);

  useEffect(() => {
    if (user?.role === "admin") queueMicrotask(() => void load());
  }, [load, user]);

  const search = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setApplied(filters);
  };

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest(`/admin/users/${encodeURIComponent(String(editing.id))}`, {
        method: "PATCH",
        body: JSON.stringify({
          full_name: String(form.get("name") || "").trim(),
          email: String(form.get("email") || "").trim(),
          avatar_url: String(form.get("avatar_url") || "").trim() || null,
          role: form.get("role"),
          is_active: form.get("status") === "active",
          analysis_credits: Number(form.get("analysis_credits") || 0),
        }),
      });
      setEditing(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kullanıcı güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const addCredits = async (event: FormEvent) => {
    event.preventDefault();
    if (!toppingCredits) return;
    const add = Number(creditAmount);
    if (!Number.isFinite(add) || add < 1) {
      setError("Geçerli bir kredi miktarı girin.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/admin/users/${encodeURIComponent(String(toppingCredits.id))}/credits`, {
        method: "POST",
        body: JSON.stringify({ add }),
      });
      setToppingCredits(null);
      setCreditAmount("3");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kredi eklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async () => {
    if (!deleting) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/admin/users/${encodeURIComponent(String(deleting.id))}`, { method: "DELETE" });
      setDeleting(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kullanıcı silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || user?.role !== "admin") {
    return <p className="text-text-muted">Yetki kontrol ediliyor…</p>;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-record">Yönetim</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Kullanıcılar</h1>
          <p className="mt-2 text-text-muted">Hesapları, rolleri ve erişim durumlarını yönet.</p>
        </div>
        {result && (
          <span className="rounded-full border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-text-muted">
            {result.total.toLocaleString("tr-TR")} kullanıcı
          </span>
        )}
      </div>

      <form onSubmit={search} className="mt-7 grid gap-3 rounded-2xl border border-border-subtle bg-bg-surface/80 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <input aria-label="Kullanıcı ara" className={`${inputClass} mt-0`} placeholder="Ad veya e-posta ara…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <Filter label="Rol" value={filters.role} onChange={(role) => setFilters({ ...filters, role })} options={[["", "Tüm roller"], ["user", "Kullanıcı"], ["admin", "Yönetici"]]} />
        <Filter label="Durum" value={filters.status} onChange={(status) => setFilters({ ...filters, status })} options={[["", "Tüm durumlar"], ["active", "Aktif"], ["inactive", "Pasif"]]} />
        <button className="min-h-12 rounded-lg bg-accent-record px-5 text-sm font-bold text-[#17130b]">Filtrele</button>
      </form>

      {error && <p role="alert" className="mt-5 rounded-xl border border-sentiment-negative/30 bg-sentiment-negative/10 p-4 text-sm text-sentiment-negative">{error}</p>}

      <section className="mt-6 overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/70">
        <div className="hidden grid-cols-[2fr_1fr_0.8fr_1fr_1.2fr_auto] gap-3 border-b border-border-subtle px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted lg:grid">
          <span>Kullanıcı</span><span>Rol / durum</span><span>Kredi</span><span>Doğrulama</span><span>Tarihler</span><span>İşlem</span>
        </div>
        {loading ? <p className="p-10 text-center text-text-muted">Kullanıcılar yükleniyor…</p> : result?.users.length ? result.users.map((account) => (
          <div key={String(account.id)} className="grid gap-4 border-b border-border-subtle p-5 last:border-b-0 lg:grid-cols-[2fr_1fr_0.8fr_1fr_1.2fr_auto] lg:items-center lg:gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {account.avatar_url ? <img src={account.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-record/15 font-bold text-accent-record">{account.name.slice(0, 1).toUpperCase()}</span>}
              <div className="min-w-0"><p className="truncate font-semibold">{account.name}</p><p className="truncate text-sm text-text-muted">{account.email}</p></div>
            </div>
            <Cell label="Rol / durum"><span className="capitalize">{account.role}</span><span className="mx-1 text-text-muted">·</span><span className="capitalize">{account.status || "active"}</span></Cell>
            <Cell label="Kredi">
              {account.role === "admin" ? (
                <span className="text-accent-record">Sınırsız</span>
              ) : (
                <span>{account.analysis_credits ?? 0}</span>
              )}
            </Cell>
            <Cell label="Doğrulama">{verificationLabel(account.email_verified)}</Cell>
            <Cell label="Tarihler"><span className="block">Giriş: {formatDate(account.last_login_at)}</span><span className="block">Kayıt: {formatDate(account.created_at)}</span></Cell>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {account.role !== "admin" && (
                <button onClick={() => { setToppingCredits(account); setCreditAmount("3"); }} className="min-h-11 rounded-lg border border-accent-record/30 px-3 text-sm text-accent-record hover:bg-accent-record/10">Kredi ekle</button>
              )}
              <button onClick={() => setEditing(account)} className="min-h-11 rounded-lg border border-border-subtle px-3 text-sm hover:border-accent-record/40">Düzenle</button>
              <button onClick={() => setDeleting(account)} disabled={account.id === user.id} className="min-h-11 rounded-lg border border-sentiment-negative/30 px-3 text-sm text-sentiment-negative disabled:opacity-30">Sil</button>
            </div>
          </div>
        )) : <p className="p-10 text-center text-text-muted">Filtrelerle eşleşen kullanıcı bulunamadı.</p>}
      </section>

      {result && result.total_pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3">
          <button disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="min-h-11 rounded-lg border border-border-subtle px-4 disabled:opacity-40">Önceki</button>
          <span className="text-sm text-text-muted">{result.page} / {result.total_pages}</span>
          <button disabled={page >= result.total_pages || loading} onClick={() => setPage((p) => p + 1)} className="min-h-11 rounded-lg border border-border-subtle px-4 disabled:opacity-40">Sonraki</button>
        </nav>
      )}

      {editing && <Modal title="Kullanıcıyı düzenle" onClose={() => setEditing(null)}><form onSubmit={saveUser} className="space-y-4"><label className="block text-sm font-semibold">Ad soyad<input name="name" className={inputClass} required defaultValue={editing.name} /></label><label className="block text-sm font-semibold">E-posta<input name="email" type="email" className={inputClass} required defaultValue={editing.email} /></label><label className="block text-sm font-semibold">Avatar URL<input name="avatar_url" type="url" className={inputClass} defaultValue={editing.avatar_url || ""} /></label>{editing.role !== "admin" && <label className="block text-sm font-semibold">Analiz kredisi<input name="analysis_credits" type="number" min={0} className={inputClass} defaultValue={editing.analysis_credits ?? 0} /></label>}<Filter name="role" label="Rol" value={editing.role} options={[["user", "Kullanıcı"], ["admin", "Yönetici"]]} /><Filter name="status" label="Durum" value={editing.status || "active"} options={[["active", "Aktif"], ["inactive", "Pasif"]]} /><button disabled={busy} className="min-h-12 w-full rounded-lg bg-accent-record font-bold text-[#17130b]">{busy ? "Kaydediliyor…" : "Kaydet"}</button></form></Modal>}
      {toppingCredits && <Modal title="Kredi ekle" onClose={() => setToppingCredits(null)}><form onSubmit={addCredits} className="space-y-4"><p className="text-sm text-text-muted"><strong className="text-text-primary">{toppingCredits.name}</strong> hesabına eklenecek analiz kredisi.</p><label className="block text-sm font-semibold">Eklenecek kredi<input className={inputClass} type="number" min={1} required value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} /></label><button disabled={busy} className="min-h-12 w-full rounded-lg bg-accent-record font-bold text-[#17130b]">{busy ? "Ekleniyor…" : "Kredi ekle"}</button></form></Modal>}
      {deleting && <Modal title="Kullanıcıyı sil" onClose={() => setDeleting(null)}><p className="text-sm leading-6 text-text-muted"><strong className="text-text-primary">{deleting.name}</strong> hesabı kalıcı olarak silinecek. Bu işlem geri alınamaz.</p><div className="mt-6 flex gap-3"><button onClick={() => setDeleting(null)} className="min-h-11 flex-1 rounded-lg border border-border-subtle">Vazgeç</button><button onClick={deleteUser} disabled={busy} className="min-h-11 flex-1 rounded-lg bg-sentiment-negative font-bold text-white">{busy ? "Siliniyor…" : "Kalıcı sil"}</button></div></Modal>}
    </div>
  );
}

function Filter({ label, value, onChange, options, name }: { label: string; value: string; onChange?: (value: string) => void; options: string[][]; name?: string }) {
  return <label className="sr-only">{label}<select name={name} aria-label={label} className={`${inputClass} mt-0`} {...(onChange ? { value, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.target.value) } : { defaultValue: value })}>{options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}</select></label>;
}
function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="text-sm"><span className="mr-2 font-mono text-[10px] font-bold uppercase text-text-muted lg:hidden">{label}</span>{children}</div>;
}
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-surface p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between gap-4"><h2 className="font-display text-xl font-bold">{title}</h2><button onClick={onClose} aria-label="Kapat" className="h-11 w-11 rounded-lg text-xl text-text-muted hover:bg-fill-muted">×</button></div>{children}</div></div>;
}
function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("tr-TR") : "—";
}
function verificationLabel(value?: boolean | null) {
  return value == null ? "Belirtilmedi" : value ? "Doğrulandı" : "Doğrulanmadı";
}

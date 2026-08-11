"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, primaryButtonClass } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiRequest, type AuthUser, unwrapUser } from "@/lib/api";

type Feedback = { type: "success" | "error"; text: string } | null;

export default function SettingsPanel() {
  const { user, refresh, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string | null; avatar_url: string | null }>({ name: null, avatar_url: null });
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "" });
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);

  if (!user) return null;

  const profileName = profile.name ?? user.name;
  const profileAvatar = profile.avatar_url ?? user.avatar_url ?? "";

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setBusy("profile");
    setFeedback(null);
    try {
      const payload = await apiRequest<AuthUser | { user: AuthUser }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ full_name: profileName.trim(), avatar_url: profileAvatar.trim() || null }),
      });
      const updated = unwrapUser(payload);
      setProfile({ name: updated.name, avatar_url: updated.avatar_url || "" });
      await refresh();
      setFeedback({ type: "success", text: "Profil bilgilerin güncellendi." });
    } catch (error) {
      setFeedback({ type: "error", text: error instanceof Error ? error.message : "Profil güncellenemedi." });
    } finally {
      setBusy("");
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    if (
      passwords.new_password.length < 8 ||
      !/[A-Z]/.test(passwords.new_password) ||
      !/[a-z]/.test(passwords.new_password) ||
      !/\d/.test(passwords.new_password)
    ) {
      setFeedback({ type: "error", text: "Yeni şifre 8+ karakter, büyük/küçük harf ve rakam içermelidir." });
      return;
    }
    setBusy("password");
    try {
      await apiRequest<void>("/users/me/change-password", { method: "POST", body: JSON.stringify(passwords) });
      setPasswords({ current_password: "", new_password: "" });
      setFeedback({ type: "success", text: "Şifren başarıyla değiştirildi." });
    } catch (error) {
      setFeedback({ type: "error", text: error instanceof Error ? error.message : "Şifre değiştirilemedi." });
    } finally {
      setBusy("");
    }
  };

  const deleteAccount = async () => {
    setBusy("delete");
    setFeedback(null);
    try {
      await apiRequest<void>("/users/me", {
        method: "DELETE",
        body: JSON.stringify({ current_password: deletePassword }),
      });
      await logout().catch(() => undefined);
      router.replace("/");
    } catch (error) {
      setFeedback({ type: "error", text: error instanceof Error ? error.message : "Hesap silinemedi." });
      setBusy("");
    }
  };

  return (
    <>
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-record">Hesap ayarları</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">Ayarlar</h1>
        <p className="mt-2 text-text-muted">Kişisel bilgilerini ve hesap güvenliğini yönet.</p>
      </div>

      {feedback && (
        <p
          role="status"
          className={`mt-6 rounded-xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-sentiment-positive/30 bg-sentiment-positive/10 text-sentiment-positive"
              : "border-sentiment-negative/30 bg-sentiment-negative/10 text-sentiment-negative"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-7">
          <h2 className="font-display text-xl font-bold">Profil bilgileri</h2>
          <form onSubmit={saveProfile} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">
              Ad soyad
              <input className={inputClass} minLength={2} required value={profileName} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </label>
            <label className="block text-sm font-semibold">
              Avatar URL
              <input className={inputClass} type="url" placeholder="https://…" value={profileAvatar} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} />
            </label>
            <button className={primaryButtonClass} disabled={busy === "profile"}>
              {busy === "profile" ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-7">
          <h2 className="font-display text-xl font-bold">Hesap özeti</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <Info label="E-posta" value={user.email} />
              <Info label="Rol" value={user.role} />
              <Info
                label="Analiz kredisi"
                value={user.role === "admin" ? "Sınırsız" : String(user.analysis_credits ?? 0)}
              />
              <Info
              label="E-posta durumu"
              value={user.email_verified == null ? "Belirtilmedi" : user.email_verified ? "Doğrulandı" : "Doğrulanmadı"}
            />
          </dl>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-7">
          <h2 className="font-display text-xl font-bold">Şifre değiştir</h2>
          <form onSubmit={changePassword} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">
              Mevcut şifre
              <input className={inputClass} type="password" autoComplete="current-password" required value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} />
            </label>
            <label className="block text-sm font-semibold">
              Yeni şifre
              <input className={inputClass} type="password" autoComplete="new-password" required minLength={8} value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} />
            </label>
            <button className={primaryButtonClass} disabled={busy === "password"}>
              {busy === "password" ? "Değiştiriliyor…" : "Şifreyi değiştir"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-sentiment-negative/25 bg-sentiment-negative/5 p-5 sm:p-7">
          <h2 className="font-display text-xl font-bold">Hesabı sil</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">Bu işlem kalıcıdır ve geri alınamaz.</p>
          <label className="mt-5 flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={confirmDelete} onChange={(e) => setConfirmDelete(e.target.checked)} className="h-4 w-4 accent-[#D96C6C]" />
            Hesabımı kalıcı olarak silmek istediğimi onaylıyorum.
          </label>
          <input className={inputClass} type="password" placeholder="Onay için şifren" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
          <button
            type="button"
            onClick={deleteAccount}
            disabled={!confirmDelete || !deletePassword || busy === "delete"}
            className="mt-4 min-h-12 w-full rounded-lg border border-sentiment-negative/40 bg-sentiment-negative/10 px-4 text-sm font-bold text-sentiment-negative hover:bg-sentiment-negative/20 disabled:opacity-40"
          >
            {busy === "delete" ? "Siliniyor…" : "Hesabımı sil"}
          </button>
        </section>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</dt>
      <dd className="mt-1 break-all font-medium text-text-primary">{value}</dd>
    </div>
  );
}

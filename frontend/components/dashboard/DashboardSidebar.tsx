"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";
import DashboardIcon from "@/components/dashboard/DashboardIcon";
import { dashboardNavItems } from "@/lib/dashboard-nav";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const items = dashboardNavItems.filter((item) => !item.adminOnly || user.role === "admin");

  return (
    <aside className="flex h-full w-full flex-col border-r border-border-subtle bg-bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-5">
        <Link href="/dashboard" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5 font-display text-lg font-extrabold">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent-record/30 bg-accent-record/10 text-accent-record">Y</span>
          <span className="truncate">Yorum<span className="text-accent-record">AI</span></span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="px-4 py-4">
        <p className="px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Kişisel</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-fill-muted text-text-primary"
                  : "text-text-muted hover:bg-fill-muted/70 hover:text-text-primary"
              }`}
            >
              <DashboardIcon name={item.icon} className={`h-5 w-5 shrink-0 ${active ? "text-accent-record" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-subtle p-4">
        <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-base/50 px-3 py-3">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-record/15 font-display text-sm font-bold text-accent-record">
              {user.name.trim().slice(0, 2).toLocaleUpperCase("tr-TR")}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">{user.name}</p>
            <p className="truncate text-xs text-text-muted">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-3 flex min-h-10 w-full items-center justify-center rounded-lg border border-border-subtle text-sm font-semibold text-text-muted transition-colors hover:border-sentiment-negative/30 hover:text-sentiment-negative"
        >
          Çıkış yap
        </button>
      </div>
    </aside>
  );
}

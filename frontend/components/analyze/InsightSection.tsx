"use client";

import type { ReactNode } from "react";
import CountSelector from "@/components/analyze/CountSelector";

export function InsightSection({
  icon,
  iconClassName,
  title,
  subtitle,
  count,
  countOptions,
  onCountChange,
  children,
}: {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  subtitle: string;
  count: number;
  countOptions: number[];
  onCountChange: (value: number) => void;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-border-subtle bg-bg-surface/60 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconClassName}`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-text-primary">{title}</h2>
            <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
          </div>
        </div>
        <CountSelector
          label="Adet"
          value={count}
          options={countOptions}
          onChange={onCountChange}
          compact
        />
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

const AVATAR_COLORS = [
  "bg-rose-500/20 text-rose-300 border-rose-400/30",
  "bg-sky-500/20 text-sky-300 border-sky-400/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  "bg-violet-500/20 text-violet-300 border-violet-400/30",
  "bg-amber-500/20 text-amber-300 border-amber-400/30",
  "bg-slate-500/20 text-slate-300 border-slate-400/30",
];

export function avatarColorClass(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function formatHandle(author: string) {
  const cleaned = author.trim();
  if (!cleaned || cleaned.toLowerCase() === "anonim") return "Anonim";
  return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
}

export function avatarInitial(author: string) {
  const cleaned = author.trim().replace(/^@+/, "");
  return (cleaned[0] || "?").toUpperCase();
}

export function sentimentBadgeClass(sentiment: string) {
  if (sentiment === "positive") {
    return "border-sentiment-positive/30 bg-sentiment-positive/10 text-sentiment-positive";
  }
  if (sentiment === "negative") {
    return "border-sentiment-negative/30 bg-sentiment-negative/10 text-sentiment-negative";
  }
  return "border-border-subtle bg-fill-muted text-text-muted";
}

export function sentimentLabel(sentiment: string) {
  if (sentiment === "positive") return "Pozitif";
  if (sentiment === "negative") return "Olumsuz";
  return "Nötr";
}

export function MetaPill({
  children,
  className = "border-border-subtle bg-bg-base/70 text-text-muted",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}

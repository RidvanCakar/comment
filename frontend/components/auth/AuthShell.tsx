import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";

export default function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-base px-4 py-12 text-text-primary">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-accent-record/10 blur-[100px]" />
      <div className="absolute right-4 top-4 z-10"><ThemeToggle /></div>
      <div className="relative w-full max-w-md">
        <div className="mb-7 flex justify-center">
          <BrandLogo size="lg" isLink={true} href="/" />
        </div>
        <section className="rounded-2xl border border-border-subtle bg-bg-surface/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent-record">Hesabın</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
          <div className="mt-7">{children}</div>
        </section>
      </div>
    </main>
  );
}

export const inputClass =
  "mt-2 h-12 w-full rounded-lg border border-border-subtle bg-bg-base/60 px-3.5 text-base text-text-primary outline-none transition focus:border-accent-record focus:ring-2 focus:ring-accent-record/15 disabled:opacity-50";

export const primaryButtonClass =
  "flex min-h-12 w-full items-center justify-center rounded-lg bg-accent-record px-4 font-display text-sm font-bold text-[#17130b] transition hover:bg-accent-record/90 disabled:cursor-not-allowed disabled:opacity-50";

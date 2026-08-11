import Link from "next/link";
import AuthNav from "./AuthNav";
import ThemeToggle from "@/components/ThemeToggle";

export default function AccountHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-display text-lg font-extrabold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-record/30 bg-accent-record/10 text-accent-record">Y</span>
          <span>Yorum<span className="text-accent-record">AI</span></span>
        </Link>
        <div className="flex items-center gap-2"><ThemeToggle /><AuthNav /></div>
      </div>
    </header>
  );
}

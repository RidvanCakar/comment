import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import AuthNav from "@/components/auth/AuthNav";
import LandingIcon from "./LandingIcon";
import BrandLogo from "@/components/BrandLogo";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo size="md" isLink={true} href="/" />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Ana navigasyon">
          <a href="#nasil-calisir" className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary">
            Nasıl çalışır?
          </a>
          <a href="#faydalar" className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary">
            Faydalar
          </a>
          <a href="#rapor" className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary">
            Örnek rapor
          </a>
          <a href="#sss" className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary">
            SSS
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/analyze"
            className="hidden min-h-11 items-center justify-center gap-2 rounded-lg bg-accent-record px-4 text-sm font-bold text-[#17130b] shadow-lg shadow-accent-record/15 transition-all hover:-translate-y-0.5 hover:bg-accent-record/90 xl:flex"
          >
            Ücretsiz Dene
            <LandingIcon name="arrow" className="h-4 w-4" />
          </Link>
          <AuthNav />
        </div>
      </div>
    </header>
  );
}

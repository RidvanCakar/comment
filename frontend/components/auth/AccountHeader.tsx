import Link from "next/link";
import AuthNav from "./AuthNav";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";

export default function AccountHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <BrandLogo size="md" isLink={true} href="/" />
        <div className="flex items-center gap-2"><ThemeToggle /><AuthNav /></div>
      </div>
    </header>
  );
}

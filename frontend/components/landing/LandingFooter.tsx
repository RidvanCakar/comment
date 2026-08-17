import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border-subtle px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <BrandLogo size="md" isLink={true} href="/" />
          <p className="mt-3 text-sm leading-6 text-text-muted">
            Audience Intelligence Lab: YouTube ve sosyal medya yorumlarını içerik üreticileri ve markalar için 
            ölçülebilir büyüme içgörülerine dönüştürür.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-text-muted sm:items-end">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/analyze" className="min-h-11 content-center transition-colors hover:text-text-primary">
              Analiz aracı
            </Link>
          </div>
          <p className="text-xs">© 2026 CommentLab. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

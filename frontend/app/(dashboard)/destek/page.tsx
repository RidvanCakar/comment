import Link from "next/link";
import { whatsappDisplayNumber, whatsappUrl } from "@/lib/support";

const SUPPORT_MESSAGE = "Merhaba, CommentLab destek hattından yazıyorum.";

export default function DestekPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Üst Başlık */}
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-record">
          Yardım Merkezi
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-text-primary">
          Destek & İletişim
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Platform kullanımıyla ilgili teknik bir sorun yaşadığında veya yardıma ihtiyaç duyduğunda bize ulaş.
        </p>
      </div>

      {/* Doğrudan İletişim / WhatsApp Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-bg-surface via-bg-surface to-emerald-500/5 p-6 sm:p-8 shadow-xl">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hızlı Destek Hattı</span>
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary">
              WhatsApp Destek Hattı
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Teknik aksaklıklar, kredi veya hesap işlemleri için WhatsApp üzerinden doğrudan iletişime geçebilirsiniz.
            </p>
          </div>

          <a
            href={whatsappUrl(SUPPORT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 font-display text-sm font-bold text-white shadow-xl shadow-[#25D366]/20 transition-all hover:opacity-95 hover:-translate-y-0.5 shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 2C6.486 2 2 6.486 2 12c0 1.77.464 3.433 1.277 4.874L2 22l5.236-1.372A9.96 9.96 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18.182a8.16 8.16 0 01-4.126-1.12l-.295-.176-3.107.816.83-3.032-.193-.307A8.168 8.168 0 014.818 12c0-4.514 3.668-8.182 8.182-8.182S20.182 7.486 20.182 12 16.514 20.182 12 20.182z" />
            </svg>
            <span>WhatsApp ile Yaz ({whatsappDisplayNumber()})</span>
          </a>
        </div>
      </section>

      {/* Yardım ve Yönlendirme Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SupportCard
          icon="❓"
          title="Sık Sorulan Sorular"
          description="Analiz limitleri, kanal analizi ve hesap yönetimi hakkında hazır cevaplar."
          href="/sss"
          action="SSS'ye Git"
        />
        <SupportCard
          icon="💡"
          title="Fikir & Öneri Paylaş"
          description="Yeni bir özellik veya geliştirme fikrin varsa doğrudan geliştiriciye ilet."
          href="/fikirler"
          action="Fikir Gönder"
        />
        <SupportCard
          icon="⚙️"
          title="Hesap Ayarları"
          description="Profil bilgilerini, şifreni ve hesap güvenliğini yönet."
          href="/ayarlar"
          action="Ayarlara Git"
        />
      </div>
    </div>
  );
}

function SupportCard({
  icon,
  title,
  description,
  href,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <article className="rounded-2xl border border-border-subtle bg-bg-surface p-5 flex flex-col justify-between transition hover:border-border-subtle/80">
      <div>
        <span className="text-2xl">{icon}</span>
        <h3 className="mt-2 font-display text-base font-bold text-text-primary">{title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{description}</p>
      </div>
      <Link href={href} className="mt-4 inline-flex items-center text-xs font-bold text-accent-record hover:underline">
        {action} →
      </Link>
    </article>
  );
}

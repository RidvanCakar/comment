import Link from "next/link";
import { whatsappDisplayNumber, whatsappUrl } from "@/lib/support";

const SUPPORT_MESSAGE = "Merhaba, YorumAI destek hattından yazıyorum.";

export default function DestekPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-record">Yardım</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Destek</h1>
      <p className="mt-2 text-text-muted">Sorun yaşadığında veya geri bildirim vermek istediğinde bize ulaş.</p>

      <div className="mt-8 space-y-4">
        <SupportCard
          title="Sık sorulan sorular"
          description="Analiz süreci, güvenlik ve kullanım limitleri hakkında hazır yanıtlar."
          href="/sss"
          action="SSS'ye git"
        />
        <SupportCard
          title="Video analizi"
          description="YouTube bağlantısı ile yeni bir analiz başlat veya önceki sonuçları incele."
          href="/analyze"
          action="Analize git"
        />
        <SupportCard
          title="Hesap ayarları"
          description="Profil bilgilerini, şifreni ve hesap güvenliğini yönet."
          href="/ayarlar"
          action="Ayarlara git"
        />
      </div>

      <section className="mt-8 rounded-2xl border border-border-subtle bg-bg-surface/80 p-6 sm:p-7">
        <h2 className="font-display text-xl font-bold">İletişim</h2>
        <p className="mt-3 text-sm leading-7 text-text-muted">
          YorumAI şu an bireysel geliştirme aşamasındaki bir projedir. Teknik sorun, kredi talebi
          veya geri bildirim için WhatsApp üzerinden doğrudan iletişime geçebilirsin.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={whatsappUrl(SUPPORT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 2C6.486 2 2 6.486 2 12c0 1.77.464 3.433 1.277 4.874L2 22l5.236-1.372A9.96 9.96 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18.182a8.16 8.16 0 01-4.126-1.12l-.295-.176-3.107.816.83-3.032-.193-.307A8.168 8.168 0 014.818 12c0-4.514 3.668-8.182 8.182-8.182S20.182 7.486 20.182 12 16.514 20.182 12 20.182z" />
            </svg>
            WhatsApp ile yaz ({whatsappDisplayNumber()})
          </a>
          <p className="text-xs text-text-muted">Genellikle birkaç saat içinde yanıt verilir.</p>
        </div>
      </section>
    </div>
  );
}

function SupportCard({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <article className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
      <Link href={href} className="mt-4 inline-flex min-h-10 items-center text-sm font-bold text-accent-record hover:underline">
        {action} →
      </Link>
    </article>
  );
}

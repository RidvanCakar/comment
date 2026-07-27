import LandingIcon from "./LandingIcon";
import { SectionIntro } from "./HowItWorks";
import Reveal from "./Reveal";

export default function ReportPreview() {
  return (
    <section id="rapor" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Reveal>
          <SectionIntro
            eyebrow="Şeffaf ve somut çıktı"
            title="Nasıl bir rapor alacaksın?"
            description="Sadece olumlu–olumsuz oranı değil; yorumların neden böyle hissettiğini ve bundan sonra ne yapacağını gör."
          />
        </Reveal>

        <Reveal delay={100} className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/75 shadow-2xl shadow-black/10 backdrop-blur-xl">
            <div className="flex flex-col gap-3 border-b border-border-subtle p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-record">
                  Temsili analiz
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-text-primary">
                  İzleyicinin videoya verdiği gerçek tepki
                </h3>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-base/60 px-3 py-2 text-xs text-text-muted">
                <span className="h-2 w-2 rounded-full bg-sentiment-positive" />
                1.248 yorum analiz edildi
              </div>
            </div>

            <div className="grid lg:grid-cols-[.88fr_1.12fr]">
              <div className="border-b border-border-subtle p-5 lg:border-b-0 lg:border-r sm:p-7">
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Duygu dağılımı
                </span>
                <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-fill-muted">
                  <span className="bg-sentiment-positive" style={{ width: "68%" }} />
                  <span className="bg-sentiment-neutral" style={{ width: "18%" }} />
                  <span className="bg-sentiment-negative" style={{ width: "14%" }} />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    ["%68", "Olumlu", "text-sentiment-positive"],
                    ["%18", "Nötr", "text-sentiment-neutral"],
                    ["%14", "Olumsuz", "text-sentiment-negative"],
                  ].map(([value, label, color]) => (
                    <div key={label} className="rounded-lg border border-border-subtle bg-bg-base/50 p-3 text-center">
                      <strong className={`block font-mono text-lg sm:text-xl ${color}`}>{value}</strong>
                      <span className="text-[11px] text-text-muted sm:text-xs">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                    Öne çıkan kategoriler
                  </span>
                  {[
                    ["Anlatım netliği", 42],
                    ["Kurgu temposu", 27],
                    ["Ses ve müzik dengesi", 18],
                    ["Konu seçimi", 13],
                  ].map(([label, value], index) => (
                    <div key={String(label)}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-text-primary">{label}</span>
                        <span className="font-mono text-text-muted">%{value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-fill-muted">
                        <div
                          className={index === 2 ? "h-full rounded-full bg-sentiment-negative" : "h-full rounded-full bg-accent-record"}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <div className="rounded-xl border border-border-subtle bg-bg-base/40 p-5">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                    Yönetici özeti
                  </span>
                  <p className="mt-3 text-sm leading-7 text-text-primary/90 sm:text-base">
                    İzleyicilerin %42&apos;si anlatımın netliğini öne çıkarırken,
                    %27&apos;lik ikinci büyük tema kurgu temposu. Genel tavır
                    olumlu; ancak yaklaşık 225 yoruma denk gelen ses dengesi
                    şikâyeti tekrar ediyor. İçeriğin bilgi değeri güçlü, teknik
                    sunum ise büyümeyi sınırlayan ana fırsat alanı.
                  </p>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-accent-record/30 bg-accent-record/10">
                  <div className="flex items-center gap-2 border-b border-accent-record/20 px-5 py-3 text-xs font-bold uppercase tracking-widest text-accent-record">
                    <LandingIcon name="target" className="h-4 w-4" />
                    Bir sonraki video için kritik tavsiye
                  </div>
                  <div className="grid divide-y divide-accent-record/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {[
                      ["Neden?", "%18 (~225 yorum) konuşma sesinin fon müziği altında kaldığını söylüyor."],
                      ["Ne yapmalısın?", "Kurgu aşamasında konuşma kanalını fon müziğinden en az 6 dB yukarıda miksle."],
                      ["Ne kazanırsın?", "En büyük teknik şikâyeti azaltarak izlenme süresi ve geri dönüş oranını güçlendirirsin."],
                    ].map(([label, text]) => (
                      <div key={label} className="p-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent-record">{label}</span>
                        <p className="mt-2 text-xs leading-5 text-text-primary/90 sm:text-sm">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

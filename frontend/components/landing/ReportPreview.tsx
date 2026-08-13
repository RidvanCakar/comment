"use client";

import { useState } from "react";
import LandingIcon from "./LandingIcon";
import { SectionIntro } from "./HowItWorks";
import Reveal from "./Reveal";

export default function ReportPreview() {
  const [activeView, setActiveView] = useState<"video" | "channel">("channel");

  return (
    <section id="rapor" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Reveal>
          <SectionIntro
            eyebrow="Şeffaf ve somut çıktılar"
            title="Nasıl bir rapor alacaksın?"
            description="İster tek bir video, ister kanalının son 5 videosunu çapraz analiz et; somut verilerle kanalını büyüt."
          />
        </Reveal>

        {/* Görünüm Değiştirici Butonlar */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-xl border border-border-subtle bg-bg-surface/80 p-1.5 backdrop-blur-md">
            <button
              onClick={() => setActiveView("channel")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeView === "channel"
                  ? "bg-accent-record text-[#17130b] shadow-md shadow-accent-record/20"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span>⚡ Kanal Geneli Sentez Raporu</span>
              <span className="rounded bg-black/15 px-1.5 py-0.5 text-[10px] uppercase font-mono">Yeni</span>
            </button>

            <button
              onClick={() => setActiveView("video")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeView === "video"
                  ? "bg-text-primary text-bg-base shadow-md"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span>Tekil Video Raporu</span>
            </button>
          </div>
        </div>

        <Reveal delay={100} className="mt-8">
          {activeView === "channel" ? (
            /* KANAL RAPORU ÖN İZLEMESİ */
            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/75 shadow-2xl shadow-black/10 backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-border-subtle p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-record/30 bg-accent-record/15 text-accent-record font-black">
                    84
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-record">
                      Kanal Geneli Sentez
                    </span>
                    <h3 className="mt-0.5 font-display text-lg sm:text-xl font-bold text-text-primary">
                      Örnek YouTube Kanalı — Sağlık & Büyüme Analizi
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-sentiment-positive/30 bg-sentiment-positive/10 px-3 py-1 text-xs font-bold text-sentiment-positive">
                    <span>↑</span>
                    <span>Yükseliş Trendinde</span>
                  </span>
                  <span className="rounded-lg border border-border-subtle bg-bg-base/60 px-3 py-1 text-xs text-text-muted">
                    Son 5 Video • 4.820 Yorum
                  </span>
                </div>
              </div>

              <div className="grid lg:grid-cols-[.9fr_1.1fr]">
                {/* Sol: 5 Video Trendi & Kronik Sorunlar */}
                <div className="border-b border-border-subtle p-5 lg:border-b-0 lg:border-r sm:p-7 space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      5 Video Duygu Değişimi
                    </span>
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {[
                        { title: "V1", pos: 62, neg: 18 },
                        { title: "V2", pos: 71, neg: 14 },
                        { title: "V3", pos: 76, neg: 10 },
                        { title: "V4", pos: 82, neg: 8 },
                        { title: "V5 (Son)", pos: 88, neg: 5 },
                      ].map((v, i) => (
                        <div key={i} className="rounded-xl border border-border-subtle bg-bg-base/50 p-2.5 text-center">
                          <span className="font-mono text-[10px] text-text-muted">{v.title}</span>
                          <span className="mt-1 block font-mono text-sm font-extrabold text-sentiment-positive">
                            %{v.pos}
                          </span>
                          <div className="mt-2 h-1 w-full rounded-full bg-sentiment-positive" style={{ opacity: (i + 1) * 0.2 }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      Kronik Tekrar Eden Sorunlar (3+ Videoda Görülen)
                    </span>
                    <div className="mt-3 space-y-2">
                      <div className="rounded-xl border border-sentiment-negative/20 bg-sentiment-negative/5 p-3.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-sentiment-negative">Mobil Ekranda Küçük Kalan Yazı Tipleri</span>
                          <span className="font-mono text-sentiment-negative">3/5 Videoda</span>
                        </div>
                        <p className="mt-1 text-xs text-text-muted leading-relaxed">
                          İzleyiciler telefon ekranında paylaşılan kod ve ekran görüntülerini okumakta zorlandığını belirtiyor.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ: Kanal Stratejisi ve Yönetici Özeti */}
                <div className="p-5 sm:p-7 space-y-5">
                  <div className="rounded-xl border border-border-subtle bg-bg-base/40 p-5">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      Kanal Geneli Yönetici Özeti
                    </span>
                    <p className="mt-3 text-sm leading-7 text-text-primary/90">
                      Kanal son 5 videoda düzenli bir izleyici memnuniyeti artışı sergilemektedir (Olumlu oran %62&apos;den %88&apos;e yükselmiştir). Özellikle pratik vaka incelemeleri ve dinamik kurgu stili topluluk tarafından takdir edilmektedir.
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-accent-record/30 bg-accent-record/10 p-5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-record">
                      <LandingIcon name="target" className="h-4 w-4" />
                      Kanal Büyüme Eylem Planı
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-text-primary/90 sm:text-sm font-semibold">
                      Görsel sunum ölçeğini mobilde %30 büyütün ve son videolarda izleyicilerden en çok talep edilen &ldquo;canlı proje geliştirme&rdquo; serisine başlayın.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TEKİL VİDEO RAPORU ÖN İZLEMESİ */
            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/75 shadow-2xl shadow-black/10 backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-border-subtle p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-record">
                    Tekil Video Analizi
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
                      şikâyeti tekrar ediyor.
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
          )}
        </Reveal>
      </div>
    </section>
  );
}


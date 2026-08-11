import { SectionIntro } from "./HowItWorks";
import Reveal from "./Reveal";
import { faqItems } from "@/lib/faq-data";

export default function FAQ() {
  return (
    <section id="sss" className="scroll-mt-24 border-t border-border-subtle bg-bg-surface/25 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Reveal>
          <SectionIntro
            eyebrow="Merak ettiklerin"
            title="Sıkça sorulan sorular"
            description="Başlamadan önce bilmek isteyebileceğin temel noktaları açık ve kısa şekilde yanıtladık."
          />
        </Reveal>

        <div className="mt-10 space-y-3">
          {faqItems.map((faq, index) => (
            <Reveal key={faq.question} delay={(index % 4) * 45}>
              <details className="landing-faq group rounded-xl border border-border-subtle bg-bg-surface/75 transition-colors open:border-accent-record/25 open:bg-bg-surface">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left sm:px-5">
                  <span className="font-display text-sm font-bold text-text-primary sm:text-base">
                    {faq.question}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-base/60 text-lg text-text-muted transition-transform duration-300 group-open:rotate-45 group-open:border-accent-record/30 group-open:text-accent-record">
                    +
                  </span>
                </summary>
                <div className="border-t border-border-subtle px-4 pb-5 pt-4 sm:px-5">
                  <p className="text-sm leading-7 text-text-muted sm:text-base">{faq.answer}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

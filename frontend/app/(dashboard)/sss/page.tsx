import { faqItems } from "@/lib/faq-data";

export default function SssPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-record">Merak ettiklerin</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Sıkça sorulan sorular</h1>
      <p className="mt-2 text-text-muted">YorumAI hakkında en çok sorulan konuların kısa yanıtları.</p>

      <div className="mt-8 space-y-3">
        {faqItems.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-border-subtle bg-bg-surface/75 transition-colors open:border-accent-record/25 open:bg-bg-surface"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left sm:px-5">
              <span className="font-display text-sm font-bold text-text-primary sm:text-base">{faq.question}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-base/60 text-lg text-text-muted transition-transform duration-300 group-open:rotate-45 group-open:border-accent-record/30 group-open:text-accent-record">
                +
              </span>
            </summary>
            <div className="border-t border-border-subtle px-4 pb-5 pt-4 sm:px-5">
              <p className="text-sm leading-7 text-text-muted sm:text-base">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, type MouseEvent } from "react";

export type TopicSentiment = "positive" | "negative" | "neutral";

export interface SentimentTopic {
  topic: string;
  percent: number;
  sentiment: TopicSentiment | "mixed" | string;
  insight: string;
  example_comments?: string[];
}

interface SentimentTabsProps {
  topics: SentimentTopic[];
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
}

type TabKey = TopicSentiment;

const TAB_ORDER: TabKey[] = ["positive", "negative", "neutral"];

const TAB_CONFIG = {
  positive: {
    label: "Olumlu",
    description: "İzleyicinin güçlü bulduğu noktalar",
    text: "text-sentiment-positive",
    dot: "bg-sentiment-positive",
    bar: "bg-sentiment-positive",
    active:
      "border-sentiment-positive/45 bg-sentiment-positive/12 shadow-[0_12px_35px_-18px_rgba(143,184,155,0.65)]",
    line: "bg-sentiment-positive",
    panel: "border-sentiment-positive/25",
    cardStrong:
      "border-sentiment-positive/45 bg-gradient-to-br from-sentiment-positive/14 to-bg-surface shadow-lg shadow-sentiment-positive/5",
    cardMedium: "border-sentiment-positive/25 bg-sentiment-positive/6",
    cardSoft: "border-sentiment-positive/15 bg-bg-base/35",
  },
  negative: {
    label: "Olumsuz",
    description: "Düzeltilmesi gereken sürtünmeler",
    text: "text-sentiment-negative",
    dot: "bg-sentiment-negative",
    bar: "bg-sentiment-negative",
    active:
      "border-sentiment-negative/45 bg-sentiment-negative/12 shadow-[0_12px_35px_-18px_rgba(217,108,108,0.65)]",
    line: "bg-sentiment-negative",
    panel: "border-sentiment-negative/25",
    cardStrong:
      "border-sentiment-negative/45 bg-gradient-to-br from-sentiment-negative/14 to-bg-surface shadow-lg shadow-sentiment-negative/5",
    cardMedium: "border-sentiment-negative/25 bg-sentiment-negative/6",
    cardSoft: "border-sentiment-negative/15 bg-bg-base/35",
  },
  neutral: {
    label: "Nötr",
    description: "Bilgi, soru ve tarafsız gözlemler",
    text: "text-sentiment-neutral",
    dot: "bg-sentiment-neutral",
    bar: "bg-sentiment-neutral",
    active:
      "border-sentiment-neutral/45 bg-sentiment-neutral/12 shadow-[0_12px_35px_-18px_rgba(107,114,128,0.65)]",
    line: "bg-sentiment-neutral",
    panel: "border-sentiment-neutral/25",
    cardStrong:
      "border-sentiment-neutral/45 bg-gradient-to-br from-sentiment-neutral/14 to-bg-surface shadow-lg shadow-sentiment-neutral/5",
    cardMedium: "border-sentiment-neutral/25 bg-sentiment-neutral/6",
    cardSoft: "border-sentiment-neutral/15 bg-bg-base/35",
  },
} as const;

function normalizeSentiment(value: string): TabKey {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "positive") return "positive";
  if (normalized === "negative") return "negative";
  return "neutral";
}

function getDefaultTab(percentages: Record<TabKey, number>): TabKey {
  return [...TAB_ORDER].sort((a, b) => percentages[b] - percentages[a])[0];
}

export default function SentimentTabs({
  topics,
  positivePercent,
  negativePercent,
  neutralPercent,
}: SentimentTabsProps) {
  const percentages: Record<TabKey, number> = {
    positive: positivePercent,
    negative: negativePercent,
    neutral: neutralPercent,
  };

  const [activeTab, setActiveTab] = useState<TabKey>(() =>
    getDefaultTab(percentages)
  );

  const groupedTopics = useMemo(() => {
    const groups: Record<TabKey, SentimentTopic[]> = {
      positive: [],
      negative: [],
      neutral: [],
    };

    for (const topic of topics) {
      const sentiment = normalizeSentiment(topic.sentiment);
      groups[sentiment].push({
        ...topic,
        sentiment,
        percent: Number(topic.percent) || 0,
      });
    }

    for (const key of TAB_ORDER) {
      groups[key].sort((a, b) => b.percent - a.percent);
    }

    return groups;
  }, [topics]);

  const activeConfig = TAB_CONFIG[activeTab];
  const activeTopics = groupedTopics[activeTab];
  const highestTopicPercent = activeTopics[0]?.percent || 1;

  const selectAdjacentTab = (direction: -1 | 1) => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const nextIndex = (currentIndex + direction + TAB_ORDER.length) % TAB_ORDER.length;
    setActiveTab(TAB_ORDER[nextIndex]);
    document.getElementById(`sentiment-tab-${TAB_ORDER[nextIndex]}`)?.focus();
  };

  return (
    <section className="min-w-0" aria-labelledby="sentiment-heading">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
            İzleyici nabzı
          </span>
          <h2
            id="sentiment-heading"
            className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl"
          >
            Duygu ve konu analizi
          </h2>
        </div>
        <p className="text-sm text-text-muted">
          {topics.length} kategori · Yüzdeye göre önceliklendirildi
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Yorum duygu dağılımı"
        className="grid w-full grid-cols-3 gap-2 rounded-2xl border border-border-subtle bg-bg-surface/60 p-2 shadow-xl shadow-black/5 backdrop-blur-xl sm:gap-3 sm:p-3"
      >
        {TAB_ORDER.map((key) => {
          const config = TAB_CONFIG[key];
          const isActive = key === activeTab;

          return (
            <button
              key={key}
              id={`sentiment-tab-${key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`sentiment-panel-${key}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(key)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  selectAdjacentTab(1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  selectAdjacentTab(-1);
                }
              }}
              className={`group relative min-h-[5.5rem] min-w-0 overflow-hidden rounded-xl border px-2 py-3 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-record/50 sm:min-h-[6.5rem] sm:px-5 sm:py-4 ${
                isActive
                  ? config.active
                  : "border-transparent bg-bg-base/20 opacity-65 hover:border-border-subtle hover:bg-bg-base/45 hover:opacity-100"
              }`}
            >
              <span
                className={`absolute inset-x-3 bottom-0 h-0.5 origin-center rounded-full transition-transform duration-300 ${config.line} ${
                  isActive ? "scale-x-100" : "scale-x-0"
                }`}
              />

              <span className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <SentimentIcon
                  sentiment={key}
                  className={`h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${
                    isActive ? config.text : "text-text-muted"
                  }`}
                />
                <span
                  className={`truncate font-display text-xs font-bold sm:text-base ${
                    isActive ? config.text : "text-text-primary"
                  }`}
                >
                  {config.label}
                </span>
              </span>

              <span
                className={`mt-1.5 block font-mono text-2xl font-extrabold tabular-nums tracking-tight sm:mt-2 sm:text-3xl ${
                  isActive ? config.text : "text-text-muted"
                }`}
              >
                %{Math.round(percentages[key] || 0)}
              </span>
              <span className="mt-1 hidden text-xs text-text-muted sm:block">
                {groupedTopics[key].length} kategori
              </span>
            </button>
          );
        })}
      </div>

      <div
        key={activeTab}
        id={`sentiment-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`sentiment-tab-${activeTab}`}
        className={`mt-4 min-h-[20rem] rounded-2xl border bg-bg-surface/65 p-4 shadow-xl shadow-black/5 backdrop-blur-xl animate-fade-in sm:mt-5 sm:p-6 ${activeConfig.panel}`}
      >
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-border-subtle pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-bg-base/45 ${activeConfig.text}`}
            >
              <SentimentIcon sentiment={activeTab} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className={`font-display text-base font-bold sm:text-lg ${activeConfig.text}`}>
                {activeConfig.label} kategoriler
              </h3>
              <p className="truncate text-xs text-text-muted sm:text-sm">
                {activeConfig.description}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-lg border border-border-subtle bg-bg-base/50 px-2.5 py-1.5 font-mono text-xs text-text-muted sm:text-sm">
            {activeTopics.length} sonuç
          </span>
        </div>

        {activeTopics.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <SentimentIcon sentiment={activeTab} className={`h-8 w-8 ${activeConfig.text}`} />
            <p className="mt-3 text-sm font-medium text-text-primary">
              Bu duygu grubunda belirgin bir kategori bulunamadı.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Bu, analiz edilen yorumların doğal dağılımından kaynaklanabilir.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {activeTopics.map((topic, index) => {
              const relativeWeight = topic.percent / highestTopicPercent;
              const weight = relativeWeight >= 0.72 ? "strong" : relativeWeight >= 0.38 ? "medium" : "soft";

              return (
                <TopicCategoryCard
                  key={`${activeTab}-${topic.topic}-${index}`}
                  topic={topic}
                  rank={index + 1}
                  weight={weight}
                  config={activeConfig}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function TopicCategoryCard({
  topic,
  rank,
  weight,
  config,
}: {
  topic: SentimentTopic;
  rank: number;
  weight: "strong" | "medium" | "soft";
  config: (typeof TAB_CONFIG)[TabKey];
}) {
  const [showExamples, setShowExamples] = useState(false);
  const visualClass =
    weight === "strong"
      ? config.cardStrong
      : weight === "medium"
        ? config.cardMedium
        : config.cardSoft;
  const examples = (topic.example_comments || [])
    .map((comment) => comment.trim())
    .filter(Boolean)
    .slice(0, 5);

  const toggleExamples = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowExamples((prev) => !prev);
  };

  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-5 ${visualClass}`}
    >
      <div
        className={`absolute inset-y-4 left-0 w-0.5 rounded-r-full ${config.line} ${
          weight === "strong" ? "opacity-100" : weight === "medium" ? "opacity-65" : "opacity-35"
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-0.5 font-mono text-xs font-bold ${config.text} opacity-75`}>
            {String(rank).padStart(2, "0")}
          </span>
          <h4 className="min-w-0 break-words font-display text-base font-bold leading-snug text-text-primary sm:text-lg">
            {topic.topic}
          </h4>
        </div>
        <span className={`shrink-0 font-mono text-lg font-extrabold tabular-nums ${config.text}`}>
          %{formatPercent(topic.percent)}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-fill-muted">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${config.bar} ${
            weight === "strong" ? "opacity-100" : weight === "medium" ? "opacity-75" : "opacity-55"
          }`}
          style={{ width: `${Math.min(100, Math.max(2, topic.percent))}%` }}
        />
      </div>

      <p className="mt-4 break-words text-sm leading-6 text-text-muted">
        {topic.insight}
      </p>

      {examples.length > 0 && (
        <div className="mt-4 border-t border-border-subtle pt-3">
          <button
            type="button"
            onClick={toggleExamples}
            aria-expanded={showExamples}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-1 text-left transition-colors hover:bg-bg-base/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-record/40"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Örnek yorumlar ({examples.length})
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${config.text}`}>
              {showExamples ? "Gizle" : "Göster"}
              <span
                className={`inline-block transition-transform duration-200 ${
                  showExamples ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                ▼
              </span>
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showExamples ? "mt-3 max-h-[480px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="flex flex-col gap-2.5">
              {examples.map((comment, index) => (
                <li key={index} className="flex min-w-0 gap-2.5">
                  <span
                    className={`mt-0.5 shrink-0 font-mono text-[10px] font-bold ${config.text} opacity-80`}
                  >
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="min-w-0 break-words text-xs leading-5 text-text-primary/80 sm:text-sm">
                    {comment}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
}

function formatPercent(value: number) {
  return Number.isInteger(value) ? value : value.toFixed(1);
}

function SentimentIcon({
  sentiment,
  className,
}: {
  sentiment: TabKey;
  className?: string;
}) {
  if (sentiment === "positive") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 13.5c.8 1.5 2 2.2 3.5 2.2s2.7-.7 3.5-2.2M9 9.5h.01M15 9.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (sentiment === "negative") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path d="M12 3 2.8 20h18.4L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 9v4m0 3.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 12h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

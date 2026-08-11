import type { ComponentProps } from "react";
import LandingIcon from "@/components/landing/LandingIcon";
import PdfDownloadButton from "@/components/pdf/PdfDownloadButton";
import SentimentTabs from "@/components/SentimentTabs";
import type { AnalyzeResult } from "@/lib/analyze-request";
import { normalizeRecommendation, toPdfReportData } from "@/lib/analyze-display";

export default function AnalysisResultsView({ data }: { data: AnalyzeResult }) {
  const rec = normalizeRecommendation(data.analysis.top_recommendation);

  return (
    <div className="flex min-w-0 flex-col gap-8 animate-fade-in sm:gap-10">
      <div className="relative flex min-w-0 flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface/80 p-5 shadow-xl shadow-black/5 backdrop-blur-xl md:flex-row md:items-center sm:p-7">
        <div className="pointer-events-none absolute -left-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-accent-record/10 blur-3xl" />
        <div className="relative flex w-full min-w-0 items-start gap-4 md:w-auto">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-record/30 bg-accent-record/10 text-accent-record">
            <LandingIcon name="message" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
              Analiz edilen video
            </span>
            <h2 className="mt-1 break-words font-display text-lg font-extrabold tracking-tight text-text-primary sm:text-xl">
              {data.video_title}
            </h2>
            <span className="mt-1 block break-words text-sm font-medium text-text-muted">
              {data.channel_title}
            </span>
          </div>
        </div>

        <div className="relative grid w-full grid-cols-2 gap-2 font-sans text-sm md:w-auto sm:flex sm:items-stretch sm:gap-3">
          <MetricBox
            label="Toplam yorum"
            value={data.comment_count_analyzed.toLocaleString("tr-TR")}
            icon="message"
          />
          <MetricBox
            label="Analiz tarihi"
            value={
              data.created_at
                ? new Date(data.created_at).toLocaleDateString("tr-TR")
                : "—"
            }
            icon="clock"
          />
          <PdfDownloadButton data={toPdfReportData(data)} />
          {data.cached && (
            <div className="col-span-2 flex min-h-14 items-center justify-center gap-2 rounded-xl border border-sentiment-positive/25 bg-sentiment-positive/10 px-4 text-xs font-bold uppercase tracking-widest text-sentiment-positive sm:col-span-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sentiment-positive" />
              Önbellek
            </div>
          )}
        </div>
      </div>

      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-accent-record/25 bg-gradient-to-br from-accent-record/10 via-bg-surface to-bg-surface p-5 shadow-xl shadow-black/5 sm:p-7">
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-accent-record/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-record/30 bg-accent-record/10 text-accent-record">
            <LandingIcon name="clipboard" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
              Yönetici özeti
            </span>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
              İzleyicinin videoya verdiği genel tepki
            </h2>
            <p className="mt-4 max-w-5xl break-words text-sm leading-7 text-text-primary/90 sm:text-base sm:leading-8">
              {data.analysis.overall_summary}
            </p>
          </div>
        </div>
      </div>

      <SentimentTabs
        topics={data.analysis.topics}
        positivePercent={data.analysis.sentiment_distribution.positive_percent}
        negativePercent={data.analysis.sentiment_distribution.negative_percent}
        neutralPercent={data.analysis.sentiment_distribution.neutral_percent}
      />

      <div className="relative flex min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border border-accent-record/35 bg-gradient-to-br from-accent-record/16 via-bg-surface to-bg-surface p-5 shadow-2xl shadow-accent-record/5 sm:p-7">
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-accent-record/12 blur-[70px]" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent-record/40 bg-accent-record/15 text-accent-record shadow-lg shadow-accent-record/10">
            <LandingIcon name="target" className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-record">
              Öncelikli aksiyon
            </span>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
              Bir sonraki video için kritik tavsiye
            </h2>
          </div>
        </div>

        <div className="relative grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3 sm:gap-4">
          {rec.insight && <RecommendationPart label="Neden?" text={rec.insight} />}
          {rec.action && (
            <RecommendationPart label="Ne yapmalısın?" text={rec.action} accent />
          )}
          {rec.expected_impact && (
            <RecommendationPart label="Ne kazanırsın?" text={rec.expected_impact} positive />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ComponentProps<typeof LandingIcon>["name"];
}) {
  return (
    <div className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-border-subtle bg-bg-base/50 px-3.5 py-2.5 sm:min-w-[9rem]">
      <LandingIcon name={icon} className="h-4 w-4 shrink-0 text-text-muted" />
      <div className="min-w-0">
        <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <span className="mt-0.5 block truncate font-mono text-sm font-bold text-text-primary">
          {value}
        </span>
      </div>
    </div>
  );
}

function RecommendationPart({
  label,
  text,
  accent = false,
  positive = false,
}: {
  label: string;
  text: string;
  accent?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-2 rounded-xl border p-4 sm:p-5 ${
        accent
          ? "border-accent-record/35 bg-accent-record/12 shadow-lg shadow-accent-record/5"
          : "border-border-subtle bg-bg-base/45"
      }`}
    >
      <span
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
          accent
            ? "text-accent-record"
            : positive
              ? "text-sentiment-positive"
              : "text-text-muted"
        }`}
      >
        {label}
      </span>
      <p
        className={`break-words text-sm leading-6 text-text-primary sm:text-base sm:leading-7 ${
          accent ? "font-display font-semibold" : "font-sans"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

import type { PdfReportData } from "@/components/pdf/ReportDocument";
import type { AnalyzeResult } from "@/lib/analyze-request";

export function normalizeRecommendation(
  rec: AnalyzeResult["analysis"]["top_recommendation"],
): { insight: string; action: string; expected_impact: string } {
  if (typeof rec === "string") {
    return { insight: "", action: rec, expected_impact: "" };
  }
  return {
    insight: rec?.insight || "",
    action: rec?.action || "",
    expected_impact: rec?.expected_impact || "",
  };
}

export function toPdfReportData(data: AnalyzeResult): PdfReportData {
  const recommendation = normalizeRecommendation(
    data.analysis.top_recommendation,
  );

  return {
    videoTitle: data.video_title,
    channelTitle: data.channel_title,
    analyzedCommentCount: data.comment_count_analyzed,
    analysisDate: data.created_at,
    summary: data.analysis.overall_summary,
    sentiment: {
      positive: data.analysis.sentiment_distribution.positive_percent,
      negative: data.analysis.sentiment_distribution.negative_percent,
      neutral: data.analysis.sentiment_distribution.neutral_percent,
    },
    topics: data.analysis.topics,
    recommendation: {
      insight: recommendation.insight,
      action: recommendation.action,
      expectedImpact: recommendation.expected_impact,
    },
  };
}

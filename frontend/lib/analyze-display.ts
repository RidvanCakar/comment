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
    videoId: data.video_id,
    analyzedCommentCount: data.comment_count_analyzed,
    analysisDate: data.created_at,
    summary: data.analysis.overall_summary,
    sentiment: {
      positive: data.analysis.sentiment_distribution.positive_percent,
      negative: data.analysis.sentiment_distribution.negative_percent,
      neutral: data.analysis.sentiment_distribution.neutral_percent,
    },
    topics: data.analysis.topics?.map((topic) => ({
      ...topic,
      example_comments: topic.example_comments?.map((c) =>
        typeof c === "string" ? c : c.text,
      ),
    })),
    topEngagedComments: data.analysis.top_engaged_comments?.map((comment) => ({
      author: comment.author || "Anonim",
      text: comment.text,
      like_count: comment.like_count,
      reply_count: comment.reply_count,
      engagement_score: comment.engagement_score,
      sentiment: comment.sentiment || "neutral",
      topic: comment.topic || "Genel",
    })),
    highlightMoments: data.analysis.highlight_moments?.map((moment) => ({
      timestamp_label: moment.timestamp_label,
      timestamp_seconds: moment.timestamp_seconds,
      total_engagement: moment.total_engagement,
      comment_count: moment.comment_count,
      sample_comment: moment.sample_comment,
      sentiment: moment.sentiment || "neutral",
    })),
    recommendation: {
      insight: recommendation.insight,
      action: recommendation.action,
      expectedImpact: recommendation.expected_impact,
    },
  };
}

import { ApiError, apiRequest } from "@/lib/api";

export interface AnalyzeResult {
  video_id: string;
  video_title: string;
  channel_title: string;
  comment_count_analyzed: number;
  cached: boolean;
  created_at: string | null;
  quota?: {
    is_guest: boolean;
    unlimited?: boolean;
    credits_remaining: number | null;
    credits_total: number | null;
    whatsapp: string;
  };
  analysis: {
    sentiment_distribution: {
      positive_percent: number;
      negative_percent: number;
      neutral_percent: number;
    };
    topics: {
      topic: string;
      percent: number;
      sentiment: "positive" | "negative" | "neutral" | "mixed";
      insight: string;
      example_comments?: string[];
    }[];
    overall_summary: string;
    top_recommendation:
      | string
      | {
          insight: string;
          action: string;
          expected_impact: string;
        };
  };
}

function isTransientAnalyzeError(error: unknown) {
  return (
    error instanceof ApiError &&
    [0, 500, 502, 503, 504].includes(error.status)
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postAnalyze(videoUrl: string, forceRefresh: boolean) {
  return apiRequest<AnalyzeResult>("/analyze", {
    method: "POST",
    body: JSON.stringify({
      video_url: videoUrl,
      force_refresh: forceRefresh,
    }),
  });
}

/**
 * Analiz isteği proxy zaman aşımına uğrasa bile sunucuda tamamlanmış olabilir.
 * Geçici hatalarda önbellekten sonucu birkaç kez daha dener.
 */
export async function requestVideoAnalysis(
  videoUrl: string,
  forceRefresh: boolean,
  onWaitingForServer?: () => void,
) {
  try {
    return await postAnalyze(videoUrl, forceRefresh);
  } catch (error) {
    if (forceRefresh || !isTransientAnalyzeError(error)) {
      throw error;
    }

    onWaitingForServer?.();
    const retryDelaysMs = [4000, 6000, 10000, 15000, 20000];

    for (const delayMs of retryDelaysMs) {
      await sleep(delayMs);
      try {
        return await postAnalyze(videoUrl, false);
      } catch (retryError) {
        if (!isTransientAnalyzeError(retryError)) {
          throw retryError;
        }
      }
    }

    throw new ApiError(
      "Analiz sunucuda uzun sürdü ve bağlantı kesildi. Birkaç saniye bekleyip tekrar deneyin; sonuç hazırsa önbellekten hemen gelir.",
      error instanceof ApiError ? error.status : 500,
      error instanceof ApiError ? error.details : undefined,
    );
  }
}

// Tarayıcı istekleri varsayılan olarak aynı origin üzerindeki /api proxy'sine gider.
import { clearSessionToken, getSessionToken } from "@/lib/session";export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api";

export type UserRole = "user" | "admin" | (string & {});
export type UserStatus = "active" | "inactive" | "suspended" | (string & {});

export interface AuthUser {
  id: string | number;
  name: string;
  full_name?: string;
  email: string;
  avatar_url?: string | null;
  role: UserRole;
  status?: UserStatus;
  is_active?: boolean;
  has_password?: boolean;
  analysis_credits?: number;
  email_verified?: boolean | null;
  is_verified?: boolean;
  isVerified?: boolean;
  last_login_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export interface UsersPage {
  users: AuthUser[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface QuotaInfo {
  is_guest: boolean;
  unlimited?: boolean;
  credits_remaining: number | null;
  credits_total: number | null;
  whatsapp: string;
}

export interface RecurringIssue {
  issue: string;
  affected_videos_count: number;
  first_noticed_video: string;
}

export interface ActionableChannelStrategy {
  insight: string;
  action: string;
  expected_impact: string;
}

export interface ChannelReport {
  channel_title: string;
  overall_health_score: number;
  sentiment_trend: "IMPROVING" | "DECLINING" | "STABLE";
  summary: string;
  recurring_issues: RecurringIssue[];
  audience_shift_insights: string;
  actionable_channel_strategy: ActionableChannelStrategy;
}

export interface AnalyzedVideoReportItem {
  video_id: string;
  title: string;
  channel_title?: string;
  published_at?: string;
  thumbnail_url?: string;
  comment_count_analyzed: number;
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
    top_recommendation: {
      insight?: string;
      action: string;
      expected_impact?: string;
    } | string;
  };
  cached: boolean;
}

export interface ChannelAnalyzeResult {
  channel_id: string;
  channel_title: string;
  video_count: number;
  created_at: string | null;
  channel_report: ChannelReport;
  analyzed_videos: AnalyzedVideoReportItem[];
  quota?: QuotaInfo;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const data = payload as Record<string, unknown>;
  if (typeof data.detail === "string") return data.detail;
  if (data.detail && typeof data.detail === "object") {
    const detail = data.detail as Record<string, unknown>;
    if (typeof detail.message === "string") return detail.message;
  }
  if (typeof data.message === "string") return data.message;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg: unknown }).msg);
        }
        return String(item);
      })
      .join(", ");
  }
  return fallback;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  const sessionToken = getSessionToken();
  if (sessionToken) {
    headers.set("Authorization", `Bearer ${sessionToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError("Sunucuya ulaşılamıyor. Lütfen tekrar deneyin.", 0);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload: unknown =
    response.status === 204
      ? null
      : contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      errorMessage(payload, `İstek başarısız oldu (${response.status}).`),
      response.status,
      payload,
    );
  }

  return payload as T;
}

export function normalizeUser(user: AuthUser): AuthUser {
  const name = user.full_name || user.name || user.email;
  const isVerified = Boolean(
    user.is_verified ?? user.isVerified ?? user.email_verified ?? false,
  );
  return {
    ...user,
    name,
    full_name: user.full_name || name,
    status: user.status || (user.is_active === false ? "inactive" : "active"),
    is_verified: isVerified,
    isVerified: isVerified,
    email_verified: isVerified,
  };
}

export async function verifyEmailToken(token: string): Promise<{ message: string; user?: AuthUser }> {
  return apiRequest<{ message: string; user?: AuthUser }>(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
    method: "GET",
  });
}

export async function resendVerification(email?: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(email ? { email } : {}),
  });
}

export function unwrapUser(payload: AuthUser | { user: AuthUser }): AuthUser {
  return normalizeUser("user" in payload ? payload.user : payload);
}

export function parseAuthResult(payload: AuthUser & { session_token?: string }) {
  const { session_token: sessionToken, ...userFields } = payload;
  return {
    user: normalizeUser(userFields as AuthUser),
    sessionToken: sessionToken || null,
  };
}

export function isCreditsExhausted(error: unknown) {
  if (!(error instanceof ApiError) || !error.details || typeof error.details !== "object") {
    return false;
  }
  const detail = (error.details as { detail?: unknown }).detail;
  return (
    detail &&
    typeof detail === "object" &&
    (detail as { code?: string }).code === "CREDITS_EXHAUSTED"
  );
}

export async function analyzeChannel(
  channelUrl: string,
  forceRefresh: boolean = false,
  videoLimit: number = 5,
): Promise<ChannelAnalyzeResult> {
  return apiRequest<ChannelAnalyzeResult>("/analyze/channel", {
    method: "POST",
    body: JSON.stringify({
      channel_url: channelUrl,
      force_refresh: forceRefresh,
      video_limit: videoLimit,
    }),
  });
}


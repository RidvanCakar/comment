import type { ChannelReport, AnalyzedVideoReportItem } from "@/lib/api";

export interface AnalysisHistoryEntry {
  id: string;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  channelTitle: string;
  commentCount: number;
  summary: string;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
  analyzedAt: string;
}

export interface ChannelAnalysisHistoryEntry {
  id: string;
  channelId: string;
  channelTitle: string;
  videoCount: number;
  healthScore: number;
  sentimentTrend: "IMPROVING" | "DECLINING" | "STABLE";
  summary: string;
  analyzedAt: string;
  report: ChannelReport;
  analyzedVideos: AnalyzedVideoReportItem[];
}

const STORAGE_PREFIX = "yorumai_analyses_";
const CHANNEL_STORAGE_PREFIX = "yorumai_channel_analyses_";
const MAX_ENTRIES = 50;

function storageKey(userId: string | number) {
  return `${STORAGE_PREFIX}${userId}`;
}

function channelStorageKey(userId: string | number) {
  return `${CHANNEL_STORAGE_PREFIX}${userId}`;
}

export function youtubeThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function readAnalysisHistory(userId: string | number): AnalysisHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAnalysisHistory(
  userId: string | number,
  entry: Omit<AnalysisHistoryEntry, "id">,
): AnalysisHistoryEntry[] {
  if (typeof window === "undefined") return [];
  const id = `${entry.videoId}-${entry.analyzedAt}`;
  const nextEntry: AnalysisHistoryEntry = { ...entry, id };
  const existing = readAnalysisHistory(userId).filter((item) => item.videoId !== entry.videoId);
  const next = [nextEntry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("yorumai:analysis-history"));
  return next;
}

export function readChannelAnalysisHistory(userId: string | number): ChannelAnalysisHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(channelStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChannelAnalysisHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveChannelAnalysisHistory(
  userId: string | number,
  entry: Omit<ChannelAnalysisHistoryEntry, "id">,
): ChannelAnalysisHistoryEntry[] {
  if (typeof window === "undefined") return [];
  const id = `${entry.channelId}-${entry.analyzedAt}`;
  const nextEntry: ChannelAnalysisHistoryEntry = { ...entry, id };
  const existing = readChannelAnalysisHistory(userId).filter((item) => item.channelId !== entry.channelId);
  const next = [nextEntry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(channelStorageKey(userId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("yorumai:channel-analysis-history"));
  return next;
}

export function countThisMonth(entries: (AnalysisHistoryEntry | ChannelAnalysisHistoryEntry)[]) {
  const now = new Date();
  return entries.filter((entry) => {
    const date = new Date(entry.analyzedAt);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;
}

export function findAnalysisEntry(
  userId: string | number,
  videoId: string,
): AnalysisHistoryEntry | undefined {
  return readAnalysisHistory(userId).find((item) => item.videoId === videoId);
}

export function findChannelAnalysisEntry(
  userId: string | number,
  channelId: string,
): ChannelAnalysisHistoryEntry | undefined {
  return readChannelAnalysisHistory(userId).find((item) => item.channelId === channelId);
}

export function formatAnalysisDate(value: string) {
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


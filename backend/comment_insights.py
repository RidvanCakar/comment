import re
from typing import Any


def topic_example_limit(comment_count: int) -> int:
    if comment_count >= 800:
        return 15
    if comment_count >= 300:
        return 12
    if comment_count >= 100:
        return 10
    return 8


def topic_example_range(comment_count: int) -> tuple[int, int]:
    minimum = min(5, topic_example_limit(comment_count))
    return minimum, topic_example_limit(comment_count)


def engagement_score(comment: dict[str, Any]) -> int:
    return int(comment.get("like_count", 0) or 0) + int(
        comment.get("reply_count", 0) or 0
    )


def format_timestamp(total_seconds: int) -> str:
    total_seconds = max(0, int(total_seconds))
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    return f"{minutes}:{seconds:02d}"


def parse_timestamps(text: str) -> list[int]:
    """Yorum metnindeki zaman damgalarını saniyeye çevirir."""
    if not text:
        return []

    found: list[int] = []
    seen_spans: list[tuple[int, int]] = []

    def add_match(start: int, end: int, total: int) -> None:
        for span_start, span_end in seen_spans:
            if start >= span_start and end <= span_end:
                return
        seen_spans.append((start, end))
        found.append(total)

    for match in re.finditer(
        r"(?<!\d)(\d{1,2}):(\d{2}):(\d{2})(?!\d)",
        text,
    ):
        hours, minutes, seconds = (int(match.group(i)) for i in range(1, 4))
        if minutes >= 60 or seconds >= 60:
            continue
        add_match(match.start(), match.end(), hours * 3600 + minutes * 60 + seconds)

    for match in re.finditer(r"(?<!\d)(\d{1,2}):(\d{2})(?!\d)", text):
        inside_longer = any(
            match.start() >= span_start and match.end() <= span_end
            for span_start, span_end in seen_spans
        )
        if inside_longer:
            continue
        minutes, seconds = int(match.group(1)), int(match.group(2))
        if seconds >= 60:
            continue
        add_match(match.start(), match.end(), minutes * 60 + seconds)

    return found


def infer_sentiment_from_text(text: str) -> str:
    lowered = text.lower()
    positive_markers = (
        "harika", "mükemmel", "süper", "bayıldım", "teşekkür", "efsane", "güzel",
        "love", "great", "awesome", "amazing", "❤", "👏", "🔥",
    )
    negative_markers = (
        "kötü", "berbat", "sıkıcı", "bok", "rezalet", "nefret", "iğrenç",
        "bad", "hate", "terrible", "boring", "👎",
    )
    positive_hits = sum(1 for word in positive_markers if word in lowered)
    negative_hits = sum(1 for word in negative_markers if word in lowered)
    if positive_hits > negative_hits:
        return "positive"
    if negative_hits > positive_hits:
        return "negative"
    return "neutral"


def _normalize_comment_text(text: str) -> str:
    return " ".join(text.split()).casefold()


def _example_comment_text(example: Any) -> str:
    if isinstance(example, dict):
        return str(example.get("text", "")).strip()
    return str(example).strip()


def build_author_lookup(comments: list[dict[str, Any]]) -> dict[str, str]:
    lookup: dict[str, str] = {}
    for comment in comments:
        text = str(comment.get("text", "")).strip()
        if not text:
            continue
        author = str(comment.get("author", "")).strip() or "Anonim"
        lookup[_normalize_comment_text(text)] = author
    return lookup


def lookup_author(text: str, lookup: dict[str, str]) -> str:
    normalized = _normalize_comment_text(text)
    if not normalized:
        return "Anonim"
    if normalized in lookup:
        return lookup[normalized]
    for key, author in lookup.items():
        if normalized in key or key in normalized:
            return author
    return "Anonim"


def attach_authors_to_topic_examples(
    topics: list[dict[str, Any]],
    comments: list[dict[str, Any]],
) -> None:
    lookup = build_author_lookup(comments)
    for topic in topics:
        enriched: list[dict[str, str]] = []
        for example in topic.get("example_comments", []):
            text = _example_comment_text(example)
            if not text:
                continue
            if isinstance(example, dict) and example.get("author"):
                author = str(example["author"]).strip() or "Anonim"
            else:
                author = lookup_author(text, lookup)
            enriched.append({"text": text, "author": author})
        topic["example_comments"] = enriched


def match_comment_topic(text: str, topics: list[dict[str, Any]]) -> tuple[str, str]:
    normalized = text.strip()
    if not normalized:
        return "neutral", "Genel"

    for topic in topics:
        for example in topic.get("example_comments", []):
            example_text = _example_comment_text(example)
            if not example_text:
                continue
            if normalized == example_text or normalized in example_text or example_text in normalized:
                sentiment = str(topic.get("sentiment", "neutral")).lower()
                if sentiment not in {"positive", "negative", "neutral"}:
                    sentiment = "neutral"
                return sentiment, str(topic.get("topic", "Genel"))

    return infer_sentiment_from_text(normalized), "Genel"


def sentiment_label(sentiment: str) -> str:
    mapping = {
        "positive": "Pozitif",
        "negative": "Olumsuz",
        "neutral": "Nötr",
    }
    return mapping.get(sentiment, "Nötr")


def build_top_engaged_comments(
    comments: list[dict[str, Any]],
    *,
    limit: int = 20,
    topics: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    topics = topics or []
    ranked = sorted(
        comments,
        key=lambda item: (engagement_score(item), item.get("like_count", 0)),
        reverse=True,
    )
    results: list[dict[str, Any]] = []
    for comment in ranked:
        text = str(comment.get("text", "")).strip()
        if not text:
            continue
        score = engagement_score(comment)
        if score <= 0 and results:
            break
        sentiment, topic = match_comment_topic(text, topics)
        author = str(comment.get("author", "Anonim")).strip() or "Anonim"
        results.append(
            {
                "text": text,
                "author": author,
                "like_count": int(comment.get("like_count", 0) or 0),
                "reply_count": int(comment.get("reply_count", 0) or 0),
                "engagement_score": score,
                "sentiment": sentiment,
                "topic": topic,
            }
        )
        if len(results) >= limit:
            break
    return results


def build_highlight_moments(
    comments: list[dict[str, Any]],
    *,
    top_n: int = 15,
    topics: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    topics = topics or []
    buckets: dict[int, dict[str, Any]] = {}

    for comment in comments:
        text = str(comment.get("text", "")).strip()
        if not text:
            continue
        score = engagement_score(comment)
        for timestamp in parse_timestamps(text):
            minute_key = timestamp // 60
            bucket = buckets.setdefault(
                minute_key,
                {
                    "timestamp_seconds": minute_key * 60,
                    "total_engagement": 0,
                    "comments": [],
                },
            )
            bucket["total_engagement"] += score
            bucket["comments"].append(comment)

    ranked = sorted(
        buckets.values(),
        key=lambda item: (item["total_engagement"], len(item["comments"])),
        reverse=True,
    )[:top_n]

    moments: list[dict[str, Any]] = []
    for bucket in ranked:
        best = max(bucket["comments"], key=engagement_score)
        sample_text = str(best.get("text", "")).strip()[:400]
        sentiment, _ = match_comment_topic(sample_text, topics)
        sample_author = str(best.get("author", "Anonim")).strip() or "Anonim"
        moments.append(
            {
                "timestamp_label": format_timestamp(bucket["timestamp_seconds"]),
                "timestamp_seconds": bucket["timestamp_seconds"],
                "total_engagement": bucket["total_engagement"],
                "comment_count": len(bucket["comments"]),
                "sample_comment": sample_text,
                "sample_author": sample_author,
                "top_comment_engagement": engagement_score(best),
                "sentiment": sentiment,
            }
        )
    return moments


def enrich_analysis_with_comment_insights(
    analysis: dict[str, Any],
    comments: list[dict[str, Any]],
) -> dict[str, Any]:
    topics = analysis.get("topics", [])
    attach_authors_to_topic_examples(topics, comments)
    analysis["top_engaged_comments"] = build_top_engaged_comments(
        comments,
        limit=20,
        topics=topics,
    )
    analysis["highlight_moments"] = build_highlight_moments(
        comments,
        top_n=15,
        topics=topics,
    )
    return analysis

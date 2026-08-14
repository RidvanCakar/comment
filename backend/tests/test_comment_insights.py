from comment_insights import (
    build_highlight_moments,
    build_top_engaged_comments,
    enrich_analysis_with_comment_insights,
    format_timestamp,
    parse_timestamps,
    topic_example_limit,
)


def test_topic_example_limit_scales_with_volume():
    assert topic_example_limit(50) == 8
    assert topic_example_limit(150) == 10
    assert topic_example_limit(400) == 12
    assert topic_example_limit(900) == 15


def test_parse_timestamps_supports_common_formats():
    assert parse_timestamps("12:34 harika an") == [754]
    assert parse_timestamps("1:02:30 sahne") == [3750]
    assert parse_timestamps("metin yok") == []


def test_format_timestamp():
    assert format_timestamp(754) == "12:34"
    assert format_timestamp(3750) == "1:02:30"


def test_build_top_engaged_comments_sorts_by_likes_plus_replies():
    comments = [
        {"text": "düşük", "like_count": 1, "reply_count": 0, "author": "Ali"},
        {"text": "yüksek", "like_count": 10, "reply_count": 5, "author": "Veli"},
        {"text": "orta", "like_count": 4, "reply_count": 3, "author": "Ayşe"},
    ]
    topics = [{"topic": "Genel", "sentiment": "positive", "example_comments": ["yüksek"]}]
    ranked = build_top_engaged_comments(comments, limit=2, topics=topics)
    assert [item["text"] for item in ranked] == ["yüksek", "orta"]
    assert ranked[0]["engagement_score"] == 15
    assert ranked[0]["author"] == "Veli"
    assert ranked[0]["sentiment"] == "positive"


def test_attach_authors_to_topic_examples():
    comments = [
        {"text": "Harika sahne", "author": "@fan123"},
        {"text": "Çok kötü", "author": "@viewer99"},
    ]
    topics = [
        {
            "topic": "Sahne",
            "sentiment": "positive",
            "example_comments": ["Harika sahne"],
        }
    ]
    enrich_analysis_with_comment_insights({"topics": topics}, comments)
    example = topics[0]["example_comments"][0]
    assert example["author"] == "@fan123"
    assert example["text"] == "Harika sahne"


def test_hydrate_cached_analysis_restores_authors():
    comments = [
        {
            "text": "yüksek",
            "like_count": 10,
            "reply_count": 5,
            "author": "Veli Demir",
        },
    ]
    cached_analysis = {
        "topics": [{"topic": "Genel", "sentiment": "positive", "example_comments": ["yüksek"]}],
        "top_engaged_comments": [
            {
                "text": "yüksek",
                "like_count": 10,
                "reply_count": 5,
                "engagement_score": 15,
            }
        ],
        "highlight_moments": [],
    }
    enriched = enrich_analysis_with_comment_insights(cached_analysis, comments)
    assert enriched["top_engaged_comments"][0]["author"] == "Veli Demir"


def test_build_highlight_moments_groups_by_minute():
    comments = [
        {"text": "12:34 muhteşem", "like_count": 10, "reply_count": 2},
        {"text": "12:36 aynı bölüm", "like_count": 3, "reply_count": 1},
        {"text": "05:10 başlangıç", "like_count": 8, "reply_count": 0},
    ]
    moments = build_highlight_moments(comments, top_n=5)
    assert moments[0]["timestamp_label"] == "12:00"
    assert moments[0]["total_engagement"] == 16
    assert moments[0]["comment_count"] == 2


def test_is_junk_comment_filtering():
    from gemini_service import is_junk_comment

    assert is_junk_comment("") is True
    assert is_junk_comment("   ") is True
    assert is_junk_comment("👍👍👍") is True
    assert is_junk_comment("sa") is True
    assert is_junk_comment("asdfghjkl") is True
    assert is_junk_comment("hahahahahaha") is True
    assert is_junk_comment("Harika bir video olmuş, özellikle 04:15'teki anlatım çok iyiydi.") is False


def test_select_richest_comments_prioritizes_detailed_critiques():
    from gemini_service import select_richest_comments

    comments = [
        "sa",
        "👍",
        "güzel",
        "02:15'teki espri çok iyiydi ama ses miksajı konuşmayı biraz bastırmış, keşke müzik kısık olsaydı.",
        "Neden bu konuyu daha önce anlatmadınız? Bir sonraki videoda X konusuna da değinir misiniz?",
        "asdfghjkl",
    ]

    richest = select_richest_comments(comments, max_sample=2)
    assert len(richest) == 2
    # The two rich comments with timestamps/questions/critiques should be prioritized over "sa", "👍", "güzel"
    assert "02:15" in richest[0] or "02:15" in richest[1]
    assert "?" in richest[0] or "?" in richest[1]

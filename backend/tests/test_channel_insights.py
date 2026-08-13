import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, ChannelAnalysis, save_channel_analysis, get_latest_channel_analysis, init_db
from youtube_service import resolve_channel_id, get_channel_latest_videos
from gemini_service import analyze_channel_insights


@pytest.fixture
def db_session(tmp_path):
    db_path = tmp_path / "test_channel.db"
    test_engine = create_engine(f"sqlite:///{db_path}")
    init_db(test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_channel_analysis_database_operations(db_session):
    report_data = {
        "channel_title": "Test Tech Channel",
        "overall_health_score": 88,
        "sentiment_trend": "IMPROVING",
        "summary": "Son 5 videoda içerik kalitesi ve izleyici memnuniyeti istikrarlı şekilde artıyor.",
        "recurring_issues": [
            {
                "issue": "Ses seviyesi dengesizliği",
                "affected_videos_count": 2,
                "first_noticed_video": "Mikrofon İncelemesi"
            }
        ],
        "audience_shift_insights": "Kitle teknik detaylara olumlu tepki veriyor.",
        "actionable_channel_strategy": {
            "insight": "Teknik incelemeler %30 daha fazla ilgi görüyor.",
            "action": "Haftada en az 1 derinlemesine donanım testi yayınlayın.",
            "expected_impact": "Abone sadakati ve izlenme süresi artar."
        }
    }

    record = save_channel_analysis(
        db=db_session,
        channel_id="UC1234567890123456789012",
        channel_title="Test Tech Channel",
        video_count=5,
        analyzed_video_ids=["vid1", "vid2", "vid3", "vid4", "vid5"],
        channel_report=report_data,
        user_id=None
    )

    assert record.id is not None
    assert record.channel_id == "UC1234567890123456789012"
    assert record.video_count == 5
    assert record.channel_report["overall_health_score"] == 88

    fetched = get_latest_channel_analysis(db_session, "UC1234567890123456789012")
    assert fetched is not None
    assert fetched.channel_title == "Test Tech Channel"
    assert fetched.analyzed_video_ids == ["vid1", "vid2", "vid3", "vid4", "vid5"]


@pytest.mark.anyio
async def test_analyze_channel_insights_empty():
    res = await analyze_channel_insights([], api_key="test_key")
    assert res["overall_health_score"] == 0
    assert res["sentiment_trend"] == "STABLE"
    assert "actionable_channel_strategy" in res


@pytest.mark.anyio
async def test_analyze_channel_insights_with_mock():
    mock_video_reports = [
        {
            "video_id": f"vid_{i}",
            "title": f"Video Title {i}",
            "channel_title": "Mega Channel",
            "published_at": "2026-08-01T12:00:00Z",
            "comment_count_analyzed": 50,
            "sentiment_distribution": {"positive_percent": 75, "negative_percent": 15, "neutral_percent": 10},
            "overall_summary": "Video genel olarak beğenildi.",
            "topics": [{"topic": "İçerik", "percent": 50, "sentiment": "positive"}],
            "top_recommendation": {"insight": "Örnek", "action": "Adım", "expected_impact": "Fayda"}
        }
        for i in range(5)
    ]

    mock_gemini_response = MagicMock()
    mock_gemini_response.text = '''{
        "channel_title": "Mega Channel",
        "overall_health_score": 85,
        "sentiment_trend": "IMPROVING",
        "summary": "Son 5 videoda genel beğeni yüksek ve yükseliş eğiliminde.",
        "recurring_issues": [
            {
                "issue": "Ses kalitesi",
                "affected_videos_count": 2,
                "first_noticed_video": "Video Title 1"
            }
        ],
        "audience_shift_insights": "Kitle yeni formata hızla uyum sağladı.",
        "actionable_channel_strategy": {
            "insight": "Olumlu yorum oranı %75",
            "action": "Aynı formata devam edin.",
            "expected_impact": "Kitle büyümesi hızlanır."
        }
    }'''

    with patch("google.generativeai.GenerativeModel") as mock_model_cls:
        mock_instance = MagicMock()
        mock_instance.generate_content_async = AsyncMock(return_value=mock_gemini_response)
        mock_model_cls.return_value = mock_instance

        result = await analyze_channel_insights(mock_video_reports, api_key="fake_key")

        assert result["channel_title"] == "Mega Channel"
        assert result["overall_health_score"] == 85
        assert result["sentiment_trend"] == "IMPROVING"
        assert len(result["recurring_issues"]) == 1
        assert result["recurring_issues"][0]["issue"] == "Ses kalitesi"
        assert result["actionable_channel_strategy"]["action"] == "Aynı formata devam edin."


def test_youtube_resolve_channel_id_and_latest_videos_mock():
    mock_youtube = MagicMock()

    # Mock channels list response for UC...
    mock_channels_list = MagicMock()
    mock_channels_list.execute.return_value = {
        "items": [
            {
                "id": "UC1234567890123456789012",
                "snippet": {"title": "Test Channel"},
                "contentDetails": {
                    "relatedPlaylists": {"uploads": "UU1234567890123456789012"}
                }
            }
        ]
    }
    mock_youtube.channels().list.return_value = mock_channels_list

    # Mock playlistItems list response
    mock_playlist_list = MagicMock()
    mock_playlist_list.execute.return_value = {
        "items": [
            {
                "snippet": {
                    "resourceId": {"videoId": "vid_abc"},
                    "title": "Son Video",
                    "publishedAt": "2026-08-10T10:00:00Z",
                    "thumbnails": {"high": {"url": "https://img.youtube.com/thumb.jpg"}}
                }
            }
        ]
    }
    mock_youtube.playlistItems().list.return_value = mock_playlist_list

    c_id, c_title, uploads = resolve_channel_id(mock_youtube, "https://youtube.com/channel/UC1234567890123456789012")
    assert c_id == "UC1234567890123456789012"
    assert c_title == "Test Channel"
    assert uploads == "UU1234567890123456789012"

    with patch("youtube_service.build", return_value=mock_youtube):
        videos = get_channel_latest_videos("UC1234567890123456789012", limit=1, api_key="fake_key")
        assert len(videos) == 1
        assert videos[0]["video_id"] == "vid_abc"
        assert videos[0]["title"] == "Son Video"


def test_channel_analysis_credits(db_session):
    from credits import assert_can_analyze_channel, charge_user_for_channel_analysis, CHANNEL_ANALYSIS_CREDIT_COST
    from database import User, GuestDevice
    from fastapi import HTTPException

    # 1. Kayıtlı ve doğrulanmış kullanıcı
    user = User(
        full_name="Ahmet Yılmaz",
        email="ahmet@example.com",
        role="user",
        is_active=True,
        is_verified=True,
        analysis_credits=5,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert_can_analyze_channel(user, None)
    charge_user_for_channel_analysis(db_session, user, None)
    assert user.analysis_credits == 2

    # Kredisi yetersiz olduğunda hata fırlatmalı (kalan 2 < 3)
    with pytest.raises(HTTPException) as exc_info:
        assert_can_analyze_channel(user, None)
    assert exc_info.value.status_code == 402

    # 2. Doğrulanmamış kullanıcı
    unverified_user = User(
        full_name="Mehmet",
        email="mehmet@example.com",
        role="user",
        is_active=True,
        is_verified=False,
        analysis_credits=10,
    )
    with pytest.raises(HTTPException) as exc_info:
        assert_can_analyze_channel(unverified_user, None)
    assert exc_info.value.status_code == 403

    # 3. Admin kullanıcı (sınırsız)
    admin_user = User(
        full_name="Admin",
        email="admin@example.com",
        role="admin",
        is_active=True,
        is_verified=True,
        analysis_credits=0,
    )
    assert_can_analyze_channel(admin_user, None)
    charge_user_for_channel_analysis(db_session, admin_user, None)
    assert admin_user.analysis_credits == 0


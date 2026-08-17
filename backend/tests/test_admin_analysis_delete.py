import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, User, VideoAnalysis, ChannelAnalysis, UserAnalysisCharge, init_db, get_db
from auth import password_hasher, normalize_email
from main import app

@pytest.fixture
def client_with_db(tmp_path):
    db_path = tmp_path / "test_admin_delete.db"
    test_engine = create_engine(f"sqlite:///{db_path}")
    init_db(test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    with TestingSessionLocal() as db:
        # Create regular user
        reg_user = User(
            full_name="Normal User",
            email=normalize_email("user@example.com"),
            password_hash=password_hasher.hash("User123!"),
            role="user",
            is_active=True,
            is_verified=True,
            analysis_credits=5,
        )
        # Create admin user
        admin_user = User(
            full_name="Admin User",
            email=normalize_email("admin@example.com"),
            password_hash=password_hasher.hash("Admin123!"),
            role="admin",
            is_active=True,
            is_verified=True,
            analysis_credits=100,
        )
        db.add_all([reg_user, admin_user])
        db.commit()
        db.refresh(reg_user)
        db.refresh(admin_user)

        # Add sample VideoAnalysis and ChannelAnalysis
        v_analysis = VideoAnalysis(
            video_id="test_vid_123",
            video_title="Test Video",
            channel_title="Test Channel",
            analysis_json='{"overall_summary": "Test"}',
            comment_count_analyzed=10,
            raw_comments_json="[]",
        )
        v_charge = UserAnalysisCharge(
            user_id=reg_user.id,
            video_id="test_vid_123",
        )
        c_analysis = ChannelAnalysis(
            channel_id="UC_test_channel",
            channel_title="Test Channel",
            video_count=5,
            analyzed_video_ids=["test_vid_123"],
            channel_report={"overall_health_score": 80},
            user_id=admin_user.id,
        )
        db.add_all([v_analysis, v_charge, c_analysis])
        db.commit()

    # Login to get tokens
    user_login = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "User123!"},
    )
    assert user_login.status_code == 200
    reg_token = user_login.json()["session_token"]

    admin_login = client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "Admin123!"},
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["session_token"]

    yield client, reg_token, admin_token, TestingSessionLocal

    app.dependency_overrides.clear()


def test_regular_user_cannot_delete_analysis(client_with_db):
    client, reg_token, _, _ = client_with_db
    
    # Try deleting video analysis as regular user
    res = client.delete(
        "/api/admin/analyses/video/test_vid_123",
        headers={"Authorization": f"Bearer {reg_token}"}
    )
    assert res.status_code == 403

    # Try deleting channel analysis as regular user
    res = client.delete(
        "/api/admin/analyses/channel/UC_test_channel",
        headers={"Authorization": f"Bearer {reg_token}"}
    )
    assert res.status_code == 403


def test_admin_can_delete_video_and_channel_analysis(client_with_db):
    client, _, admin_token, session_factory = client_with_db
    
    # 1. Admin deletes video analysis
    res_video = client.delete(
        "/api/admin/analyses/video/test_vid_123",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_video.status_code == 204

    # Verify deleted from DB
    with session_factory() as db:
        assert db.query(VideoAnalysis).filter(VideoAnalysis.video_id == "test_vid_123").first() is None
        assert db.query(UserAnalysisCharge).filter(UserAnalysisCharge.video_id == "test_vid_123").first() is None

    # 2. Admin deletes channel analysis
    res_channel = client.delete(
        "/api/admin/analyses/channel/UC_test_channel",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_channel.status_code == 204

    # Verify deleted from DB
    with session_factory() as db:
        assert db.query(ChannelAnalysis).filter(ChannelAnalysis.channel_id == "UC_test_channel").first() is None

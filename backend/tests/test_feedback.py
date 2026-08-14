import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from auth import normalize_email, password_hasher
from database import Base, Feedback, User, init_db, get_db
from main import app


@pytest.fixture
def client_and_db(tmp_path):
    db_path = tmp_path / "test_feedback.db"
    test_engine = create_engine(f"sqlite:///{db_path}")
    init_db(test_engine)

    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)

    yield test_client, TestingSessionLocal

    app.dependency_overrides.clear()


def test_submit_and_manage_feedback(client_and_db):
    client, SessionLocal = client_and_db

    with SessionLocal() as db:
        # Create normal user
        user = User(
            email=normalize_email("user@example.com"),
            full_name="Normal User",
            password_hash=password_hasher.hash("UserPass123"),
            role="user",
            is_active=True,
            is_verified=True,
        )
        # Create admin user
        admin = User(
            email=normalize_email("admin@example.com"),
            full_name="Admin User",
            password_hash=password_hasher.hash("AdminPass123"),
            role="admin",
            is_active=True,
            is_verified=True,
        )
        db.add_all([user, admin])
        db.commit()

    # Login to get tokens
    user_login = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "UserPass123"},
    )
    assert user_login.status_code == 200
    user_token = user_login.json()["session_token"]

    admin_login = client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "AdminPass123"},
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["session_token"]

    # 1. Unauthenticated user cannot submit
    res_unauth = client.post(
        "/feedback",
        json={"category": "feature_request", "title": "Öneri", "message": "Harika bir özellik"},
    )
    assert res_unauth.status_code == 401

    # 2. Authenticated user submits feedback
    res_submit = client.post(
        "/feedback",
        headers={"Authorization": f"Bearer {user_token}"},
        json={
            "category": "feature_request",
            "title": "Kanal Raporunu PDF İndirme",
            "message": "Kanal analiz sonuçlarını PDF olarak dışa aktarabilelim.",
        },
    )
    assert res_submit.status_code == 201
    feedback_id = res_submit.json()["feedback"]["id"]
    assert res_submit.json()["feedback"]["status"] == "pending"

    # 3. User views their feedbacks
    res_my = client.get(
        "/feedback/my",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert res_my.status_code == 200
    assert len(res_my.json()["feedbacks"]) == 1
    assert res_my.json()["feedbacks"][0]["title"] == "Kanal Raporunu PDF İndirme"

    # 4. Non-admin cannot view admin feedbacks
    res_admin_forbidden = client.get(
        "/admin/feedbacks",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert res_admin_forbidden.status_code == 403

    # 5. Admin lists feedbacks
    res_admin_list = client.get(
        "/admin/feedbacks",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin_list.status_code == 200
    assert res_admin_list.json()["total"] == 1
    assert res_admin_list.json()["feedbacks"][0]["user"]["email"] == "user@example.com"

    # 6. Admin updates status to "planned" with note
    res_update = client.patch(
        f"/admin/feedbacks/{feedback_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "planned", "admin_notes": "Sıradaki sprintte yapılacak."},
    )
    assert res_update.status_code == 200
    assert res_update.json()["feedback"]["status"] == "planned"
    assert res_update.json()["feedback"]["admin_notes"] == "Sıradaki sprintte yapılacak."

    # 7. Admin deletes feedback
    res_delete = client.delete(
        f"/admin/feedbacks/{feedback_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_delete.status_code == 200

    # 8. Verify list is now empty
    res_empty = client.get(
        "/admin/feedbacks",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_empty.status_code == 200
    assert res_empty.json()["total"] == 0

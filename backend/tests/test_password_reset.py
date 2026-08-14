from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from auth import normalize_email, password_hasher
from database import Base, User, init_db, get_db
from main import app


@pytest.fixture
def client_and_db(tmp_path):
    db_path = tmp_path / "test_password_reset.db"
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


def test_forgot_password_flow(client_and_db, monkeypatch):
    client, SessionLocal = client_and_db

    # Create user
    with SessionLocal() as db:
        user = User(
            email=normalize_email("reset_test@example.com"),
            full_name="Reset User",
            password_hash=password_hasher.hash("OldPassword123"),
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()

    email_sent = []

    def mock_send(email, full_name, token):
        email_sent.append((email, full_name, token))
        return True

    monkeypatch.setattr("auth.send_password_reset_email", mock_send)

    # 1. Request password reset
    res = client.post(
        "/auth/forgot-password",
        json={"email": "reset_test@example.com"},
    )
    assert res.status_code == 200
    assert len(email_sent) == 1
    assert email_sent[0][0] == "reset_test@example.com"
    token = email_sent[0][2]
    assert token

    # 2. Reset password with token
    reset_res = client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "NewSecurePassword123"},
    )
    assert reset_res.status_code == 200
    assert "başarıyla" in reset_res.json()["message"]

    # 3. Verify user can log in with new password
    login_res = client.post(
        "/auth/login",
        json={"email": "reset_test@example.com", "password": "NewSecurePassword123"},
    )
    assert login_res.status_code == 200

    # 4. Verify old password fails
    old_login_res = client.post(
        "/auth/login",
        json={"email": "reset_test@example.com", "password": "OldPassword123"},
    )
    assert old_login_res.status_code == 401


def test_reset_password_invalid_or_expired_token(client_and_db):
    client, SessionLocal = client_and_db

    with SessionLocal() as db:
        expired_user = User(
            email=normalize_email("expired@example.com"),
            full_name="Expired User",
            password_hash=password_hasher.hash("Password123"),
            is_active=True,
            reset_token="expired_token_123",
            reset_token_expires_at=datetime.utcnow() - timedelta(minutes=10),
        )
        db.add(expired_user)
        db.commit()

    # Expired token
    res = client.post(
        "/auth/reset-password",
        json={"token": "expired_token_123", "new_password": "NewPassword123"},
    )
    assert res.status_code == 400
    assert "süresi dolmuş" in res.json()["detail"]

    # Invalid token
    invalid_res = client.post(
        "/auth/reset-password",
        json={"token": "non_existent_token", "new_password": "NewPassword123"},
    )
    assert invalid_res.status_code == 400
    assert "Geçersiz" in invalid_res.json()["detail"]

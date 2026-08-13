import pytest
from database import User
from tests.conftest import apply_session_token

VALID_PASSWORD = "GucluSifre1"


def register(client, email="verify_test@example.com", name="Doğrulama Testi"):
    response = client.post(
        "/auth/register",
        json={"full_name": name, "email": email, "password": VALID_PASSWORD},
    )
    if response.status_code == 201:
        apply_session_token(client, response)
    return response


def test_registration_creates_unverified_user(client, db_factory):
    res = register(client, email="unverified@example.com")
    assert res.status_code == 201
    data = res.json()
    assert data["is_verified"] is False
    assert data["isVerified"] is False

    with db_factory() as db:
        user = db.query(User).filter(User.email == "unverified@example.com").first()
        assert user is not None
        assert user.is_verified is False
        assert user.verify_token is not None
        assert user.verify_token_expires_at is not None


def test_verify_email_success(client, db_factory):
    register(client, email="success_verify@example.com")

    with db_factory() as db:
        user = db.query(User).filter(User.email == "success_verify@example.com").first()
        token = user.verify_token

    verify_res = client.get(f"/auth/verify-email?token={token}")
    assert verify_res.status_code == 200
    assert verify_res.json()["user"]["is_verified"] is True

    with db_factory() as db:
        user = db.query(User).filter(User.email == "success_verify@example.com").first()
        assert user.is_verified is True
        assert user.verify_token is None


def test_verify_email_invalid_token(client):
    res = client.get("/auth/verify-email?token=invalid_token_123")
    assert res.status_code == 400
    assert "geçersiz veya süresi dolmuş" in res.json()["detail"]


def test_resend_verification(client, db_factory):
    register(client, email="resend@example.com")

    resend_res = client.post("/auth/resend-verification", json={"email": "resend@example.com"})
    assert resend_res.status_code == 200
    assert "tekrar gönderildi" in resend_res.json()["message"]


def test_unverified_user_cannot_analyze(client):
    register(client, email="unverified_analyzer@example.com")

    # Yorum analizi başlatma isteği
    analyze_res = client.post(
        "/analyze",
        json={"video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    )
    assert analyze_res.status_code == 403
    assert "önce e-posta adresinizi doğrulayın" in str(analyze_res.json())

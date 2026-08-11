import pytest

import auth
from database import User
from tests.conftest import apply_session_token


VALID_PASSWORD = "GucluSifre1"


def register(client, email="user@example.com", name="Test Kullanıcı"):
    response = client.post(
        "/auth/register",
        json={"full_name": name, "email": email, "password": VALID_PASSWORD},
    )
    if response.status_code == 201:
        apply_session_token(client, response)
    return response


def test_password_validation_and_argon2_hash():
    for weak in ("short1A", "buyukharfyok1", "KUCUKHARFYOK1", "RakamYokBurada"):
        with pytest.raises(ValueError):
            auth.validate_password_strength(weak)

    encoded = auth.password_hasher.hash(VALID_PASSWORD)
    assert encoded.startswith("$argon2")
    assert auth.password_hasher.verify(VALID_PASSWORD, encoded)


def test_register_login_me_logout(client):
    response = register(client, email="USER@Example.com")
    assert response.status_code == 201
    assert response.json()["email"] == "user@example.com"
    assert response.json()["has_password"] is True
    assert response.json()["analysis_credits"] == auth.settings.default_user_credits
    assert "session_token" in response.json()

    assert client.get("/auth/me").status_code == 200
    logout = client.post("/auth/logout")
    assert logout.status_code == 204
    client.headers.pop("Authorization", None)
    assert client.get("/auth/me").status_code == 401

    login = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": VALID_PASSWORD},
    )
    assert login.status_code == 200
    apply_session_token(client, login)
    assert client.get("/auth/me").json()["full_name"] == "Test Kullanıcı"


def test_inactive_and_admin_access(client, db_factory):
    register(client)
    assert client.get("/admin/users").status_code == 403

    with db_factory() as db:
        user = db.query(User).filter(User.email == "user@example.com").one()
        user.is_active = False
        db.commit()
    assert client.get("/auth/me").status_code == 403

    with db_factory() as db:
        admin = User(
            full_name="Yönetici",
            email="admin@example.com",
            password_hash=auth.password_hasher.hash(VALID_PASSWORD),
            provider="email",
            role="admin",
            analysis_credits=99,
        )
        db.add(admin)
        db.commit()
    client.headers.clear()
    login = client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": VALID_PASSWORD},
    )
    assert login.status_code == 200
    apply_session_token(client, login)
    listing = client.get("/admin/users")
    assert listing.status_code == 200
    assert listing.json()["total"] == 2
    managed_user = next(
        item for item in listing.json()["items"] if item["email"] == "user@example.com"
    )
    updated = client.patch(
        f"/admin/users/{managed_user['id']}",
        json={
            "full_name": "Güncellenen Kullanıcı",
            "email": "updated@example.com",
            "avatar_url": "https://example.com/updated.png",
            "is_active": True,
        },
    )
    assert updated.status_code == 200
    assert updated.json()["full_name"] == "Güncellenen Kullanıcı"
    assert updated.json()["email"] == "updated@example.com"


def test_profile_and_password_change(client):
    assert register(client).status_code == 201
    updated = client.patch(
        "/users/me",
        json={"full_name": "Yeni İsim", "avatar_url": "https://example.com/avatar.png"},
    )
    assert updated.status_code == 200
    assert updated.json()["full_name"] == "Yeni İsim"

    changed = client.post(
        "/users/me/change-password",
        json={"current_password": VALID_PASSWORD, "new_password": "YeniParola2"},
    )
    assert changed.status_code == 204
    client.post("/auth/logout")
    client.headers.pop("Authorization", None)
    assert (
        client.post(
            "/auth/login",
            json={"email": "user@example.com", "password": VALID_PASSWORD},
        ).status_code
        == 401
    )
    login = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "YeniParola2"},
    )
    assert login.status_code == 200
    apply_session_token(client, login)

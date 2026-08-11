import auth
from credits import assert_can_analyze, CreditsExhausted
from database import GuestDevice, User
import pytest
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


def test_register_starts_with_default_credits(client):
    response = register(client)
    assert response.status_code == 201
    assert response.json()["analysis_credits"] == auth.settings.default_user_credits


def test_guest_with_used_quota_is_blocked(db_factory):
    guest = GuestDevice(token_hash="x" * 64, analyses_used=1)
    with pytest.raises(CreditsExhausted):
        assert_can_analyze(None, guest, from_cache=False, force_refresh=False)


def test_guest_can_reopen_cached_analysis_after_quota_used(db_factory):
    guest = GuestDevice(token_hash="x" * 64, analyses_used=1)
    assert_can_analyze(None, guest, from_cache=True, force_refresh=False) is None


def test_user_without_credits_is_blocked_for_new_analysis(db_factory):
    with db_factory() as db:
        user = User(
            full_name="Kullanıcı",
            email="nocredit@example.com",
            password_hash=auth.password_hasher.hash(VALID_PASSWORD),
            provider="email",
            analysis_credits=0,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        with pytest.raises(CreditsExhausted):
            assert_can_analyze(user, None, from_cache=False, force_refresh=False)


def test_user_without_credits_can_view_cache(db_factory):
    with db_factory() as db:
        user = User(
            full_name="Kullanıcı",
            email="cached@example.com",
            password_hash=auth.password_hasher.hash(VALID_PASSWORD),
            provider="email",
            analysis_credits=0,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        assert_can_analyze(user, None, from_cache=True, force_refresh=False) is None


def test_user_charged_once_per_video(db_factory):
    from credits import consume_analysis, user_already_charged

    with db_factory() as db:
        user = User(
            full_name="Kullanıcı",
            email="once@example.com",
            password_hash=auth.password_hasher.hash(VALID_PASSWORD),
            provider="email",
            analysis_credits=3,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        consume_analysis(
            db,
            user,
            None,
            video_id="vid123",
            from_cache=False,
            force_refresh=False,
        )
        db.refresh(user)
        assert user.analysis_credits == 2
        assert user_already_charged(db, user.id, "vid123")

        consume_analysis(
            db,
            user,
            None,
            video_id="vid123",
            from_cache=False,
            force_refresh=False,
        )
        db.refresh(user)
        assert user.analysis_credits == 2


def test_admin_can_add_credits(client, db_factory):
    register(client, email="member@example.com")
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

    client.cookies.clear()
    login = client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": VALID_PASSWORD},
    )
    assert login.status_code == 200
    apply_session_token(client, login)

    users = client.get("/admin/users").json()["items"]
    member = next(item for item in users if item["email"] == "member@example.com")
    assert member["analysis_credits"] == auth.settings.default_user_credits

    updated = client.post(
        f"/admin/users/{member['id']}/credits",
        json={"add": 5},
    )
    assert updated.status_code == 200
    assert updated.json()["analysis_credits"] == auth.settings.default_user_credits + 5

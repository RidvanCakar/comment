import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _bool_env(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _int_env(name: str, default: int, minimum: int = 1) -> int:
    try:
        return max(minimum, int(os.getenv(name, str(default))))
    except ValueError:
        return default


def _origins() -> tuple[str, ...]:
    raw = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000")
    return tuple(origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip())


@dataclass(frozen=True)
class Settings:
    auth_secret: str = os.getenv("AUTH_SECRET", "")
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    frontend_origins: tuple[str, ...] = _origins()
    cookie_name: str = os.getenv("AUTH_COOKIE_NAME", "comment_session")
    cookie_secure: bool = _bool_env("AUTH_COOKIE_SECURE", False)
    cookie_domain: str | None = os.getenv("AUTH_COOKIE_DOMAIN") or None
    session_days: int = _int_env("AUTH_SESSION_DAYS", 14)
    lock_attempts: int = _int_env("AUTH_LOCK_ATTEMPTS", 5)
    lock_minutes: int = _int_env("AUTH_LOCK_MINUTES", 15)
    rate_limit_requests: int = _int_env("AUTH_RATE_LIMIT_REQUESTS", 10)
    rate_limit_window_seconds: int = _int_env("AUTH_RATE_LIMIT_WINDOW_SECONDS", 60)
    initial_admin_email: str = os.getenv("INITIAL_ADMIN_EMAIL", "").strip().lower()
    default_user_credits: int = _int_env("DEFAULT_USER_CREDITS", 5, minimum=0)
    guest_analysis_limit: int = _int_env("GUEST_ANALYSIS_LIMIT", 1, minimum=0)
    support_whatsapp: str = os.getenv("SUPPORT_WHATSAPP", "905418015310")
    resend_api_key: str = os.getenv("RESEND_API_KEY", "")
    resend_from_email: str = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")


settings = Settings()

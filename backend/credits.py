import hashlib
import secrets
from datetime import datetime

from fastapi import HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from config import settings
from database import AuthSession, GuestDevice, User, UserAnalysisCharge


GUEST_COOKIE_NAME = "comment_guest_device"
CHANNEL_ANALYSIS_CREDIT_COST = 3


class CreditsExhausted(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Analiz hakkınız kalmadı. Ek kredi almak için WhatsApp üzerinden iletişime geçin.",
                "code": "CREDITS_EXHAUSTED",
                "whatsapp": settings.support_whatsapp,
            },
        )



def utcnow() -> datetime:
    return datetime.utcnow()


def _token_hash(token: str) -> str:
    from session_tokens import token_hash as hash_token

    return hash_token(token)


def get_optional_user(request: Request, db: Session) -> User | None:
    from session_tokens import extract_session_token, token_hash

    token = extract_session_token(request)
    if not token:
        return None
    auth_session = (
        db.query(AuthSession)
        .filter(AuthSession.token_hash == token_hash(token))
        .first()
    )
    if not auth_session or auth_session.expires_at <= utcnow():
        return None
    if not auth_session.user.is_active:
        return None
    auth_session.last_seen_at = utcnow()
    db.commit()
    return auth_session.user


def _set_guest_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=GUEST_COOKIE_NAME,
        value=token,
        max_age=365 * 24 * 60 * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        domain=settings.cookie_domain,
        path="/",
    )


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def get_or_create_guest(request: Request, response: Response, db: Session) -> GuestDevice:
    ip = get_client_ip(request)
    token = request.cookies.get(GUEST_COOKIE_NAME)

    # 1. Önce IP adresine göre mevcut misafir kaydını kontrol et
    if ip:
        guest_by_ip = db.query(GuestDevice).filter(GuestDevice.ip_address == ip).first()
        if guest_by_ip:
            if token and not guest_by_ip.token_hash:
                guest_by_ip.token_hash = _token_hash(token)
                db.commit()
            return guest_by_ip

    # 2. Kurabiye (Cookie) token'ına göre kontrol et
    if token:
        guest_by_cookie = (
            db.query(GuestDevice)
            .filter(GuestDevice.token_hash == _token_hash(token))
            .first()
        )
        if guest_by_cookie:
            if ip and not guest_by_cookie.ip_address:
                guest_by_cookie.ip_address = ip
                db.commit()
            return guest_by_cookie

    # 3. Bulunamadıysa IP ve token bilgisi ile yeni misafir cihazı kaydet
    raw_token = secrets.token_urlsafe(32)
    guest = GuestDevice(
        token_hash=_token_hash(raw_token),
        ip_address=ip,
        analyses_used=0,
    )
    db.add(guest)
    db.commit()
    db.refresh(guest)
    _set_guest_cookie(response, raw_token)
    return guest


def _is_unlimited(user: User | None) -> bool:
    return bool(user and user.role == "admin")


def user_already_charged(db: Session, user_id: int, video_id: str) -> bool:
    return (
        db.query(UserAnalysisCharge.user_id)
        .filter(
            UserAnalysisCharge.user_id == user_id,
            UserAnalysisCharge.video_id == video_id,
        )
        .first()
        is not None
    )


def assert_can_analyze(
    user: User | None,
    guest: GuestDevice | None,
    *,
    from_cache: bool,
    force_refresh: bool,
) -> None:
    if _is_unlimited(user):
        return

    if user:
        if not getattr(user, "is_verified", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Lütfen önce e-posta adresinizi doğrulayın.",
            )
        # Önbellekten tekrar açmak ücretsiz (yeniden analiz hariç).
        if from_cache and not force_refresh:
            return
        if user.analysis_credits <= 0:
            raise CreditsExhausted()
        return

    if guest:
        if guest.analyses_used >= settings.guest_analysis_limit:
            # Hak bitti ama önbellekten tekrar açabilir.
            if from_cache and not force_refresh:
                return
            raise CreditsExhausted()
        return


def consume_analysis(
    db: Session,
    user: User | None,
    guest: GuestDevice | None,
    *,
    video_id: str,
    from_cache: bool,
    force_refresh: bool,
) -> None:
    if _is_unlimited(user):
        return

    if guest and not user:
        if from_cache and not force_refresh:
            if guest.analyses_used >= settings.guest_analysis_limit:
                return
        elif guest.analyses_used >= settings.guest_analysis_limit:
            return
        guest.analyses_used += 1
        guest.last_used_at = utcnow()
        db.commit()
        return

    if not user:
        return

    # Kayıtlı kullanıcı: önbellekten okuma ve daha önce açılmış video ücretsiz.
    if from_cache and not force_refresh:
        return
    if not force_refresh and user_already_charged(db, user.id, video_id):
        return

    user.analysis_credits = max(0, user.analysis_credits - 1)
    if not db.query(UserAnalysisCharge).filter_by(user_id=user.id, video_id=video_id).first():
        db.add(UserAnalysisCharge(user_id=user.id, video_id=video_id))
    db.commit()


def assert_can_analyze_channel(
    user: User | None,
    guest: GuestDevice | None,
) -> None:
    """Kanal analizi için 3 kredi gereksinimini ve e-posta doğrulamasını kontrol eder."""
    if _is_unlimited(user):
        return

    if user:
        if not getattr(user, "is_verified", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Lütfen önce e-posta adresinizi doğrulayın.",
            )
        if user.analysis_credits < CHANNEL_ANALYSIS_CREDIT_COST:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": f"Kanal analizi için en az {CHANNEL_ANALYSIS_CREDIT_COST} krediniz olması gerekmektedir.",
                    "code": "INSUFFICIENT_CREDITS",
                    "required_credits": CHANNEL_ANALYSIS_CREDIT_COST,
                    "available_credits": user.analysis_credits,
                    "whatsapp": settings.support_whatsapp,
                },
            )
        return

    if guest:
        remaining = max(0, settings.guest_analysis_limit - guest.analyses_used)
        if remaining < CHANNEL_ANALYSIS_CREDIT_COST:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": f"Kanal analizi için en az {CHANNEL_ANALYSIS_CREDIT_COST} krediniz olması gerekmektedir. Ek kredi için lütfen kayıt olun veya iletişime geçin.",
                    "code": "INSUFFICIENT_CREDITS",
                    "required_credits": CHANNEL_ANALYSIS_CREDIT_COST,
                    "available_credits": remaining,
                    "whatsapp": settings.support_whatsapp,
                },
            )
        return


def charge_user_for_channel_analysis(
    db: Session,
    user: User | None,
    guest: GuestDevice | None,
) -> None:
    """Kanal analizi tamamlandığında kullanıcı veya misafir bakiyesinden 3 kredi düşer."""
    if _is_unlimited(user):
        return

    if user:
        if user.analysis_credits < CHANNEL_ANALYSIS_CREDIT_COST:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": f"Kanal analizi için en az {CHANNEL_ANALYSIS_CREDIT_COST} krediniz olması gerekmektedir.",
                    "code": "INSUFFICIENT_CREDITS",
                    "required_credits": CHANNEL_ANALYSIS_CREDIT_COST,
                    "available_credits": user.analysis_credits,
                    "whatsapp": settings.support_whatsapp,
                },
            )
        user.analysis_credits = max(0, user.analysis_credits - CHANNEL_ANALYSIS_CREDIT_COST)
        db.commit()
        return

    if guest:
        guest.analyses_used += CHANNEL_ANALYSIS_CREDIT_COST
        guest.last_used_at = utcnow()
        db.commit()
        return



def quota_snapshot(user: User | None, guest: GuestDevice | None) -> dict:
    if _is_unlimited(user):
        return {
            "is_guest": False,
            "unlimited": True,
            "credits_remaining": None,
            "credits_total": None,
            "whatsapp": settings.support_whatsapp,
        }

    if user:
        return {
            "is_guest": False,
            "unlimited": False,
            "credits_remaining": user.analysis_credits,
            "credits_total": settings.default_user_credits,
            "whatsapp": settings.support_whatsapp,
        }

    remaining = max(0, settings.guest_analysis_limit - (guest.analyses_used if guest else 0))
    return {
        "is_guest": True,
        "unlimited": False,
        "credits_remaining": remaining,
        "credits_total": settings.guest_analysis_limit,
        "whatsapp": settings.support_whatsapp,
    }


def promote_initial_admin(db: Session) -> None:
    email = settings.initial_admin_email
    if not email:
        return
    user = db.query(User).filter(User.email == email).first()
    if user and user.role != "admin":
        user.role = "admin"
        db.commit()

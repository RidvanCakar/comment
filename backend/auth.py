import hashlib
import secrets
import threading
import time
import urllib.parse
from datetime import datetime, timedelta
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from pwdlib import PasswordHash
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from config import settings
from database import AuthSession, User, get_db
from email_service import send_verification_email, send_password_reset_email


auth_router = APIRouter(prefix="/auth", tags=["Kimlik Doğrulama"])
users_router = APIRouter(prefix="/users", tags=["Kullanıcı"])
admin_router = APIRouter(prefix="/admin", tags=["Yönetim"])
password_hasher = PasswordHash.recommended()
DUMMY_PASSWORD_HASH = password_hasher.hash("HesapBulunamadi1")


def utcnow() -> datetime:
    return datetime.utcnow()


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_password_strength(password: str) -> str:
    if len(password) < 8:
        raise ValueError("Şifre en az 8 karakter olmalıdır.")
    if not any(char.isupper() for char in password):
        raise ValueError("Şifre en az bir büyük harf içermelidir.")
    if not any(char.islower() for char in password):
        raise ValueError("Şifre en az bir küçük harf içermelidir.")
    if not any(char.isdigit() for char in password):
        raise ValueError("Şifre en az bir rakam içermelidir.")
    return password


def verify_password(password: str, encoded: str) -> bool:
    try:
        return password_hasher.verify(password, encoded)
    except Exception:
        return False


def _validate_name(name: str) -> str:
    cleaned = " ".join(name.split())
    if len(cleaned) < 2:
        raise ValueError("Ad soyad en az 2 karakter olmalıdır.")
    return cleaned


def _validate_avatar(value: str | None) -> str | None:
    if value is None or not value.strip():
        return None
    cleaned = value.strip()
    parsed = urllib.parse.urlparse(cleaned)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("Avatar adresi geçerli bir HTTP(S) adresi olmalıdır.")
    return cleaned


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    _name = field_validator("full_name")(_validate_name)
    _password = field_validator("password")(validate_password_strength)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=1, max_length=255)


class ResendVerificationRequest(BaseModel):
    email: EmailStr | None = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1, max_length=255)
    new_password: str = Field(min_length=8, max_length=128)

    _password = field_validator("new_password")(validate_password_strength)


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    avatar_url: str | None = Field(default=None, max_length=2048)

    _name = field_validator("full_name")(_validate_name)
    _avatar = field_validator("avatar_url")(_validate_avatar)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

    _password = field_validator("new_password")(validate_password_strength)


class DeleteMeRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)


class AdminUserUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None
    avatar_url: str | None = Field(default=None, max_length=2048)
    role: Literal["admin", "user"] | None = None
    is_active: bool | None = None
    analysis_credits: int | None = Field(default=None, ge=0, le=100000)

    _name = field_validator("full_name")(_validate_name)
    _avatar = field_validator("avatar_url")(_validate_avatar)


class AdminAddCreditsRequest(BaseModel):
    add: int = Field(ge=1, le=100000)


class UserResponse(BaseModel):
    id: int
    avatar_url: str | None
    full_name: str
    email: str
    provider: str
    has_password: bool
    role: str
    is_active: bool
    analysis_credits: int
    is_verified: bool = False
    isVerified: bool = False
    email_verified: bool | None = False
    last_login_at: datetime | None
    created_at: datetime


class AuthResult(UserResponse):
    session_token: str


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    page_size: int


def user_response(user: User) -> UserResponse:
    is_ver = bool(getattr(user, "is_verified", False))
    return UserResponse(
        id=user.id,
        avatar_url=user.avatar_url,
        full_name=user.full_name,
        email=user.email,
        provider=user.provider,
        has_password=bool(user.password_hash),
        role=user.role,
        is_active=user.is_active,
        analysis_credits=user.analysis_credits,
        is_verified=is_ver,
        isVerified=is_ver,
        email_verified=is_ver,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
    )


def auth_result(user: User, session_token: str) -> AuthResult:
    return AuthResult(**user_response(user).model_dump(), session_token=session_token)


class FixedWindowLimiter:
    def __init__(self) -> None:
        self._entries: dict[str, tuple[float, int]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        window = settings.rate_limit_window_seconds
        with self._lock:
            started, count = self._entries.get(key, (now, 0))
            if now - started >= window:
                started, count = now, 0
            count += 1
            self._entries[key] = (started, count)
            if len(self._entries) > 10_000:
                cutoff = now - window
                self._entries = {
                    item_key: value
                    for item_key, value in self._entries.items()
                    if value[0] >= cutoff
                }
            return count <= settings.rate_limit_requests


rate_limiter = FixedWindowLimiter()


def sensitive_route(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    if not rate_limiter.allow(f"{request.url.path}:{ip}"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.",
        )


def _token_hash(token: str) -> str:
    from session_tokens import token_hash as hash_token

    return hash_token(token)


def _promote_initial_admin(user: User) -> None:
    if settings.initial_admin_email and user.email == settings.initial_admin_email:
        user.role = "admin"


def _set_session_cookie(response: Response, token: str) -> None:
    max_age = settings.session_days * 24 * 60 * 60
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        domain=settings.cookie_domain,
        path="/",
    )


def _delete_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.cookie_name,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        domain=settings.cookie_domain,
        path="/",
    )


def _create_session(db: Session, user: User, request: Request) -> str:
    raw_token = secrets.token_urlsafe(48)
    db.add(
        AuthSession(
            token_hash=_token_hash(raw_token),
            user_id=user.id,
            expires_at=utcnow() + timedelta(days=settings.session_days),
            ip_address=request.client.host if request.client else None,
            user_agent=(request.headers.get("user-agent") or "")[:512] or None,
        )
    )
    return raw_token


def get_current_session(
    request: Request, db: Annotated[Session, Depends(get_db)]
) -> AuthSession:
    from session_tokens import extract_session_token

    token = extract_session_token(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum açmanız gerekiyor.",
        )
    auth_session = (
        db.query(AuthSession)
        .filter(AuthSession.token_hash == _token_hash(token))
        .first()
    )
    if not auth_session or auth_session.expires_at <= utcnow():
        if auth_session:
            db.delete(auth_session)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum geçersiz veya süresi dolmuş.",
        )
    if not auth_session.user.is_active:
        db.delete(auth_session)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hesabınız aktif değil.",
        )
    auth_session.last_seen_at = utcnow()
    db.commit()
    return auth_session


def get_current_user(
    auth_session: Annotated[AuthSession, Depends(get_current_session)],
) -> User:
    return auth_session.user


def require_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için yönetici yetkisi gerekiyor.",
        )
    return user


@auth_router.post("/register", response_model=AuthResult, status_code=201)
def register(
    payload: RegisterRequest,
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    _limited: Annotated[None, Depends(sensitive_route)],
) -> AuthResult:
    email = normalize_email(str(payload.email))
    if db.query(User.id).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Kayıt işlemi tamamlanamadı.")

    verify_token = secrets.token_urlsafe(32)
    user = User(
        full_name=payload.full_name,
        email=email,
        password_hash=password_hasher.hash(payload.password),
        provider="email",
        analysis_credits=settings.default_user_credits,
        is_verified=False,
        verify_token=verify_token,
        verify_token_expires_at=utcnow() + timedelta(hours=24),
    )
    _promote_initial_admin(user)
    db.add(user)
    try:
        db.flush()
        token = _create_session(db, user, request)
        user.last_login_at = utcnow()
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Kayıt işlemi tamamlanamadı.")
    db.refresh(user)

    # Resend üzerinden e-posta doğrulama maili gönder (varsa)
    send_verification_email(user.email, user.full_name, verify_token)

    _delete_session_cookie(response)
    return auth_result(user, token)


@auth_router.get("/verify-email")
@auth_router.post("/verify-email")
def verify_email(
    db: Annotated[Session, Depends(get_db)],
    token: str | None = Query(default=None),
    payload: VerifyEmailRequest | None = None,
):
    raw_token = (token or (payload.token if payload else "") or "").strip()
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doğrulama token'ı bulunamadı.",
        )

    user = db.query(User).filter(User.verify_token == raw_token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doğrulama bağlantısı geçersiz veya süresi dolmuş.",
        )

    if user.verify_token_expires_at and user.verify_token_expires_at < utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doğrulama bağlantısının süresi dolmuş. Lütfen yeni bir doğrulama e-postası isteyin.",
        )

    user.is_verified = True
    user.verify_token = None
    user.verify_token_expires_at = None
    db.commit()
    db.refresh(user)

    return {
        "message": "E-posta adresiniz başarıyla doğrulandı.",
        "user": user_response(user),
    }


@auth_router.post("/resend-verification")
def resend_verification(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    _limited: Annotated[None, Depends(sensitive_route)],
    payload: ResendVerificationRequest | None = None,
):
    from credits import get_optional_user

    user = get_optional_user(request, db)
    if not user and payload and payload.email:
        user = db.query(User).filter(User.email == normalize_email(str(payload.email))).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı.",
        )

    if user.is_verified:
        return {"message": "E-posta adresiniz zaten doğrulanmış."}

    verify_token = secrets.token_urlsafe(32)
    user.verify_token = verify_token
    user.verify_token_expires_at = utcnow() + timedelta(hours=24)
    db.commit()

    sent = send_verification_email(user.email, user.full_name, verify_token)
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        )

    return {
        "message": "Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.",
    }


@auth_router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Annotated[Session, Depends(get_db)],
    _limited: Annotated[None, Depends(sensitive_route)],
):
    email = normalize_email(str(payload.email))
    user = db.query(User).filter(User.email == email).first()

    if user and user.is_active:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires_at = utcnow() + timedelta(hours=1)
        db.commit()
        send_password_reset_email(user.email, user.full_name, token)

    return {
        "message": "Eğer bu e-posta adresi ile kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi."
    }


@auth_router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Annotated[Session, Depends(get_db)],
    _limited: Annotated[None, Depends(sensitive_route)],
):
    raw_token = payload.token.strip()
    user = db.query(User).filter(User.reset_token == raw_token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.",
        )

    if user.reset_token_expires_at and user.reset_token_expires_at < utcnow():
        user.reset_token = None
        user.reset_token_expires_at = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifre sıfırlama bağlantısının süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebinde bulunun.",
        )

    user.password_hash = password_hasher.hash(payload.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    user.failed_login_attempts = 0
    user.locked_until = None

    # Güvenlik için kullanıcının mevcut tüm oturumlarını sonlandır
    db.query(AuthSession).filter(AuthSession.user_id == user.id).delete()

    db.commit()
    db.refresh(user)

    return {
        "message": "Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz."
    }


@auth_router.post("/login", response_model=AuthResult)
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    _limited: Annotated[None, Depends(sensitive_route)],
) -> AuthResult:
    generic_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="E-posta veya şifre hatalı.",
    )
    user = db.query(User).filter(User.email == normalize_email(str(payload.email))).first()
    password_valid = verify_password(
        payload.password,
        user.password_hash if user and user.password_hash else DUMMY_PASSWORD_HASH,
    )
    if (
        not user
        or not user.password_hash
        or not user.is_active
        or (user.locked_until and user.locked_until > utcnow())
    ):
        raise generic_error

    if not password_valid:
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.lock_attempts:
            user.locked_until = utcnow() + timedelta(minutes=settings.lock_minutes)
            user.failed_login_attempts = 0
        db.commit()
        raise generic_error

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = utcnow()
    _promote_initial_admin(user)
    token = _create_session(db, user, request)
    db.commit()
    db.refresh(user)
    _delete_session_cookie(response)
    return auth_result(user, token)


@auth_router.get("/me", response_model=UserResponse)
def auth_me(user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    return user_response(user)


@auth_router.post("/logout", status_code=204)
def logout(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    from session_tokens import extract_session_token

    token = extract_session_token(request)
    if token:
        auth_session = (
            db.query(AuthSession)
            .filter(AuthSession.token_hash == _token_hash(token))
            .first()
        )
        if auth_session:
            db.delete(auth_session)
            db.commit()


@users_router.patch("/me", response_model=UserResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    changes = payload.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user_response(user)


@users_router.post("/me/change-password", status_code=204)
def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    _limited: Annotated[None, Depends(sensitive_route)],
) -> None:
    if not user.password_hash:
        raise HTTPException(
            status_code=400,
            detail="Bu hesap için e-posta ve şifre ile giriş etkin değil.",
        )
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı.")
    user.password_hash = password_hasher.hash(payload.new_password)
    db.query(AuthSession).filter(
        AuthSession.user_id == user.id,
        AuthSession.id != get_current_session(request, db).id,
    ).delete(synchronize_session=False)
    db.commit()


@users_router.delete("/me", status_code=204)
def delete_me(
    payload: DeleteMeRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    _limited: Annotated[None, Depends(sensitive_route)],
) -> None:
    if not verify_password(payload.current_password, user.password_hash or ""):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı.")
    if user.role == "admin" and _active_admin_count(db) <= 1:
        raise HTTPException(status_code=400, detail="Son aktif yönetici silinemez.")
    db.delete(user)
    db.commit()


def _active_admin_count(db: Session) -> int:
    return (
        db.query(func.count(User.id))
        .filter(User.role == "admin", User.is_active.is_(True))
        .scalar()
        or 0
    )


@admin_router.get("/users", response_model=UserListResponse)
def list_users(
    _admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(default=None, max_length=120),
    role: Literal["admin", "user"] | None = None,
    is_active: bool | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> UserListResponse:
    query = db.query(User)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(func.lower(User.full_name).like(term), func.lower(User.email).like(term))
        )
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    total = query.count()
    users = (
        query.order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return UserListResponse(
        items=[user_response(user) for user in users],
        total=total,
        page=page,
        page_size=page_size,
    )


@admin_router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: AdminUserUpdateRequest,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    changes = payload.model_dump(exclude_unset=True)
    if "email" in changes:
        normalized_email = normalize_email(str(changes["email"]))
        email_owner = (
            db.query(User.id)
            .filter(User.email == normalized_email, User.id != target.id)
            .first()
        )
        if email_owner:
            raise HTTPException(status_code=409, detail="Bu e-posta adresi kullanımda.")
        changes["email"] = normalized_email
    if target.id == admin.id and (
        changes.get("role") == "user" or changes.get("is_active") is False
    ):
        raise HTTPException(
            status_code=400,
            detail="Kendi yönetici yetkinizi veya hesabınızı devre dışı bırakamazsınız.",
        )
    removes_active_admin = (
        target.role == "admin"
        and target.is_active
        and (changes.get("role") == "user" or changes.get("is_active") is False)
    )
    if removes_active_admin and _active_admin_count(db) <= 1:
        raise HTTPException(status_code=400, detail="Son aktif yönetici kaldırılamaz.")
    for key, value in changes.items():
        setattr(target, key, value)
    db.commit()
    db.refresh(target)
    return user_response(target)


@admin_router.post("/users/{user_id}/credits", response_model=UserResponse)
def add_user_credits(
    user_id: int,
    payload: AdminAddCreditsRequest,
    _admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    target.analysis_credits += payload.add
    db.commit()
    db.refresh(target)
    return user_response(target)


@admin_router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    if target.id == admin.id:
        raise HTTPException(status_code=400, detail="Kendi hesabınızı silemezsiniz.")
    if target.role == "admin" and target.is_active and _active_admin_count(db) <= 1:
        raise HTTPException(status_code=400, detail="Son aktif yönetici silinemez.")
    db.delete(target)
    db.commit()

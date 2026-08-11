import hashlib

from fastapi import Request

from config import settings


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def extract_session_token(request: Request) -> str | None:
    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
        if token:
            return token
    cookie_token = request.cookies.get(settings.cookie_name)
    if cookie_token:
        return cookie_token
    return None

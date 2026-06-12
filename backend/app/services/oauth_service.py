from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.services.auth_service import get_user_by_email, get_user_by_username
from app.utils.security import create_access_token, hash_password

OAUTH_STATE_AUDIENCE = "oauth-state"


def make_oauth_state(provider: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    return jwt.encode(
        {"sub": provider, "aud": OAUTH_STATE_AUDIENCE, "exp": expires_at},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def verify_oauth_state(state: str, provider: str) -> None:
    try:
        payload = jwt.decode(
            state,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            audience=OAUTH_STATE_AUDIENCE,
        )
    except JWTError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid OAuth state") from exc
    if payload.get("sub") != provider:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid OAuth provider")


def get_oauth_authorize_url(provider: str, redirect_uri: str) -> str:
    state = make_oauth_state(provider)
    if provider == "google":
        if not settings.google_client_id:
            raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Google sign-in is not configured")
        params = {
            "client_id": settings.google_client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "prompt": "select_account",
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    if provider == "github":
        if not settings.github_client_id:
            raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "GitHub sign-in is not configured")
        params = {
            "client_id": settings.github_client_id,
            "redirect_uri": redirect_uri,
            "scope": "read:user user:email",
            "state": state,
        }
        return f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    raise HTTPException(status.HTTP_404_NOT_FOUND, "OAuth provider not found")


async def authenticate_oauth_user(db: Session, provider: str, code: str, state: str, redirect_uri: str) -> User:
    verify_oauth_state(state, provider)
    if provider == "google":
        profile = await fetch_google_profile(code, redirect_uri)
    elif provider == "github":
        profile = await fetch_github_profile(code, redirect_uri)
    else:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "OAuth provider not found")
    return get_or_create_oauth_user(db, profile)


async def fetch_google_profile(code: str, redirect_uri: str) -> dict[str, str]:
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Google sign-in is not configured")
    async with httpx.AsyncClient(timeout=10) as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
        )
        token_response.raise_for_status()
        access_token = token_response.json()["access_token"]
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_response.raise_for_status()
    data = user_response.json()
    if not data.get("email") or data.get("email_verified") is False:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Google account email is not verified")
    return {
        "email": data["email"],
        "name": data.get("name") or data["email"].split("@")[0],
        "avatar_url": data.get("picture") or "",
    }


async def fetch_github_profile(code: str, redirect_uri: str) -> dict[str, str]:
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "GitHub sign-in is not configured")
    async with httpx.AsyncClient(timeout=10) as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        token_response.raise_for_status()
        access_token = token_response.json().get("access_token")
        if not access_token:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "GitHub did not return an access token")
        headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
        user_response = await client.get("https://api.github.com/user", headers=headers)
        user_response.raise_for_status()
        emails_response = await client.get("https://api.github.com/user/emails", headers=headers)
        emails_response.raise_for_status()
    user_data = user_response.json()
    email = next(
        (
            item["email"]
            for item in emails_response.json()
            if item.get("primary") and item.get("verified") and item.get("email")
        ),
        None,
    )
    if not email:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "GitHub account needs a verified primary email")
    return {
        "email": email,
        "name": user_data.get("name") or user_data.get("login") or email.split("@")[0],
        "avatar_url": user_data.get("avatar_url") or "",
    }


def get_or_create_oauth_user(db: Session, profile: dict[str, str]) -> User:
    email = profile["email"].lower()
    existing = get_user_by_email(db, email)
    if existing:
        return existing

    user = User(
        name=profile["name"][:120],
        email=email,
        username=make_unique_username(db, email),
        password_hash=hash_password(token_urlsafe(32)[:32]),
        avatar_url=profile["avatar_url"],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def make_unique_username(db: Session, email: str) -> str:
    base = "".join(ch for ch in email.split("@")[0].lower() if ch.isalnum() or ch in ("_", "-"))
    base = (base or "user")[:40]
    username = base
    counter = 1
    while get_user_by_username(db, username):
        counter += 1
        username = f"{base}{counter}"
    return username


def make_oauth_fragment(user: User) -> str:
    return urlencode({"access_token": create_access_token(str(user.id)), "token_type": "bearer"})

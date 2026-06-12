from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserRead
from app.services.auth_service import authenticate_user, make_token_for_user, register_user
from app.services.oauth_service import (
    authenticate_oauth_user,
    get_oauth_authorize_url,
    make_oauth_fragment,
)


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = register_user(db, payload)
    return TokenResponse(access_token=make_token_for_user(user), user=user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = authenticate_user(db, payload.email, payload.password)
    return TokenResponse(access_token=make_token_for_user(user), user=user)


@router.get("/oauth/{provider}/start")
def start_oauth(provider: str, request: Request) -> RedirectResponse:
    redirect_uri = get_callback_url(request, provider)
    return RedirectResponse(get_oauth_authorize_url(provider, redirect_uri))


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str,
    state: str,
    request: Request,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    redirect_uri = get_callback_url(request, provider)
    try:
        user = await authenticate_oauth_user(db, provider, code, state, redirect_uri)
    except Exception:
        params = urlencode({"oauth_error": "Could not sign in with that provider."})
        return RedirectResponse(f"{settings.frontend_origin}/login?{params}")
    return RedirectResponse(f"{settings.frontend_origin}/oauth/callback#{make_oauth_fragment(user)}")


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


def get_callback_url(request: Request, provider: str) -> str:
    proto = request.headers.get("x-forwarded-proto") or request.url.scheme
    host = request.headers.get("x-forwarded-host") or request.url.netloc
    return f"{proto}://{host}/api/auth/oauth/{provider}/callback"

"""Signup, login, logout, and current-session endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import COOKIE_NAME, get_optional_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.models import User
from app.schemas.schemas import AuthResponse, UserLogin, UserOut, UserSignup

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite=settings.cookie_samesite,
        secure=settings.cookie_secure,
        max_age=COOKIE_MAX_AGE_SECONDS,
        path="/",
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    """Create a new user account and start a session."""
    existing = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(name=payload.name, email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    _set_session_cookie(response, token)
    return AuthResponse(user=UserOut.model_validate(user), access_token=token)


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    """Verify credentials and start a session."""
    user = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user.id)
    _set_session_cookie(response, token)
    return AuthResponse(user=UserOut.model_validate(user), access_token=token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    """Clear the session cookie."""
    response.delete_cookie(
        COOKIE_NAME, path="/", samesite=settings.cookie_samesite, secure=settings.cookie_secure
    )


@router.get("/me", response_model=UserOut | None)
def me(current_user: User | None = Depends(get_optional_user)) -> User | None:
    """Return the currently logged-in user, or null if there's no active session.

    Deliberately 200+null rather than 401 here: this is a cheap "am I logged
    in" check called on every page load, and a 401 for the (very normal)
    logged-out case would show as a network-level console error in the
    browser even though the app handles it gracefully."""
    return current_user

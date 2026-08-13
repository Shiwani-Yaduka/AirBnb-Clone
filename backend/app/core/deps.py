"""FastAPI dependencies for authenticated/optional current-user resolution."""
from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User

COOKIE_NAME = "session_token"


def get_optional_user(
    session_token: str | None = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
) -> User | None:
    """Return the logged-in user if a valid session cookie is present, else None."""
    if not session_token:
        return None
    user_id = decode_access_token(session_token)
    if user_id is None:
        return None
    return db.get(User, user_id)


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    """Require a logged-in user; raise 401 otherwise."""
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user

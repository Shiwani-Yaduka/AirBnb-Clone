"""FastAPI dependencies for authenticated/optional current-user resolution via Clerk."""
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.clerk_auth import get_or_sync_user, verify_clerk_request
from app.core.database import get_db
from app.models.models import User


def get_optional_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    """Return the logged-in user if a valid Clerk session token is present, else None."""
    clerk_user_id = verify_clerk_request(request)
    if clerk_user_id is None:
        return None
    return get_or_sync_user(db, clerk_user_id)


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    """Require a logged-in user; raise 401 otherwise."""
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user

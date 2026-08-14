"""Current-session endpoint. Signup/login/logout are handled entirely by Clerk on the frontend."""
from fastapi import APIRouter, Depends

from app.core.deps import get_optional_user
from app.models.models import User
from app.schemas.schemas import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserOut | None)
def me(current_user: User | None = Depends(get_optional_user)) -> User | None:
    """Return the currently logged-in user (synced from Clerk), or null if there's no session.

    Deliberately 200+null rather than 401 here: this is a cheap "am I logged
    in" check called on every page load, and a 401 for the (very normal)
    logged-out case would show as a network-level console error in the
    browser even though the app handles it gracefully."""
    return current_user

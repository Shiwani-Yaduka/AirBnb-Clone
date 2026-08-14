"""Verifies Clerk session tokens and syncs the authenticated user into our own DB."""
from clerk_backend_api import AuthenticateRequestOptions, Clerk
from fastapi import Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import User

_clerk = Clerk(bearer_auth=settings.clerk_secret_key) if settings.clerk_secret_key else None


def verify_clerk_request(request: Request) -> str | None:
    """Return the authenticated Clerk user id for this request, or None if not signed in."""
    if _clerk is None:
        return None
    request_state = _clerk.authenticate_request(
        request,
        AuthenticateRequestOptions(authorized_parties=settings.cors_origins),
    )
    if not request_state.is_signed_in or not request_state.payload:
        return None
    return request_state.payload.get("sub")


def _fetch_clerk_profile(clerk_user_id: str) -> dict:
    """Fetch name/email/avatar for a Clerk user id via the Clerk API."""
    profile = _clerk.users.get(user_id=clerk_user_id)
    primary_email = next(
        (e.email_address for e in profile.email_addresses if e.id == profile.primary_email_address_id),
        profile.email_addresses[0].email_address if profile.email_addresses else f"{clerk_user_id}@clerk.invalid",
    )
    name = (
        " ".join(part for part in [profile.first_name, profile.last_name] if part)
        or profile.username
        or primary_email.split("@")[0]
    )
    return {"name": name, "email": primary_email, "avatar_url": profile.image_url}


def get_or_sync_user(db: Session, clerk_user_id: str) -> User:
    """Look up the local user for a Clerk id, creating it from Clerk's profile on first sight."""
    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if user is not None:
        return user
    profile = _fetch_clerk_profile(clerk_user_id)
    user = User(clerk_user_id=clerk_user_id, hashed_password=None, **profile)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

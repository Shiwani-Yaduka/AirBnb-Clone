"""Host dashboard (owned listings + their bookings) and wishlist/favorites endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import Favorite, Listing, ListingAmenity
from app.schemas.schemas import (
    BookingWithGuestOut,
    ListingCardOut,
    UserOut,
)
from app.models.models import User
from app.services.listing_view import get_favorited_ids, get_rating_map, to_card

router = APIRouter(tags=["users"])


@router.post("/users/me/become-host", response_model=UserOut)
def become_host(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> User:
    """Flip the current user to a host, unlocking listing creation. Idempotent."""
    if not current_user.is_host:
        current_user.is_host = True
        db.commit()
        db.refresh(current_user)
    return current_user


@router.get("/users/me/listings", response_model=list[ListingCardOut])
def my_listings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[ListingCardOut]:
    """Listings owned by the current user, for the host dashboard."""
    stmt = (
        select(Listing)
        .options(selectinload(Listing.photos), selectinload(Listing.host), selectinload(Listing.amenity_links).selectinload(ListingAmenity.amenity))
        .where(Listing.host_id == current_user.id)
        .order_by(Listing.created_at.desc())
    )
    listings = db.execute(stmt).unique().scalars().all()
    listing_ids = [listing.id for listing in listings]
    rating_map = get_rating_map(db, listing_ids)
    return [to_card(listing, *rating_map.get(listing.id, (0.0, 0)), False) for listing in listings]


@router.get("/listings/{listing_id}/bookings", response_model=list[BookingWithGuestOut])
def listing_bookings(
    listing_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[BookingWithGuestOut]:
    """Bookings for a listing owned by the current host."""
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this listing")

    from app.schemas.schemas import BookingOut

    results = []
    for booking in sorted(listing.bookings, key=lambda b: b.check_in, reverse=True):
        results.append(
            BookingWithGuestOut(
                **BookingOut.model_validate(booking).model_dump(),
                guest_name=booking.guest.name,
                guest_avatar_url=booking.guest.avatar_url,
            )
        )
    return results


@router.post("/favorites/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_favorite(listing_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> None:
    """Add a listing to the current user's wishlist (idempotent)."""
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    existing = db.execute(
        select(Favorite).where(Favorite.user_id == current_user.id, Favorite.listing_id == listing_id)
    ).scalar_one_or_none()
    if existing is None:
        db.add(Favorite(user_id=current_user.id, listing_id=listing_id))
        db.commit()


@router.delete("/favorites/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(listing_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> None:
    """Remove a listing from the current user's wishlist."""
    existing = db.execute(
        select(Favorite).where(Favorite.user_id == current_user.id, Favorite.listing_id == listing_id)
    ).scalar_one_or_none()
    if existing is not None:
        db.delete(existing)
        db.commit()


@router.get("/users/me/favorites", response_model=list[ListingCardOut])
def my_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[ListingCardOut]:
    """Listings the current user has favorited."""
    stmt = (
        select(Listing)
        .join(Favorite, Favorite.listing_id == Listing.id)
        .options(selectinload(Listing.photos), selectinload(Listing.host), selectinload(Listing.amenity_links).selectinload(ListingAmenity.amenity))
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )
    listings = db.execute(stmt).unique().scalars().all()
    listing_ids = [listing.id for listing in listings]
    rating_map = get_rating_map(db, listing_ids)
    return [to_card(listing, *rating_map.get(listing.id, (0.0, 0)), True) for listing in listings]

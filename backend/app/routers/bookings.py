"""Booking creation, cancellation, and the guest's "My Trips" list."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import Booking, BookingStatus, Listing, Review, User
from app.schemas.schemas import BookingCreate, BookingOut, BookingWithListingOut
from app.services.availability import has_overlap
from app.services.pricing import calculate_total_price

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> BookingOut:
    """Book a date range for a listing, rejecting overlaps and invalid input."""
    if payload.check_in >= payload.check_out:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")
    if payload.check_in < date.today():
        raise HTTPException(status_code=400, detail="check_in cannot be in the past")

    listing = db.get(Listing, payload.listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id == current_user.id:
        raise HTTPException(status_code=400, detail="Hosts cannot book their own listing")
    if payload.num_guests > listing.max_guests:
        raise HTTPException(status_code=400, detail=f"This listing sleeps at most {listing.max_guests} guests")
    if has_overlap(db, listing.id, payload.check_in, payload.check_out):
        raise HTTPException(status_code=409, detail="Listing is not available for the selected dates")

    total_price = calculate_total_price(listing, payload.check_in, payload.check_out)
    booking = Booking(
        listing_id=listing.id,
        guest_id=current_user.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        num_guests=payload.num_guests,
        total_price=total_price,
        status=BookingStatus.CONFIRMED,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/me", response_model=list[BookingWithListingOut])
def my_trips(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[BookingWithListingOut]:
    """All bookings made by the current user, most recent first."""
    stmt = (
        select(Booking)
        .options(selectinload(Booking.listing).selectinload(Listing.photos), selectinload(Booking.review))
        .where(Booking.guest_id == current_user.id)
        .order_by(Booking.check_in.desc())
    )
    bookings = db.execute(stmt).unique().scalars().all()

    results = []
    for booking in bookings:
        cover = booking.listing.photos[0].url if booking.listing.photos else None
        can_review = (
            booking.status == BookingStatus.CONFIRMED
            and booking.check_out < date.today()
            and booking.review is None
        )
        results.append(
            BookingWithListingOut(
                **BookingOut.model_validate(booking).model_dump(),
                listing_title=booking.listing.title,
                listing_city=booking.listing.city,
                listing_country=booking.listing.country,
                cover_photo_url=cover,
                can_review=can_review,
                has_reviewed=booking.review is not None,
            )
        )
    return results


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> BookingOut:
    """Cancel a booking owned by the current user, freeing its dates."""
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
    booking.status = BookingStatus.CANCELLED
    db.commit()
    db.refresh(booking)
    return booking

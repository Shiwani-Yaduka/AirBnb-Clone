"""Reviews: read a listing's reviews, and leave one after a completed stay."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import Booking, BookingStatus, Review, ReviewPhoto, User
from app.schemas.schemas import ReviewCreate, ReviewOut

router = APIRouter(tags=["reviews"])


@router.get("/listings/{listing_id}/reviews", response_model=list[ReviewOut])
def list_reviews(listing_id: int, db: Session = Depends(get_db)) -> list[ReviewOut]:
    """All reviews for a listing, most recent first."""
    stmt = (
        select(Review)
        .options(selectinload(Review.guest), selectinload(Review.photos))
        .where(Review.listing_id == listing_id)
        .order_by(Review.created_at.desc())
    )
    reviews = db.execute(stmt).unique().scalars().all()
    return [
        ReviewOut(
            id=r.id,
            listing_id=r.listing_id,
            guest_id=r.guest_id,
            guest_name=r.guest.name,
            guest_avatar_url=r.guest.avatar_url,
            rating=r.rating,
            comment=r.comment,
            photo_urls=[p.url for p in r.photos],
            created_at=r.created_at,
        )
        for r in reviews
    ]


@router.post("/bookings/{booking_id}/review", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def leave_review(
    booking_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReviewOut:
    """Leave a review for a completed stay (one review per booking)."""
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
    if booking.status != BookingStatus.CONFIRMED or booking.check_out >= date.today():
        raise HTTPException(status_code=400, detail="You can only review completed stays")
    if booking.review is not None:
        raise HTTPException(status_code=409, detail="You already reviewed this stay")

    review = Review(
        listing_id=booking.listing_id,
        booking_id=booking.id,
        guest_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
        photos=[ReviewPhoto(url=url, sort_order=i) for i, url in enumerate(payload.photo_urls)],
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewOut(
        id=review.id,
        listing_id=review.listing_id,
        guest_id=review.guest_id,
        guest_name=current_user.name,
        guest_avatar_url=current_user.avatar_url,
        rating=review.rating,
        comment=review.comment,
        photo_urls=[p.url for p in review.photos],
        created_at=review.created_at,
    )

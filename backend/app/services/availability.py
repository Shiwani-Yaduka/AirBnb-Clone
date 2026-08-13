"""Booking-date overlap checks and blocked-range lookups."""
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import Booking, BookingStatus


def has_overlap(db: Session, listing_id: int, check_in: date, check_out: date, exclude_booking_id: int | None = None) -> bool:
    """True if [check_in, check_out) overlaps any confirmed booking for the listing."""
    stmt = select(Booking).where(
        Booking.listing_id == listing_id,
        Booking.status == BookingStatus.CONFIRMED,
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    )
    if exclude_booking_id is not None:
        stmt = stmt.where(Booking.id != exclude_booking_id)
    return db.execute(stmt).first() is not None


def get_blocked_ranges(db: Session, listing_id: int) -> list[Booking]:
    """All confirmed future/current bookings that block dates on a listing."""
    stmt = select(Booking).where(
        Booking.listing_id == listing_id,
        Booking.status == BookingStatus.CONFIRMED,
    )
    return list(db.execute(stmt).scalars().all())

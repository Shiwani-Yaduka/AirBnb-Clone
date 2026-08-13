"""Assemble Listing ORM objects into API response schemas (rating, cover photo, favorites)."""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.models import Favorite, Listing, Review
from app.schemas.schemas import ListingCardOut, ListingDetailOut


def get_rating_map(db: Session, listing_ids: list[int]) -> dict[int, tuple[float, int]]:
    """listing_id -> (average_rating, review_count) for the given listings."""
    if not listing_ids:
        return {}
    stmt = (
        select(Review.listing_id, func.avg(Review.rating), func.count(Review.id))
        .where(Review.listing_id.in_(listing_ids))
        .group_by(Review.listing_id)
    )
    return {row[0]: (round(float(row[1]), 2), row[2]) for row in db.execute(stmt).all()}


def get_favorited_ids(db: Session, user_id: int | None, listing_ids: list[int]) -> set[int]:
    """Set of listing_ids the user has favorited, empty if not logged in."""
    if user_id is None or not listing_ids:
        return set()
    stmt = select(Favorite.listing_id).where(
        Favorite.user_id == user_id, Favorite.listing_id.in_(listing_ids)
    )
    return set(db.execute(stmt).scalars().all())


def to_card(listing: Listing, rating: float, review_count: int, is_favorited: bool) -> ListingCardOut:
    cover = listing.photos[0].url if listing.photos else None
    return ListingCardOut(
        id=listing.id,
        title=listing.title,
        city=listing.city,
        country=listing.country,
        property_type=listing.property_type,
        category=listing.category,
        price_per_night=listing.price_per_night,
        cover_photo_url=cover,
        rating=rating,
        review_count=review_count,
        is_favorited=is_favorited,
    )


def to_detail(listing: Listing, rating: float, review_count: int, is_favorited: bool) -> ListingDetailOut:
    return ListingDetailOut(
        id=listing.id,
        host=listing.host,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        category=listing.category,
        address=listing.address,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        latitude=listing.latitude,
        longitude=listing.longitude,
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        service_fee_rate=listing.service_fee_rate,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        created_at=listing.created_at,
        photos=listing.photos,
        amenities=[link.amenity for link in listing.amenity_links],
        rating=rating,
        review_count=review_count,
        is_favorited=is_favorited,
    )

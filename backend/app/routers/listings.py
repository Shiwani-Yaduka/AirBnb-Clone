"""Search/browse, detail, and host CRUD endpoints for listings."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.core.deps import get_current_user, get_optional_user
from app.models.models import (
    Amenity,
    Booking,
    BookingStatus,
    Category,
    Listing,
    ListingAmenity,
    ListingPhoto,
    ListingType,
    PropertyType,
    User,
)
from app.schemas.schemas import (
    ListingCitySection,
    ListingCreate,
    ListingDetailOut,
    ListingSearchResult,
    ListingUpdate,
)
from app.services.listing_view import get_favorited_ids, get_rating_map, to_card, to_detail

router = APIRouter(prefix="/listings", tags=["listings"])

LISTING_LOAD_OPTIONS = (selectinload(Listing.photos), selectinload(Listing.host), selectinload(Listing.amenity_links).selectinload(ListingAmenity.amenity))


@router.get("", response_model=ListingSearchResult)
def search_listings(
    listing_type: ListingType | None = None,
    location: str | None = Query(default=None, description="Matches city, state, or country"),
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = Query(default=None, gt=0),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    property_type: PropertyType | None = None,
    category: Category | None = None,
    amenity_ids: list[int] = Query(default=[]),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> ListingSearchResult:
    """Browse/search listings with location, date, guest, price, type, category, and amenity filters."""
    if check_in and check_out and check_in >= check_out:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")

    stmt = select(Listing).options(*LISTING_LOAD_OPTIONS)

    stmt = stmt.where(Listing.listing_type == (listing_type or ListingType.HOME))
    if location:
        like = f"%{location.lower()}%"
        stmt = stmt.where(
            (Listing.city.ilike(like)) | (Listing.state.ilike(like)) | (Listing.country.ilike(like))
        )
    if guests:
        stmt = stmt.where(Listing.max_guests >= guests)
    if min_price is not None:
        stmt = stmt.where(Listing.price_per_night >= min_price)
    if max_price is not None:
        stmt = stmt.where(Listing.price_per_night <= max_price)
    if property_type:
        stmt = stmt.where(Listing.property_type == property_type)
    if category:
        stmt = stmt.where(Listing.category == category)
    for amenity_id in amenity_ids:
        stmt = stmt.where(
            Listing.id.in_(select(ListingAmenity.listing_id).where(ListingAmenity.amenity_id == amenity_id))
        )
    if check_in and check_out:
        overlapping = select(Booking.listing_id).where(
            Booking.status == BookingStatus.CONFIRMED,
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
        stmt = stmt.where(Listing.id.not_in(overlapping))

    all_matches = list(db.execute(stmt.order_by(Listing.created_at.desc())).unique().scalars().all())
    total = len(all_matches)
    start = (page - 1) * page_size
    page_items = all_matches[start : start + page_size]

    listing_ids = [listing.id for listing in page_items]
    rating_map = get_rating_map(db, listing_ids)
    favorited_ids = get_favorited_ids(db, current_user.id if current_user else None, listing_ids)

    items = [
        to_card(listing, *rating_map.get(listing.id, (0.0, 0)), listing.id in favorited_ids)
        for listing in page_items
    ]
    return ListingSearchResult(items=items, total=total, page=page, page_size=page_size)


@router.get("/home-sections", response_model=list[ListingCitySection])
def home_sections(
    listing_type: ListingType | None = None,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> list[ListingCitySection]:
    """Curated homepage rows: one carousel per city that has enough listings to fill a row."""
    MIN_PER_CITY = 5
    MAX_PER_CITY = 8

    stmt = (
        select(Listing)
        .options(*LISTING_LOAD_OPTIONS)
        .where(Listing.listing_type == (listing_type or ListingType.HOME))
        .order_by(Listing.created_at.desc())
    )
    all_listings = list(db.execute(stmt).unique().scalars().all())

    by_city: dict[tuple[str, str], list[Listing]] = {}
    for listing in all_listings:
        by_city.setdefault((listing.city, listing.country), []).append(listing)

    listing_ids = [listing.id for listing in all_listings]
    rating_map = get_rating_map(db, listing_ids)
    favorited_ids = get_favorited_ids(db, current_user.id if current_user else None, listing_ids)

    sections: list[ListingCitySection] = []
    for (city, country), city_listings in by_city.items():
        if len(city_listings) < MIN_PER_CITY:
            continue
        cards = [
            to_card(listing, *rating_map.get(listing.id, (0.0, 0)), listing.id in favorited_ids)
            for listing in city_listings[:MAX_PER_CITY]
        ]
        sections.append(ListingCitySection(city=city, country=country, listings=cards))

    return sections


@router.get("/{listing_id}", response_model=ListingDetailOut)
def get_listing(
    listing_id: int, db: Session = Depends(get_db), current_user: User | None = Depends(get_optional_user)
) -> ListingDetailOut:
    """Full detail for a single listing."""
    listing = db.execute(
        select(Listing).options(*LISTING_LOAD_OPTIONS).where(Listing.id == listing_id)
    ).unique().scalar_one_or_none()
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    rating, review_count = get_rating_map(db, [listing_id]).get(listing_id, (0.0, 0))
    is_favorited = listing_id in get_favorited_ids(db, current_user.id if current_user else None, [listing_id])
    return to_detail(listing, rating, review_count, is_favorited)


@router.get("/{listing_id}/availability")
def get_availability(listing_id: int, db: Session = Depends(get_db)) -> dict:
    """Blocked date ranges for a listing's calendar (from confirmed bookings)."""
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    stmt = select(Booking.check_in, Booking.check_out).where(
        Booking.listing_id == listing_id, Booking.status == BookingStatus.CONFIRMED
    )
    ranges = [{"check_in": row[0], "check_out": row[1]} for row in db.execute(stmt).all()]
    return {"booked_ranges": ranges}


def _apply_amenities(db: Session, listing: Listing, amenity_ids: list[int]) -> None:
    if amenity_ids:
        found = db.execute(select(Amenity.id).where(Amenity.id.in_(amenity_ids))).scalars().all()
        missing = set(amenity_ids) - set(found)
        if missing:
            raise HTTPException(status_code=400, detail=f"Unknown amenity ids: {sorted(missing)}")
    listing.amenity_links = [ListingAmenity(amenity_id=aid) for aid in amenity_ids]


@router.post("", response_model=ListingDetailOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> ListingDetailOut:
    """Create a new listing owned by the current user."""
    data = payload.model_dump(exclude={"photo_urls", "amenity_ids"})
    listing = Listing(host_id=current_user.id, **data)
    listing.photos = [ListingPhoto(url=url, sort_order=i) for i, url in enumerate(payload.photo_urls)]
    _apply_amenities(db, listing, payload.amenity_ids)

    db.add(listing)
    db.commit()
    db.refresh(listing)
    listing = db.execute(
        select(Listing).options(*LISTING_LOAD_OPTIONS).where(Listing.id == listing.id)
    ).unique().scalar_one()
    return to_detail(listing, 0.0, 0, False)


def _get_owned_listing(db: Session, listing_id: int, current_user: User) -> Listing:
    listing = db.execute(
        select(Listing).options(*LISTING_LOAD_OPTIONS).where(Listing.id == listing_id)
    ).unique().scalar_one_or_none()
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this listing")
    return listing


@router.put("/{listing_id}", response_model=ListingDetailOut)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ListingDetailOut:
    """Edit a listing owned by the current user."""
    listing = _get_owned_listing(db, listing_id, current_user)

    for field, value in payload.model_dump(exclude={"photo_urls", "amenity_ids"}).items():
        setattr(listing, field, value)
    listing.photos = [ListingPhoto(url=url, sort_order=i) for i, url in enumerate(payload.photo_urls)]
    _apply_amenities(db, listing, payload.amenity_ids)

    db.commit()
    db.refresh(listing)
    listing = db.execute(
        select(Listing).options(*LISTING_LOAD_OPTIONS).where(Listing.id == listing.id)
    ).unique().scalar_one()
    rating, review_count = get_rating_map(db, [listing_id]).get(listing_id, (0.0, 0))
    return to_detail(listing, rating, review_count, False)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> None:
    """Delete a listing owned by the current user."""
    listing = _get_owned_listing(db, listing_id, current_user)
    db.delete(listing)
    db.commit()

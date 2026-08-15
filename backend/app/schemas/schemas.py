"""Pydantic request/response schemas for the API."""
from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.models import BookingStatus, Category, ListingType, PropertyType

# ---------- Auth / Users ----------
# Signup/login are handled by Clerk on the frontend; UserOut is the local,
# Clerk-synced profile returned by GET /auth/me and embedded elsewhere.


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    avatar_url: str | None
    bio: str | None
    is_host: bool
    is_superhost: bool
    created_at: datetime


# ---------- Amenities ----------


class AmenityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon_key: str


# ---------- Listing photos ----------


class ListingPhotoIn(BaseModel):
    url: str
    sort_order: int = 0


class ListingPhotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    sort_order: int


# ---------- Listings ----------


class ListingBase(BaseModel):
    listing_type: ListingType = ListingType.HOME
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    property_type: PropertyType
    category: Category
    address: str
    city: str
    state: str | None = None
    country: str
    latitude: float
    longitude: float
    price_per_night: float = Field(gt=0)
    cleaning_fee: float = Field(ge=0, default=0)
    service_fee_rate: float = Field(ge=0, le=1, default=0.12)
    max_guests: int = Field(gt=0)
    bedrooms: int = Field(ge=0)
    beds: int = Field(ge=0)
    bathrooms: float = Field(ge=0)


class ListingCreate(ListingBase):
    photo_urls: list[str] = Field(min_length=1)
    amenity_ids: list[int] = []


class ListingUpdate(ListingBase):
    photo_urls: list[str] = Field(min_length=1)
    amenity_ids: list[int] = []


class HostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    avatar_url: str | None
    bio: str | None
    is_superhost: bool
    created_at: datetime


class ListingCardOut(BaseModel):
    """Compact listing shape used in grid/search results."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_type: ListingType
    title: str
    city: str
    country: str
    property_type: PropertyType
    category: Category
    latitude: float
    longitude: float
    price_per_night: float
    cover_photo_url: str | None
    rating: float
    review_count: int
    is_favorited: bool = False


class ListingDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_type: ListingType
    host: HostOut
    title: str
    description: str
    property_type: PropertyType
    category: Category
    address: str
    city: str
    state: str | None
    country: str
    latitude: float
    longitude: float
    price_per_night: float
    cleaning_fee: float
    service_fee_rate: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    created_at: datetime
    photos: list[ListingPhotoOut]
    amenities: list[AmenityOut]
    rating: float
    review_count: int
    is_favorited: bool = False


class ListingSearchResult(BaseModel):
    items: list[ListingCardOut]
    total: int
    page: int
    page_size: int


class ListingCitySection(BaseModel):
    """One horizontally-scrollable row of listings for a single city, for the homepage."""

    city: str
    country: str
    listings: list[ListingCardOut]


# ---------- Bookings ----------


class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    num_guests: int = Field(gt=0)


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    num_guests: int
    total_price: float
    status: BookingStatus
    created_at: datetime


class BookingWithListingOut(BookingOut):
    listing_title: str
    listing_city: str
    listing_country: str
    cover_photo_url: str | None
    can_review: bool = False
    has_reviewed: bool = False


class BookingWithGuestOut(BookingOut):
    guest_name: str
    guest_avatar_url: str | None


class AvailabilityOut(BaseModel):
    booked_ranges: list[dict[str, date]]


# ---------- Reviews ----------


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=2000)
    photo_urls: list[str] = []


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    guest_id: int
    guest_name: str
    guest_avatar_url: str | None
    rating: int
    comment: str
    photo_urls: list[str]
    created_at: datetime

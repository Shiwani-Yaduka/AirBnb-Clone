"""Seed the database with demo users, listings, photos, amenities, bookings, and reviews.

Run with: venv/Scripts/python.exe -m app.seed
"""
import random
from datetime import date, timedelta

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.models import (
    Amenity,
    Booking,
    BookingStatus,
    Category,
    Listing,
    ListingAmenity,
    ListingPhoto,
    PropertyType,
    Review,
    User,
)

random.seed(42)


def _unsplash(photo_id: str, w: int = 1200) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w={w}&q=80&auto=format&fit=crop"


PROPERTY_PHOTO_IDS = [
    "1502672260266-1c1ef2d93688", "1493809842364-78817add7ffb", "1560448204-e02f11c3d0e2",
    "1522708323590-d24dbb6b0267", "1600585154340-be6161a56a0c", "1571003123894-1f0594d2b5d9",
    "1484154218962-a197022b5858", "1512917774080-9991f1c4c750", "1568605114967-8130f3a36994",
    "1505691938895-1758d7feb511", "1484101403633-562f891dc89a", "1523217582562-09d0def993a6",
    "1512918728675-ed5a9ecdebfd", "1449844908441-8829872d2607", "1554995207-c18c203602cb",
    "1560185127-6ed189bf02f4", "1615874959474-d609969a20ed", "1580587771525-78b9dba3b914",
    "1631049307264-da0ec9d70304", "1598928506311-c55ded91a20c", "1584622650111-993a426fbf0a",
    "1600607687939-ce8a6c25118c", "1583847268964-b28dc8f51f92", "1591474200742-8e512e6f98f8",
    "1519710164239-da123dc03ef4", "1499793983690-e29da59ef1c2", "1519643381401-22c77e60520e",
    "1502005229762-cf1b2da7c5d6", "1470770903676-69b98201ea1c", "1502920917128-1aa500764cbd",
    "1567767292278-a4f21aa2d36e", "1595877244574-e90ce41ce089", "1544984243-ec57ea16fe25",
    "1600566753086-00f18fb6b3ea",
]

AVATAR_PHOTO_IDS = [
    "1472099645785-5658abf4ff4e", "1438761681033-6461ffad8d80", "1494790108377-be9c29b29330",
    "1500648767791-00dcc994a43e", "1544005313-94ddf0286df2", "1519085360753-af0119f7cbe7",
    "1508214751196-bcfd4ca60f91", "1547425260-76bcadfb4f2c",
]

AMENITIES = [
    ("Wifi", "wifi"), ("Kitchen", "kitchen"), ("Free parking", "parking"),
    ("Air conditioning", "ac"), ("Pool", "pool"), ("Hot tub", "hot_tub"),
    ("Washer", "washer"), ("Dryer", "dryer"), ("TV", "tv"), ("Heating", "heating"),
    ("Dedicated workspace", "workspace"), ("Fireplace", "fireplace"), ("Gym", "gym"),
    ("EV charger", "ev_charger"), ("BBQ grill", "bbq"), ("Beach access", "beach"),
    ("Pets allowed", "pets"), ("Breakfast included", "breakfast"), ("Ski-in/Ski-out", "ski"),
    ("Waterfront", "waterfront"),
]

HOSTS = [
    ("Maria Gonzalez", "maria@example.com"),
    ("James Chen", "james@example.com"),
    ("Aisha Khan", "aisha@example.com"),
    ("Lucas Martin", "lucas@example.com"),
    ("Sophie Dubois", "sophie@example.com"),
    ("Ravi Patel", "ravi@example.com"),
]

GUESTS = [
    ("Emma Wilson", "emma@example.com"),
    ("Noah Johnson", "noah@example.com"),
]

CITIES = [
    ("Austin", "TX", "USA", 30.2672, -97.7431),
    ("New York", "NY", "USA", 40.7128, -74.0060),
    ("Malibu", "CA", "USA", 34.0259, -118.7798),
    ("Paris", None, "France", 48.8566, 2.3522),
    ("Tokyo", None, "Japan", 35.6762, 139.6503),
    ("Ubud", "Bali", "Indonesia", -8.5069, 115.2625),
    ("Aspen", "CO", "USA", 39.1911, -106.8175),
    ("Lake Tahoe", "CA", "USA", 39.0968, -120.0324),
    ("Miami", "FL", "USA", 25.7617, -80.1918),
    ("London", None, "United Kingdom", 51.5072, -0.1276),
    ("Joshua Tree", "CA", "USA", 34.1347, -116.3131),
    ("Nashville", "TN", "USA", 36.1627, -86.7816),
]

TITLE_TEMPLATES = [
    "Sunlit {ptype} in the heart of {city}",
    "Modern {ptype} with stunning views near {city}",
    "Cozy {ptype} retreat in {city}",
    "Designer {ptype} steps from {city} center",
    "Charming {ptype} getaway in {city}",
    "Stylish {ptype} perfect for exploring {city}",
]

DESCRIPTION = (
    "Escape to this beautifully appointed space, thoughtfully designed for comfort and "
    "convenience. Enjoy easy access to local attractions, restaurants, and outdoor "
    "activities. Perfect for couples, families, or small groups looking for a memorable "
    "stay. The space is kept immaculately clean and is fully equipped with everything "
    "you need for a relaxing visit."
)


def seed(force: bool = False) -> None:
    """Seed demo data. Safe to call on every boot: no-ops if data already exists,
    unless force=True (used for local resets), since this must never wipe real
    bookings/listings created by users in a deployed environment."""
    Base.metadata.create_all(bind=engine)

    probe_db = SessionLocal()
    try:
        has_data = probe_db.query(User).first() is not None
    finally:
        probe_db.close()

    if has_data and not force:
        print("Database already has data - skipping seed (pass --force to reset).")
        return

    if force:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        amenities = [Amenity(name=name, icon_key=icon) for name, icon in AMENITIES]
        db.add_all(amenities)
        db.commit()

        users: list[User] = []
        for i, (name, email) in enumerate(HOSTS + GUESTS):
            user = User(
                name=name,
                email=email,
                hashed_password=hash_password("password123"),
                avatar_url=_unsplash(AVATAR_PHOTO_IDS[i % len(AVATAR_PHOTO_IDS)], w=200),
                bio=f"Hi, I'm {name.split()[0]}! Happy to help make your stay memorable.",
                is_superhost=i < 3,
            )
            users.append(user)
        db.add_all(users)
        db.commit()

        hosts = users[: len(HOSTS)]

        property_types = list(PropertyType)
        categories = list(Category)

        listings: list[Listing] = []
        for i in range(28):
            host = hosts[i % len(hosts)]
            city, state, country, lat, lng = CITIES[i % len(CITIES)]
            ptype = property_types[i % len(property_types)]
            category = categories[i % len(categories)]
            title = random.choice(TITLE_TEMPLATES).format(ptype=ptype.value.title(), city=city)

            listing = Listing(
                host_id=host.id,
                title=title,
                description=DESCRIPTION,
                property_type=ptype,
                category=category,
                address=f"{100 + i} {random.choice(['Main St', 'Ocean Ave', 'Park Rd', 'Hilltop Ln'])}",
                city=city,
                state=state,
                country=country,
                latitude=lat + random.uniform(-0.03, 0.03),
                longitude=lng + random.uniform(-0.03, 0.03),
                price_per_night=round(random.uniform(75, 650), 0),
                cleaning_fee=round(random.uniform(20, 90), 0),
                service_fee_rate=0.12,
                max_guests=random.randint(2, 8),
                bedrooms=random.randint(1, 4),
                beds=random.randint(1, 5),
                bathrooms=random.choice([1, 1.5, 2, 2.5, 3]),
            )
            photo_ids = random.sample(PROPERTY_PHOTO_IDS, k=6)
            listing.photos = [ListingPhoto(url=_unsplash(pid), sort_order=j) for j, pid in enumerate(photo_ids)]
            chosen_amenities = random.sample(amenities, k=random.randint(5, 10))
            listing.amenity_links = [ListingAmenity(amenity_id=a.id) for a in chosen_amenities]

            listings.append(listing)

        db.add_all(listings)
        db.commit()

        all_guests = users  # any seeded user can act as a guest on someone else's listing
        today = date.today()
        bookings: list[Booking] = []

        for listing in listings:
            possible_guests = [u for u in all_guests if u.id != listing.host_id]

            # One completed past stay (eligible for a review) on ~70% of listings
            if random.random() < 0.7:
                guest = random.choice(possible_guests)
                nights = random.randint(2, 6)
                start_offset = random.randint(20, 90)
                check_in = today - timedelta(days=start_offset)
                check_out = check_in + timedelta(days=nights)
                total = nights * listing.price_per_night + listing.cleaning_fee
                total += total * listing.service_fee_rate
                booking = Booking(
                    listing_id=listing.id,
                    guest_id=guest.id,
                    check_in=check_in,
                    check_out=check_out,
                    num_guests=random.randint(1, listing.max_guests),
                    total_price=round(total, 2),
                    status=BookingStatus.CONFIRMED,
                )
                bookings.append(booking)

            # One upcoming confirmed booking on ~50% of listings (blocks those dates)
            if random.random() < 0.5:
                guest = random.choice(possible_guests)
                nights = random.randint(2, 5)
                start_offset = random.randint(10, 60)
                check_in = today + timedelta(days=start_offset)
                check_out = check_in + timedelta(days=nights)
                total = nights * listing.price_per_night + listing.cleaning_fee
                total += total * listing.service_fee_rate
                bookings.append(
                    Booking(
                        listing_id=listing.id,
                        guest_id=guest.id,
                        check_in=check_in,
                        check_out=check_out,
                        num_guests=random.randint(1, listing.max_guests),
                        total_price=round(total, 2),
                        status=BookingStatus.CONFIRMED,
                    )
                )

        db.add_all(bookings)
        db.commit()

        review_comments = [
            "Absolutely wonderful stay! The place was spotless and exactly as pictured.",
            "Great location and a super responsive host. Would book again.",
            "Beautiful space, comfortable beds, and quiet neighborhood. Loved it.",
            "Everything we needed was provided. Check-in was seamless.",
            "A bit smaller than expected but very clean and well located.",
            "Host went above and beyond to make our trip special. Highly recommend!",
            "Perfect for our group. Great amenities and beautiful views.",
        ]

        for booking in bookings:
            if booking.check_out < today and random.random() < 0.8:
                db.add(
                    Review(
                        listing_id=booking.listing_id,
                        booking_id=booking.id,
                        guest_id=booking.guest_id,
                        rating=random.choice([4, 4, 5, 5, 5, 3]),
                        comment=random.choice(review_comments),
                    )
                )
        db.commit()

        print(f"Seeded {len(users)} users, {len(listings)} listings, {len(bookings)} bookings.")
        print("All seeded users have password: password123")
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    seed(force="--force" in sys.argv)

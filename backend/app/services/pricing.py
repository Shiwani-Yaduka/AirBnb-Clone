"""Price breakdown calculation for a stay."""
from datetime import date

from app.models.models import Listing


def calculate_total_price(listing: Listing, check_in: date, check_out: date) -> float:
    """nights * nightly_rate + cleaning_fee + service_fee, rounded to cents."""
    nights = (check_out - check_in).days
    subtotal = nights * listing.price_per_night
    service_fee = subtotal * listing.service_fee_rate
    total = subtotal + listing.cleaning_fee + service_fee
    return round(total, 2)

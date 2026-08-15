export type ListingType = "home" | "experience" | "service";

export type PropertyType =
  | "house"
  | "apartment"
  | "guesthouse"
  | "hotel"
  | "cabin"
  | "villa"
  | "loft"
  | "treehouse";

export type Category =
  | "amazing_views"
  | "beachfront"
  | "cabins"
  | "tiny_homes"
  | "trending"
  | "countryside"
  | "luxe"
  | "lakefront"
  | "rooms"
  | "design";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  is_host: boolean;
  is_superhost: boolean;
  created_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon_key: string;
}

export interface ListingPhoto {
  id: number;
  url: string;
  sort_order: number;
}

export interface ListingCard {
  id: number;
  listing_type: ListingType;
  title: string;
  city: string;
  country: string;
  property_type: PropertyType;
  category: Category;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cover_photo_url: string | null;
  rating: number;
  review_count: number;
  is_favorited: boolean;
}

export interface Host {
  id: number;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  is_superhost: boolean;
  created_at: string;
}

export interface ListingDetail {
  id: number;
  listing_type: ListingType;
  host: Host;
  title: string;
  description: string;
  property_type: PropertyType;
  category: Category;
  address: string;
  city: string;
  state: string | null;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_rate: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  created_at: string;
  photos: ListingPhoto[];
  amenities: Amenity[];
  rating: number;
  review_count: number;
  is_favorited: boolean;
}

export interface ListingSearchResult {
  items: ListingCard[];
  total: number;
  page: number;
  page_size: number;
}

export interface CitySection {
  city: string;
  country: string;
  listings: ListingCard[];
}

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price: number;
  status: BookingStatus;
  created_at: string;
}

export interface BookingWithListing extends Booking {
  listing_title: string;
  listing_city: string;
  listing_country: string;
  cover_photo_url: string | null;
  can_review: boolean;
  has_reviewed: boolean;
}

export interface BookingWithGuest extends Booking {
  guest_name: string;
  guest_avatar_url: string | null;
}

export interface Review {
  id: number;
  listing_id: number;
  guest_id: number;
  guest_name: string;
  guest_avatar_url: string | null;
  rating: number;
  comment: string;
  photo_urls: string[];
  created_at: string;
}

export interface BookedRange {
  check_in: string;
  check_out: string;
}

export interface ListingFormInput {
  title: string;
  description: string;
  property_type: PropertyType;
  category: Category;
  address: string;
  city: string;
  state: string | null;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_rate: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  photo_urls: string[];
  amenity_ids: number[];
}

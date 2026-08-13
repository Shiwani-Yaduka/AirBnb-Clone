import type {
  Amenity,
  BookedRange,
  Booking,
  BookingWithGuest,
  BookingWithListing,
  ListingCard,
  ListingDetail,
  ListingFormInput,
  ListingSearchResult,
  Review,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(res.status, typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------- Auth ----------

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    request<{ user: User; access_token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ user: User; access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<User | null>("/auth/me"),
};

// ---------- Listings ----------

export interface ListingSearchParams {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  category?: string;
  amenity_ids?: number[];
  page?: number;
  page_size?: number;
}

function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const listingsApi = {
  search: (params: ListingSearchParams) =>
    request<ListingSearchResult>(`/listings${buildQuery(params)}`),
  get: (id: number) => request<ListingDetail>(`/listings/${id}`),
  availability: (id: number) =>
    request<{ booked_ranges: BookedRange[] }>(`/listings/${id}/availability`),
  create: (payload: ListingFormInput) =>
    request<ListingDetail>("/listings", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number, payload: ListingFormInput) =>
    request<ListingDetail>(`/listings/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number) => request<void>(`/listings/${id}`, { method: "DELETE" }),
  reviews: (id: number) => request<Review[]>(`/listings/${id}/reviews`),
  bookingsForListing: (id: number) => request<BookingWithGuest[]>(`/listings/${id}/bookings`),
};

// ---------- Bookings ----------

export const bookingsApi = {
  create: (listing_id: number, check_in: string, check_out: string, num_guests: number) =>
    request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify({ listing_id, check_in, check_out, num_guests }),
    }),
  myTrips: () => request<BookingWithListing[]>("/bookings/me"),
  cancel: (id: number) => request<Booking>(`/bookings/${id}/cancel`, { method: "PATCH" }),
  review: (bookingId: number, rating: number, comment: string) =>
    request<Review>(`/bookings/${bookingId}/review`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    }),
};

// ---------- Users / host / favorites ----------

export const usersApi = {
  myListings: () => request<ListingCard[]>("/users/me/listings"),
  myFavorites: () => request<ListingCard[]>("/users/me/favorites"),
  addFavorite: (listingId: number) => request<void>(`/favorites/${listingId}`, { method: "POST" }),
  removeFavorite: (listingId: number) => request<void>(`/favorites/${listingId}`, { method: "DELETE" }),
};

// ---------- Amenities ----------

export const amenitiesApi = {
  list: () => request<Amenity[]>("/amenities"),
};

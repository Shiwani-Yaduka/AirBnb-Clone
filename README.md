# Airbnb Clone — Fullstack Assignment

A functional clone of the Airbnb web app: browse/search listings, view listing
details, book stays with date-range validation, manage bookings ("My Trips"),
and host your own listings (full CRUD) with a host dashboard. Built with
Next.js (TypeScript) on the frontend and FastAPI + SQLAlchemy + SQLite on the
backend.

> Not affiliated with Airbnb, Inc. Built for an educational fullstack
> assignment; all data is seeded/mocked.

## Tech stack

**Frontend** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
`react-day-picker` (date-range picker), `react-leaflet` + Leaflet/OpenStreetMap
(interactive map, no API key required).

**Backend** — FastAPI, SQLAlchemy 2.0 (ORM), Pydantic v2 (validation),
`python-jose` (JWT), `bcrypt` (password hashing), Uvicorn.

**Database** — SQLite, hand-designed schema (see below), seeded with a demo
dataset.

## Project structure

```
frontend/   Next.js app (App Router) — pages, components, API client
backend/    FastAPI app — models, schemas, routers, services, seed script
```

## Setup instructions

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
copy .env.example .env         # optional — sensible defaults are built in
python -m app.seed             # seeds demo users, listings, bookings, reviews
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000` (interactive docs at `/docs`).

### Frontend

```bash
cd frontend
npm install
copy .env.example .env.local   # NEXT_PUBLIC_API_URL, defaults to http://localhost:8000
npm run dev                    # runs on port 3001 (see note below)
```

Open `http://localhost:3001`.

> **Why port 3001?** `frontend/package.json`'s `dev` script pins the port to
> 3001 explicitly. Feel free to remove `-p 3001` and use the default 3000 —
> just make sure `backend/app/core/config.py`'s `cors_origins` includes
> whatever port the frontend actually runs on (3000 and 3001 are both
> allowed out of the box).

### Demo accounts

All seeded users share the password `password123` (e.g. `maria@example.com`).
Any account can both book stays as a guest **and** list a property as a host —
there's no separate account type, matching how real Airbnb works (see
Assumptions below). You can also just sign up a fresh account from the UI.

## Architecture overview

- **Auth**: real signup/login forms; backend hashes passwords with bcrypt and
  issues a JWT in an `httpOnly` session cookie. No email verification (out of
  scope per the assignment). CORS is configured with `allow_credentials` so
  the cookie flows between the separately-hosted frontend/backend.
- **API client**: a single typed `frontend/src/lib/api.ts` wraps `fetch` with
  `credentials: "include"` for every request.
- **State**: React Context for auth (`auth-context.tsx`), the auth modal
  (`auth-modal-context.tsx`), and toasts (`toast-context.tsx`) — no external
  state library needed for an app this size.
- **Booking integrity**: date-range overlap checks happen server-side
  (`backend/app/services/availability.py`) using a half-open interval
  `[check_in, check_out)`, so a checkout day can equal another booking's
  check-in day (same-day turnover), matching real Airbnb behavior.
- **Pricing**: computed both server-side (source of truth, `services/pricing.py`)
  and mirrored client-side in the booking widget for the live price breakdown.
- **Photos**: no file-upload pipeline. Hosts pick from a curated set of
  verified-working stock photos or paste any image URL. Seed data uses the
  same curated set for a consistent, realistic look.

## Database schema

| Table | Key columns | Notes |
|---|---|---|
| `users` | name, email (unique), hashed_password, avatar_url, bio, is_superhost | No role column — hosting is a capability, not an account type |
| `listings` | host_id → users, title, description, property_type, category, address/city/state/country, latitude/longitude, price_per_night, cleaning_fee, service_fee_rate, max_guests, bedrooms, beds, bathrooms | |
| `listing_photos` | listing_id → listings, url, sort_order | One-to-many |
| `amenities` | name, icon_key | Fixed catalog, seeded |
| `listing_amenities` | listing_id, amenity_id | Many-to-many join table |
| `bookings` | listing_id → listings, guest_id → users, check_in, check_out, num_guests, total_price, status | `status`: confirmed / cancelled |
| `reviews` | listing_id, booking_id (unique, proves a completed stay), guest_id, rating, comment | One review per booking |
| `favorites` | user_id, listing_id | Unique on (user_id, listing_id); powers the wishlist |

Booking overlap and review-eligibility rules are enforced in the API layer,
not just the schema (e.g. a review requires `booking.check_out < today` and
no prior review on that booking).

## API overview

All endpoints are under the FastAPI app; see `/docs` for the full interactive
schema. Highlights:

- `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /listings` — search/filter (location, dates, guests, price range,
  property type, category, amenities) + pagination
- `GET /listings/{id}`, `GET /listings/{id}/availability`, `GET /listings/{id}/reviews`
- `POST /listings`, `PUT /listings/{id}`, `DELETE /listings/{id}` — owner-only
- `GET /users/me/listings` — host dashboard; `GET /listings/{id}/bookings` — owner-only
- `POST /bookings`, `GET /bookings/me`, `PATCH /bookings/{id}/cancel`
- `POST /bookings/{id}/review` — only for completed, unreviewed stays
- `POST /favorites/{listing_id}`, `DELETE /favorites/{listing_id}`, `GET /users/me/favorites`
- `GET /amenities`

## Feature checklist against the assignment

- ✅ Home/explore grid, search bar (location + dates + guests), category row,
  filter panel (price/type/amenities), pagination
- ✅ Listing detail: gallery, amenities, host info, availability calendar,
  price breakdown, reviews, interactive map
- ✅ Booking flow: date validation, no double-booking, summary + mocked
  checkout/confirmation, My Trips, bookings persist and block dates
- ✅ Host CRUD: create/edit/delete listings, host dashboard with bookings per
  listing, all data persists
- ✅ Guest vs host notion, wishlist/favorites, toasts, modals
- ✅ Bonus: leave a review after a completed stay, superhost badges

## Known limitations / out of scope

Per the assignment, these are intentionally mocked or left as placeholders:
real payment processing (a "Confirm and pay" checkout screen collects fake
card details, accepts anything, and never touches a real payment processor),
guest↔host messaging ("Contact host" shows a "coming soon" toast), identity
verification (not built), and image upload to cloud storage (photos are
URL-based instead — hosts pick from a curated set or paste any image URL).
The map on the explore/search grid is not interactive (only the listing-detail
map is) — that bonus item was left out for time, as was dark mode.

## Deployment

- **Frontend → Vercel**: import the repo, set the project's Root Directory to
  `frontend`, and set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- **Backend → Render**: `backend/render.yaml` + `backend/Dockerfile` define a
  Docker web service with a persistent disk mounted at `/data` (SQLite needs
  real disk, so a serverless host won't retain data). Set `CORS_ORIGINS` to
  your Vercel URL and redeploy. The seed script runs automatically on first
  boot only — it's idempotent and never overwrites existing data.
- Because the frontend and backend end up on different domains in production,
  the session cookie is issued as `SameSite=None; Secure` there (see
  `ENVIRONMENT=production` in `backend/core/config.py`); locally it's
  `SameSite=Lax` since `localhost:3001`/`localhost:8000` count as same-site.

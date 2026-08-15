"""FastAPI application entrypoint: CORS, router mounting, DB table creation."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine
from app.core.keep_alive import start_keep_alive
from app.routers import amenities, auth, bookings, listings, reviews, uploads, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Airbnb Clone API", version="1.0.0")
# Served at /media (not /uploads) so this static mount can't shadow the
# POST /uploads/review-photo API route — a mount claims its whole path prefix
# as a sub-app, and StaticFiles only answers GET/HEAD, so any collision here
# would 405 the upload endpoint instead of ever reaching the router.
app.mount("/media", StaticFiles(directory="uploads"), name="media")


@app.on_event("startup")
def _on_startup() -> None:
    start_keep_alive()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(users.router)
app.include_router(amenities.router)
app.include_router(uploads.router)


@app.get("/health")
def health() -> dict:
    """Liveness check."""
    return {"status": "ok"}

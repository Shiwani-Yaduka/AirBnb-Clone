"""FastAPI application entrypoint: CORS, router mounting, DB table creation."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.core.keep_alive import start_keep_alive
from app.routers import amenities, auth, bookings, listings, reviews, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Airbnb Clone API", version="1.0.0")


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


@app.get("/health")
def health() -> dict:
    """Liveness check."""
    return {"status": "ok"}

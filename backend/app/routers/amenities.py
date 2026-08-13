"""Read-only lookup of all available amenities (for filter UI and listing forms)."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Amenity
from app.schemas.schemas import AmenityOut

router = APIRouter(prefix="/amenities", tags=["amenities"])


@router.get("", response_model=list[AmenityOut])
def list_amenities(db: Session = Depends(get_db)) -> list[AmenityOut]:
    """All amenities, alphabetical."""
    stmt = select(Amenity).order_by(Amenity.name)
    return list(db.execute(stmt).scalars().all())

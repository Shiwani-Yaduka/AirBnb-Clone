"""File uploads: guest review photos, validated and stored on local disk."""
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status

from app.core.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_DIR = Path("uploads/reviews")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/review-photo", status_code=status.HTTP_201_CREATED)
async def upload_review_photo(
    request: Request, file: UploadFile, current_user: User = Depends(get_current_user)
) -> dict:
    """Upload a single review photo (jpeg/png/webp/gif, max 5MB); returns its servable URL."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WEBP, or GIF images are allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    ext = Path(file.filename or "").suffix.lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / filename).write_bytes(contents)

    url = f"{str(request.base_url).rstrip('/')}/media/reviews/{filename}"
    return {"url": url}

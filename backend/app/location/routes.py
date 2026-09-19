
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.location.schemas import LocationResponse
from app.location.services import get_full_location

router = APIRouter(
    prefix="/api",
    tags=["Location"],
)

@router.get(
    "/locations",
    response_model=list[LocationResponse],
    status_code=200,
)
def list_location(db: Session = Depends(get_db)):
    return get_full_location(db)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.waitlist.schemas import WaitlistCreate,WaitlistResponse
from app.waitlist.services import call_entry, create_entry, get_full_waitlist


router = APIRouter(
    prefix="/api",
    tags=["Waitlist"],
)


@router.get(
    "/locations/{location_id}/waitlist",
    response_model=list[WaitlistResponse],
    status_code=200,
)
def list_waitlist(
    location_id: int,
    db: Session = Depends(get_db),
):
    return get_full_waitlist(db, location_id)


@router.post(
    "/locations/{location_id}/waitlist",
    response_model=WaitlistResponse,
    status_code=201,
)
def join_waitlist(
    location_id: int,
    data: WaitlistCreate,
    db: Session = Depends(get_db),
):
    try:
        return create_entry(db, location_id, data)

    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch(
    "/waitlist/{entry_id}/call",
    response_model=WaitlistResponse,
)
def call_waitlist_entry(
    entry_id: int,
    db: Session = Depends(get_db),
):
    entry = call_entry(db, entry_id)

    if entry is None:
        raise HTTPException(
            status_code=409,
            detail="Entrada actualizada",
        )

    return entry
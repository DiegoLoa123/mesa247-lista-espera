from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.location.models import Location
from app.waitlist.models import WaitlistEntry
from app.waitlist.schemas import WaitlistCreate


def create_entry(
    db: Session,
    location_id: int,
    data: WaitlistCreate,
) -> WaitlistEntry:
    location = db.get(Location, location_id)

    if location is None:
        raise ValueError("Sucursal no encontrada")

    entry = WaitlistEntry(
        location_id=location_id,
        name=data.name,
        phone=data.phone,
        party_size=data.party_size,
        status="WAITING",
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_full_waitlist(
    db: Session,
    location_id: int,
) -> list[WaitlistEntry]:

    statement = (
        select(WaitlistEntry)
        .where(
            WaitlistEntry.location_id == location_id,
            #WaitlistEntry.status.in_(["WAITING", "CALLED"]),
        )
        .order_by(WaitlistEntry.created_at)
    )

    return list(db.scalars(statement).all())


def call_entry(
    db: Session,
    entry_id: int,
) -> WaitlistEntry | None:
    statement = (
        update(WaitlistEntry)
        .where(
            WaitlistEntry.id == entry_id,
            WaitlistEntry.status == "WAITING",
        )
        .values(
            status="CALLED",
            called_at=datetime.utcnow(),
        )
    )

    result = db.execute(statement)

    if result.rowcount == 0:
        db.rollback()
        return None

    db.commit()
    return db.get(WaitlistEntry, entry_id)
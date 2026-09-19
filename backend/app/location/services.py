from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.location.models import Location

def get_full_location(db: Session) -> list[Location]:
    statement = (
        select(Location)
        .order_by(Location.id)
    )

    return list(db.scalars(statement).all())
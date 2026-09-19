from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WaitlistEntry(Base):
    __tablename__ = "t_waitlist_entry"
    id: Mapped[int] = mapped_column( Integer, primary_key=True, autoincrement=True, )
    location_id: Mapped[int] = mapped_column( ForeignKey("t_location.id"), nullable=False, )

    name: Mapped[str] = mapped_column( String, nullable=False, )
    phone: Mapped[str] = mapped_column( String, nullable=False, )
    party_size: Mapped[int] = mapped_column( Integer, nullable=False, )
    status: Mapped[str] = mapped_column( String, nullable=False, default="WAITING", )
    created_at: Mapped[datetime] = mapped_column( nullable=False, default=datetime.utcnow, )
    called_at: Mapped[datetime | None] = mapped_column( nullable=True, )
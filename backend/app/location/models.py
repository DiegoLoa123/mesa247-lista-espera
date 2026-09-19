from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Location(Base):
    __tablename__ = "t_location"
    id: Mapped[int] = mapped_column( Integer, primary_key=True, autoincrement=True, )
    name: Mapped[str] = mapped_column( String, nullable=False, )
    country: Mapped[str] = mapped_column( String, nullable=False, )
    timezone: Mapped[str] = mapped_column( String, nullable=False, )
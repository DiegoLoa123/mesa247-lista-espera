from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class WaitlistCreate(BaseModel):
    name: str = Field( min_length=1, max_length=100, )
    phone: str = Field( min_length=3, max_length=20, )
    party_size: int = Field( ge=1, le=20, )


class WaitlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    location_id: int
    name: str
    phone: str
    party_size: int
    status: str
    created_at: datetime
    called_at: datetime | None
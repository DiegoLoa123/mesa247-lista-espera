from pydantic import BaseModel, ConfigDict, Field


class LocationCreate(BaseModel):
    name: str = Field( min_length=1, max_length=100, description="Nombre de la sucursal", )
    country: str = Field( min_length=2, max_length=50, description="País de la locación (ej. PE, MX, CL)", )
    timezone: str = Field( min_length=1, max_length=50, description="Zona horaria válida (ej. America/Lima)", )


class LocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    country: str
    timezone: str

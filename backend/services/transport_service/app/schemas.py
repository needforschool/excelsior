from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from typing import Dict

# TransportService schemas
class TransportBase(BaseModel):

    id_provider: int
    vehicle_type: str
    license_plate: str
    availabilities: Dict[str, Dict[str, bool]]

    @validator('vehicle_type')
    def validate_vehicle_type(cls, v):
        allowed_types = ['voiture', 'camion', 'moto']
        if v not in allowed_types:
            raise ValueError(f'Le type de véhicule doit être l\'un des suivants: {", ".join(allowed_types)}')
        return v

class TransportCreate(TransportBase):
    pass

class TransportUpdate(BaseModel):
    vehicle_type: Optional[str] = None
    license_plate: Optional[str] = None
    availabilities: Dict[str, Dict[str, bool]]

    @validator('vehicle_type')
    def validate_vehicle_type(cls, v):
        if v is not None:
            allowed_types = ['voiture', 'camion', 'moto']
            if v not in allowed_types:
                raise ValueError(f'Le type de véhicule doit être l\'un des suivants: {", ".join(allowed_types)}')
        return v

class TransportResponse(TransportBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Updated from orm_mode which is deprecated

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from typing import Dict

# CleaningService schemas
class CleaningBase(BaseModel):

    id_provider: int
    location_type: str
    cleaning_duration: int = Field(..., gt=0)
    availabilities: Dict[str, Dict[str, bool]]

    @validator('location_type')
    def validate_location_type(cls, v):
        allowed_types = ['maison', 'bureau', 'véhicule']
        if v not in allowed_types:
            raise ValueError(f'Le type de lieu doit être l\'un des suivants: {", ".join(allowed_types)}')
        return v

class CleaningCreate(CleaningBase):
    pass

class CleaningUpdate(BaseModel):
    location_type: Optional[str] = None
    cleaning_duration: Optional[int] = None
    availabilities: Dict[str, Dict[str, bool]]

    @validator('location_type')
    def validate_location_type(cls, v):
        if v is not None:
            allowed_types = ['maison', 'bureau', 'véhicule']
            if v not in allowed_types:
                raise ValueError(f'Le type de lieu doit être l\'un des suivants: {", ".join(allowed_types)}')
        return v

class CleaningResponse(CleaningBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Updated from orm_mode which is deprecated

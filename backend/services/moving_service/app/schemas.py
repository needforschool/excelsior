from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from typing import Dict
# MovingService schemas
class MovingBase(BaseModel):

    id_provider: int
    activity_range: str
    team_size: int = Field(..., gt=0)
    truck_size: str
    availabilities: Dict[str, Dict[str, bool]]

    @validator('truck_size')
    def validate_truck_size(cls, v):
        allowed_sizes = ['petit', 'moyen', 'grand']
        if v not in allowed_sizes:
            raise ValueError(f'La taille du camion doit être l\'une des suivantes: {", ".join(allowed_sizes)}')
        return v

class MovingCreate(MovingBase):
    pass

class MovingUpdate(BaseModel):
    activity_range: Optional[str] = None
    team_size: Optional[int] = None
    truck_size: Optional[str] = None
    availabilities: Dict[str, Dict[str, bool]]

    @validator('truck_size')
    def validate_truck_size(cls, v):
        if v is not None:
            allowed_sizes = ['petit', 'moyen', 'grand']
            if v not in allowed_sizes:
                raise ValueError(f'La taille du camion doit être l\'une des suivantes: {", ".join(allowed_sizes)}')
        return v

class MovingResponse(MovingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List

# OrderService schemas
class OrderBase(BaseModel):
    id_user: int
    id_provider: int
    status: str = "en cours"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['en cours', 'terminé', 'annulé']
        if v not in allowed_statuses:
            raise ValueError(f'Le statut doit être l\'un des suivants: {", ".join(allowed_statuses)}')
        return v

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ['en cours', 'terminé', 'annulé']
            if v not in allowed_statuses:
                raise ValueError(f'Le statut doit être l\'un des suivants: {", ".join(allowed_statuses)}')
        return v

class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

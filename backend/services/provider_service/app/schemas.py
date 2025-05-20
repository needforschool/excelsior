from pydantic import BaseModel, Field, validator, EmailStr
from datetime import datetime
from typing import Optional, List, Literal

# ProviderService schemas
class ProviderBase(BaseModel):
    id_user: int
    type: str
    availability: bool = True
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProviderCreate(ProviderBase):
    pass

class ProviderUpdate(BaseModel):
    type: Optional[str] = None
    availability: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProviderResponse(ProviderBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

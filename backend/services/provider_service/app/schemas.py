from pydantic import BaseModel, Field, validator, EmailStr
from datetime import datetime
from typing import Optional, Literal

class UserInfo(BaseModel):
    id: int
    lastName: str
    firstName: str
    email: str
    phone: str

    class Config:
        from_attributes = True

class ProviderBase(BaseModel):
    id_user: int
    name: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    type: Literal['transport','cleaning','repair','childcare','moving']
    latitude: float
    longitude: float

class ProviderCreate(ProviderBase):
    pass

class ProviderUpdate(BaseModel):
    type: Optional[Literal['transport','cleaning','repair','childcare','moving']] = None
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProviderResponse(ProviderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user: UserInfo


    class Config:
        orm_mode = True
        from_attributes = True

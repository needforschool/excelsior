from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Any, List, Dict
from pydantic import Extra

class ProviderInfo(BaseModel):
    id: int
    user: Any       # Ou un vrai schéma UserMini si vous en avez un
    name: str
    # autorise tous les autres champs (vehicle_type, location_type, team_size, etc.)
    class Config:
        extra = Extra.allow
        orm_mode = True

class ServiceInfo(BaseModel):
    id: int
    id_provider: int
    availabilities: Dict[str, Dict[str, bool]]

    # autorise tous les autres champs (vehicle_type, location_type, team_size, etc.)
    class Config:
        extra = Extra.allow
        orm_mode = True

class OrderEnriched(BaseModel):
    id: int
    id_user: int
    id_provider: int
    service_type: str
    id_service: int
    status: str
    latitude: float | None
    longitude: float | None
    created_at: datetime
    updated_at: datetime

    provider: ProviderInfo
    service: ServiceInfo

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Remplace orm_mode pour Pydantic v2

from pydantic import BaseModel, Field, validator, EmailStr
from datetime import datetime
from typing import Optional, Literal, List, Union

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
    availability: bool = True  # Ajout du champ availability avec True comme valeur par défaut

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

class NearbyProviderResponse(ProviderResponse):
    distance: float = Field(..., description="Distance en kilomètres depuis la position de recherche")

class NearbySearchParams(BaseModel):
    latitude: float = Field(..., description="Latitude du point de recherche")
    longitude: float = Field(..., description="Longitude du point de recherche")
    radius: float = Field(10.0, description="Rayon de recherche en kilomètres", ge=0.1, le=50.0)
    provider_type: Optional[Literal['transport','cleaning','repair','childcare','moving']] = Field(None, description="Type de fournisseur à rechercher")
    limit: int = Field(20, description="Nombre maximum de résultats", ge=1, le=100)

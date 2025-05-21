from pydantic import BaseModel, EmailStr, Field, validator, constr
from datetime import datetime
from typing import Optional, List

# UserService schemas
class UserBase(BaseModel):
    lastName: str
    firstName: str
    phone: Optional[str] = None
    email: EmailStr
    role: Optional[str] = Field(default='client', description="Le rôle de l'utilisateur ('client' ou 'prestataire')")

    @validator('role')
    def validate_role(cls, v):
        allowed = ['client', 'prestataire']
        if v not in allowed:
            raise ValueError(f"Le rôle doit être l'un de {allowed}")
        return v

    class Config:
        model_config = {  # Pydantic v2
            "from_attributes": True
        }

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    # Hérite déjà de from_attributes via UserBase

# Schémas pour l’authentification
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ChangePassword(BaseModel):
    old_password: constr(min_length=8)
    new_password: constr(min_length=8)
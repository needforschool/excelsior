# app/schemas.py

from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List

# Schémas de base
class UserBase(BaseModel):
    lastName: str
    firstName: str
    phone: str
    email: EmailStr
    role: str

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

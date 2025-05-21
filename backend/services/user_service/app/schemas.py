from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List

# UserService schemas
class UserBase(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: Optional[str] = None
    role: str

    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ['client', 'prestataire']
        if v not in allowed_roles:
            raise ValueError(f'Le rôle doit être l\'un des suivants: {", ".join(allowed_roles)}')
        return v

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Schémas pour l'authentification
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List

# PaymentService schemas
class PaymentBase(BaseModel):

    id_user: int
    amount: float = Field(..., gt=0)
    payment_status: str = "en attente"

    @validator('payment_status')
    def validate_payment_status(cls, v):
        allowed_statuses = ['en attente', 'validé', 'échoué']
        if v not in allowed_statuses:
            raise ValueError(f'Le statut de paiement doit être l\'un des suivants: {", ".join(allowed_statuses)}')
        return v

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    payment_status: Optional[str] = None

    @validator('payment_status')
    def validate_payment_status(cls, v):
        if v is not None:
            allowed_statuses = ['en attente', 'validé', 'échoué']
            if v not in allowed_statuses:
                raise ValueError(f'Le statut de paiement doit être l\'un des suivants: {", ".join(allowed_statuses)}')
        return v

class PaymentResponse(PaymentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

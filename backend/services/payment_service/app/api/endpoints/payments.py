from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os

import stripe

from app.schemas import PaymentCreate, PaymentResponse, PaymentUpdate
from app.crud import get_payment, get_payments, get_payment_by_order, create_payment, update_payment, delete_payment
from app.database import get_db

router = APIRouter()

@router.post("/payments/", response_model=PaymentResponse)
def create_new_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    return create_payment(db=db, payment=payment)

@router.get("/payments/", response_model=List[PaymentResponse])
def read_payments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    payments = get_payments(db, skip=skip, limit=limit)
    return payments

@router.get("/payments/{payment_id}", response_model=PaymentResponse)
def read_payment(payment_id: int, db: Session = Depends(get_db)):
    db_payment = get_payment(db, payment_id=payment_id)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    return db_payment

@router.get("/orders/{order_id}/payment", response_model=PaymentResponse)
def read_order_payment(order_id: int, db: Session = Depends(get_db)):
    db_payment = get_payment_by_order(db, order_id=order_id)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Paiement non trouvé pour cette commande")
    return db_payment

@router.patch("/payments/{payment_id}", response_model=PaymentResponse)
def update_payment_status(payment_id: int, payment_data: PaymentUpdate, db: Session = Depends(get_db)):
    db_payment = update_payment(db, payment_id=payment_id, payment_data=payment_data)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    return db_payment

@router.delete("/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment_endpoint(payment_id: int, db: Session = Depends(get_db)):
    success = delete_payment(db, payment_id=payment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    return {"detail": "Paiement supprimé avec succès"}

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/create-payment-intent")
async def create_payment_intent(amount: int = 1000):
    intent = stripe.PaymentIntent.create(
        amount=amount,
        currency="eur",
        automatic_payment_methods={"enabled": True},
    )
    return {"clientSecret": intent.client_secret}
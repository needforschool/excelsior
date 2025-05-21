from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.api import router
import os
import stripe


# Création des tables dans la base de données
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PaymentService",
    description="Service de gestion des paiements pour QuickServe",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    # root_path="/payment_service"
)
# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À remplacer par les domaines autorisés en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

@app.get("/")
async def root():
    return {"message": "Bienvenue sur le PaymentService de QuickServe"}

# Inclusion des routes
app.include_router(router)

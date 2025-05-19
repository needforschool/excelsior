from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.api import router

# Création des tables dans la base de données
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TransportService",
    description="Service de gestion des transports pour QuickServe",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    # root_path="/transport_service"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À remplacer par les domaines autorisés en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Bienvenue sur le TransportService de QuickServe"}

# Inclusion des routes
app.include_router(router)

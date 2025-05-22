from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Literal
import asyncio

from app.schemas import ProviderCreate, ProviderResponse, ProviderUpdate
from app.crud import (
    get_provider, get_providers, get_available_providers, get_provider_by_user_id, create_provider, 
    update_provider, delete_provider, get_providers_by_type, get_available_providers_by_type
)
from app.database import get_db
from app.api.users_client import fetch_user

router = APIRouter()

@router.post("/providers/", response_model=ProviderResponse)
def create_new_provider(provider: ProviderCreate, db: Session = Depends(get_db)):
    db_provider = get_provider_by_user_id(db, id_user=provider.id_user)
    if db_provider:
        raise HTTPException(status_code=400, detail="Provider déjà enregistré pour cet utilisateur")
    return create_provider(db=db, provider=provider)

@router.get("/providers/", response_model=List[ProviderResponse])
async def read_providers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    providers = get_providers(db, skip=skip, limit=limit)
    results = []
    for prov in providers:
        user_data = await fetch_user(prov.id_user)
        results.append(
            ProviderResponse(
                id=prov.id,
                id_user=prov.id_user,
                type=prov.type,
                latitude=prov.latitude,
                longitude=prov.longitude,
                created_at=prov.created_at,
                updated_at=prov.updated_at,
                user=user_data
            )
        )
    return results

@router.get("/providers/available/", response_model=List[ProviderResponse])
def read_available_providers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    providers = get_available_providers(db, skip=skip, limit=limit)
    return providers

@router.get("/providers/{provider_id}", response_model=ProviderResponse)
async def read_provider(provider_id: int, db: Session = Depends(get_db)):
    prov = get_provider(db, provider_id=provider_id)
    if not prov:
        raise HTTPException(status_code=404, detail="Prestataire non trouvé")
    user_data = await fetch_user(prov.id_user)
    return ProviderResponse(
        id=prov.id,
        id_user=prov.id_user,
        type=prov.type,
        latitude=prov.latitude,
        longitude=prov.longitude,
        created_at=prov.created_at,
        updated_at=prov.updated_at,
        name=prov.name,
        description=prov.description,
        short_description=prov.short_description,
        user=user_data
    )

@router.get(
    "/providers/user/{user_id}",
    response_model=ProviderResponse,
    summary="Récupère le prestataire associé à un user_id"
)
async def read_provider_by_user(
        user_id: int,
        db: Session = Depends(get_db)
):
    # 1) récupère le Provider en base
    prov = get_provider_by_user_id(db, id_user=user_id)
    if not prov:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prestataire introuvable pour cet utilisateur"
        )
    # 2) enrichit avec les données utilisateur
    user_data = await fetch_user(prov.id_user)
    # 3) construit et renvoie le ProviderResponse
    return ProviderResponse(
        id=prov.id,
        id_user=prov.id_user,
        type=prov.type,
        latitude=prov.latitude,
        longitude=prov.longitude,
        created_at=prov.created_at,
        updated_at=prov.updated_at,
        name=prov.name,
        description=prov.description,
        short_description=prov.short_description,
        user=user_data
    )

@router.patch("/providers/{provider_id}", response_model=ProviderResponse)
def update_provider_info(provider_id: int, provider_data: ProviderUpdate, db: Session = Depends(get_db)):
    db_provider = update_provider(db, provider_id=provider_id, provider_data=provider_data)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Prestataire non trouvé")
    return db_provider

@router.delete("/providers/{provider_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_provider_endpoint(provider_id: int, db: Session = Depends(get_db)):
    success = delete_provider(db, provider_id=provider_id)
    if not success:
        raise HTTPException(status_code=404, detail="Prestataire non trouvé")
    return {"detail": "Prestataire supprimé avec succès"}

@router.get(
    "/providers/type/{provider_type}",
    response_model=List[ProviderResponse],
)
async def read_providers_by_type(
        provider_type: Literal['transport', 'cleaning', 'repair', 'childcare', 'moving'],
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    # 1) Récupère les providers filtres directement en ORM
    providers = get_providers_by_type(
        db, provider_type=provider_type, skip=skip, limit=limit
    )

    # 2) Pour chaque provider, on va chercher l'user associé
    #    en parallèle pour plus d'efficacité
    async def enrich(prov):
        user = await fetch_user(prov.id_user)
        return ProviderResponse(
            id=prov.id,
            id_user=prov.id_user,
            type=prov.type,
            latitude=prov.latitude,
            longitude=prov.longitude,
            created_at=prov.created_at,
            updated_at=prov.updated_at,
            name=prov.name,
            description=prov.description,
            short_description=prov.short_description,
            user=user
        )

    # Lance tous les enrichissements en même temps
    results = await asyncio.gather(*(enrich(p) for p in providers))
    return results

@router.get("/providers/available/type/{provider_type}", response_model=List[ProviderResponse])
def read_available_providers_by_type(
    provider_type: Literal['transport', 'cleaning', 'repair', 'childcare', 'moving'], 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    providers = get_available_providers_by_type(db, provider_type=provider_type, skip=skip, limit=limit)
    return providers

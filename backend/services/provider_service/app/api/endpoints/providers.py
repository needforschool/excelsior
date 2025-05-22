from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from typing import List, Literal, Dict, Any
import asyncio

from app.schemas import (
    ProviderCreate, ProviderResponse, ProviderUpdate, 
    NearbyProviderResponse, NearbySearchParams
)
from app.crud import (
    get_provider, get_providers, get_available_providers, get_provider_by_user_id, create_provider, 
    update_provider, delete_provider, get_providers_by_type, get_available_providers_by_type,
    find_providers_nearby, sync_providers_to_redis
)
from app.database import get_db
from app.api.users_client import fetch_user

router = APIRouter()

@router.post("/providers/", response_model=ProviderResponse)
async def create_new_provider(provider: ProviderCreate, db: Session = Depends(get_db)):
    db_provider = get_provider_by_user_id(db, id_user=provider.id_user)
    if db_provider:
        raise HTTPException(status_code=400, detail="Provider déjà enregistré pour cet utilisateur")
    
    # Créer le fournisseur
    created_provider = create_provider(db=db, provider=provider)
    
    # Récupérer les informations de l'utilisateur
    user_data = await fetch_user(created_provider.id_user)
    
    # Construire la réponse complète
    return ProviderResponse(
        id=created_provider.id,
        id_user=created_provider.id_user,
        type=created_provider.type,
        latitude=created_provider.latitude,
        longitude=created_provider.longitude,
        created_at=created_provider.created_at,
        updated_at=created_provider.updated_at,
        user=user_data
    )

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
async def update_provider_info(provider_id: int, provider_data: ProviderUpdate, db: Session = Depends(get_db)):
    db_provider = update_provider(db, provider_id=provider_id, provider_data=provider_data)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Prestataire non trouvé")
    
    # Récupérer les informations de l'utilisateur
    user_data = await fetch_user(db_provider.id_user)
    
    # Construire la réponse complète
    return ProviderResponse(
        id=db_provider.id,
        id_user=db_provider.id_user,
        type=db_provider.type,
        latitude=db_provider.latitude,
        longitude=db_provider.longitude,
        created_at=db_provider.created_at,
        updated_at=db_provider.updated_at,
        user=user_data
    )

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

@router.post("/providers/nearby/", response_model=List[NearbyProviderResponse])
async def find_nearby_providers(
    search_params: NearbySearchParams,
    db: Session = Depends(get_db)
):
    """
    Trouve les fournisseurs à proximité d'une position géographique donnée.
    """
    nearby_providers = find_providers_nearby(
        db=db,
        latitude=search_params.latitude,
        longitude=search_params.longitude,
        radius=search_params.radius,
        provider_type=search_params.provider_type,
        limit=search_params.limit
    )
    
    print(f"CRUD returned providers: {nearby_providers}")
    
    if not nearby_providers:
        return []
    
    # Enrichir les résultats avec les données utilisateur
    results = []
    for provider in nearby_providers:
        try:
            # Essayer de récupérer les informations utilisateur
            user_data = await fetch_user(provider["id_user"])
            
            # Construire la réponse avec les données de l'utilisateur et la distance
            provider_response = NearbyProviderResponse(
                id=provider["id"],
                id_user=provider["id_user"],
                type=provider["type"],
                latitude=provider["latitude"],
                longitude=provider["longitude"],
                distance=provider["distance"],
                created_at=provider["created_at"],
                updated_at=provider["updated_at"],
                user=user_data
            )
            results.append(provider_response)
        except Exception as e:
            print(f"Error fetching user data for provider {provider['id']}: {e}")
            # Si nous ne pouvons pas obtenir les données utilisateur, nous passons au suivant
            # Dans un environnement de production, nous pourrions vouloir inclure l'entrée
            # avec un placeholder pour l'utilisateur, mais pour notre POC nous le sautons
            continue
    
    # Trier par distance (devrait déjà être trié, mais pour être sûr)
    results.sort(key=lambda x: x.distance)
    
    print(f"Final results count: {len(results)}")
    return results

# Endpoint simplifié pour le test sans dépendance au service utilisateur
@router.post("/providers/nearby-simple/")
def find_nearby_providers_simple(
    search_params: NearbySearchParams,
    db: Session = Depends(get_db)
):
    """
    Version simplifiée qui trouve les fournisseurs à proximité d'une position géographique donnée
    sans dépendre du service utilisateur.
    """
    nearby_providers = find_providers_nearby(
        db=db,
        latitude=search_params.latitude,
        longitude=search_params.longitude,
        radius=search_params.radius,
        provider_type=search_params.provider_type,
        limit=search_params.limit
    )
    
    print(f"CRUD returned providers: {nearby_providers}")
    
    if not nearby_providers:
        return []
    
    # Convertir les dates en chaînes pour la sérialisation JSON
    for provider in nearby_providers:
        if "created_at" in provider:
            provider["created_at"] = provider["created_at"].isoformat()
        if "updated_at" in provider:
            provider["updated_at"] = provider["updated_at"].isoformat()
    
    return nearby_providers

@router.post("/providers/sync-redis/", status_code=status.HTTP_200_OK)
def sync_redis_geolocation(db: Session = Depends(get_db)):
    """
    Synchronise tous les fournisseurs de la base de données vers Redis.
    Utile pour initialiser ou réinitialiser le cache Redis.
    """
    result = sync_providers_to_redis(db)
    return {
        "detail": f"Synchronisation terminée. {result['synced']}/{result['total']} fournisseurs synchronisés."
    }

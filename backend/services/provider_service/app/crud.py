from sqlalchemy.orm import Session
from app.models import Provider
from app.schemas import ProviderCreate, ProviderUpdate
from app.redis_geo import add_provider_location, remove_provider_location, get_provider_location, find_nearby_providers
from typing import List, Dict, Optional
from datetime import datetime

def get_provider(db: Session, provider_id: int):
    """Récupère un prestataire par son ID"""
    return db.query(Provider).filter(Provider.id == provider_id).first()

def get_provider_by_user_id(db: Session, id_user: int):
    """Récupère un prestataire par l'ID de l'utilisateur associé"""
    return db.query(Provider).filter(Provider.id_user == id_user).first()

def get_providers(db: Session, skip: int = 0, limit: int = 100):
    """Récupère une liste de prestataires avec pagination"""
    return db.query(Provider).offset(skip).limit(limit).all()

def get_available_providers(db: Session, skip: int = 0, limit: int = 100):
    """Récupère une liste de prestataires disponibles"""
    return db.query(Provider).filter(Provider.availability == True).offset(skip).limit(limit).all()

def create_provider(db: Session, provider: ProviderCreate):
    """Crée un nouveau prestataire"""
    db_provider = Provider(
        id_user=provider.id_user,
        type=provider.type,
        availabilities=provider.availabilities,
        latitude=provider.latitude,
        longitude=provider.longitude,
        name=provider.name,
        description=provider.description,
        short_description=provider.short_description,
    )
    db.add(db_provider)
    db.commit()
    db.refresh(db_provider)
    return db_provider

def update_provider(db: Session, provider_id: int, provider_data: ProviderUpdate):
    """Met à jour les informations d'un prestataire"""
    db_provider = get_provider(db, provider_id)
    if db_provider:
        update_data = provider_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_provider, key, value)
        db.commit()
        db.refresh(db_provider)
    return db_provider

def delete_provider(db: Session, provider_id: int):
    """Supprime un prestataire"""
    db_provider = get_provider(db, provider_id)
    if db_provider:
        db.delete(db_provider)
        db.commit()
        return True
    return False

def get_providers_by_type(db: Session, provider_type: str, skip: int = 0, limit: int = 100):
    """Récupère une liste de prestataires par type avec pagination"""
    return db.query(Provider).filter(Provider.type == provider_type).offset(skip).limit(limit).all()

def get_available_providers_by_type(db: Session, provider_type: str, skip: int = 0, limit: int = 100):
    """Récupère une liste de prestataires disponibles par type"""
    return db.query(Provider).filter(Provider.type == provider_type, Provider.availability == True).offset(skip).limit(limit).all()

def find_providers_nearby(db: Session, latitude: float, longitude: float, radius: float,
                          provider_type: Optional[str] = None, limit: int = 50) -> List[Dict]:
    """
    Trouve les fournisseurs à proximité d'une position donnée

    Args:
        db: Session de base de données
        latitude: Latitude de la position de recherche
        longitude: Longitude de la position de recherche
        radius: Rayon de recherche en kilomètres
        provider_type: Type de fournisseur à filtrer (optionnel)
        limit: Nombre maximum de résultats à retourner

    Returns:
        Liste de fournisseurs proches avec leurs informations complètes
    """
    # Obtenir les IDs des fournisseurs proches depuis Redis
    nearby_providers = find_nearby_providers(latitude, longitude, radius, limit=limit)

    print(f"Redis nearby_providers: {nearby_providers}")

    if not nearby_providers:
        return []

    # Récupérer les IDs des fournisseurs
    provider_ids = [p["id"] for p in nearby_providers]
    print(f"Provider IDs: {provider_ids}")

    # Récupérer les données complètes des fournisseurs depuis la base de données
    provider_data = db.query(Provider).filter(Provider.id.in_(provider_ids))

    # Filtrer par type de fournisseur si spécifié
    if provider_type:
        provider_data = provider_data.filter(Provider.type == provider_type)

    provider_data = provider_data.all()
    print(f"Found {len(provider_data)} providers in database")

    # Créer un dictionnaire d'ID -> fournisseur pour accès rapide
    provider_dict = {p.id: p for p in provider_data}

    # Combiner les informations de proximité avec les données des fournisseurs
    result = []
    for nearby in nearby_providers:
        if nearby["id"] in provider_dict:
            provider = provider_dict[nearby["id"]]

            # Si on filtre par type et que le type ne correspond pas, ignorer ce fournisseur
            if provider_type and provider.type != provider_type:
                continue

            # Créer un dictionnaire avec toutes les informations
            provider_info = {
                "id": provider.id,
                "id_user": provider.id_user,
                "type": provider.type,
                "latitude": provider.latitude,
                "longitude": provider.longitude,
                "distance": nearby["distance"],  # distance en km depuis la position demandée
                "created_at": provider.created_at,
                "updated_at": provider.updated_at
            }

            result.append(provider_info)

    # Trier par distance
    result.sort(key=lambda x: x["distance"])
    print(f"Final result: {len(result)} providers")

    return result

def sync_providers_to_redis(db: Session):
    """
    Synchronise tous les fournisseurs de la base de données vers Redis
    Utile pour initialiser ou réinitialiser le cache Redis
    """
    providers = db.query(Provider).all()
    print(f"Total providers found: {len(providers)}")
    success_count = 0

    for provider in providers:
        print(f"Provider {provider.id}: lat={provider.latitude}, long={provider.longitude}")
        # Vérifier que les coordonnées sont présentes et valides
        if provider.latitude is None or provider.longitude is None:
            print(f"Provider {provider.id}: invalid coordinates - lat={provider.latitude}, long={provider.longitude}")
            continue

        # Tenter de conserver seulement les coordonnées numériques valides
        try:
            lat = float(provider.latitude)
            lng = float(provider.longitude)
            if -90 <= lat <= 90 and -180 <= lng <= 180:
                if add_provider_location(provider.id, lat, lng):
                    success_count += 1
            else:
                print(f"Provider {provider.id}: coordinates out of range - lat={lat}, long={lng}")
        except (ValueError, TypeError) as e:
            print(f"Provider {provider.id}: error converting coordinates - {e}")

    return {"total": len(providers), "synced": success_count}

import redis
import os
from typing import List, Dict, Optional, Tuple
from urllib.parse import urlparse

# Configuration Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/4")

# Analyser l'URL Redis pour obtenir les paramètres de connexion
parsed_url = urlparse(REDIS_URL)
REDIS_HOST = parsed_url.hostname or "redis"
REDIS_PORT = parsed_url.port or 6379
REDIS_DB = int(parsed_url.path[1:]) if parsed_url.path else 4

print(f"Redis configuration: Host={REDIS_HOST}, Port={REDIS_PORT}, DB={REDIS_DB}")

# Clé pour stocker les données géospatiales des fournisseurs
GEO_KEY = "provider:geo"

# Initialiser la connexion Redis
redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    decode_responses=True
)

def add_provider_location(provider_id: int, latitude: float, longitude: float) -> bool:
    """
    Ajoute ou met à jour la localisation d'un fournisseur dans Redis
    
    Args:
        provider_id: ID du fournisseur
        latitude: Latitude de la position du fournisseur
        longitude: Longitude de la position du fournisseur
        
    Returns:
        bool: True si l'opération est réussie, False sinon
    """
    try:
        if latitude is None or longitude is None:
            print(f"Erreur: coordonnées invalides pour le fournisseur {provider_id}: lat={latitude}, long={longitude}")
            return False
            
        print(f"Ajout des coordonnées pour le fournisseur {provider_id}: lat={latitude}, long={longitude}")
        
        # Supprimer les paramètres NX et XX qui causent l'erreur
        # et passer seulement les coordonnées fondamentales
        redis_client.geoadd(GEO_KEY, [longitude, latitude, f"provider:{provider_id}"])
        return True
    except Exception as e:
        print(f"Erreur lors de l'ajout de la géolocalisation pour le fournisseur {provider_id}: {e}")
        return False

def remove_provider_location(provider_id: int) -> bool:
    """
    Supprime la localisation d'un fournisseur de Redis
    
    Args:
        provider_id: ID du fournisseur
        
    Returns:
        bool: True si l'opération est réussie, False sinon
    """
    try:
        redis_client.zrem(GEO_KEY, f"provider:{provider_id}")
        return True
    except Exception as e:
        print(f"Erreur lors de la suppression de la géolocalisation: {e}")
        return False

def get_provider_location(provider_id: int) -> Optional[Tuple[float, float]]:
    """
    Récupère la localisation d'un fournisseur
    
    Args:
        provider_id: ID du fournisseur
        
    Returns:
        Tuple[float, float]: (longitude, latitude) si trouvé, None sinon
    """
    try:
        result = redis_client.geopos(GEO_KEY, f"provider:{provider_id}")
        if result and result[0]:
            longitude, latitude = result[0]
            return (float(longitude), float(latitude))
        return None
    except Exception as e:
        print(f"Erreur lors de la récupération de la géolocalisation: {e}")
        return None

def find_nearby_providers(latitude: float, longitude: float, radius: float, 
                         provider_type: Optional[str] = None, 
                         limit: int = 50) -> List[Dict]:
    """
    Trouve les fournisseurs à proximité d'une position donnée
    
    Args:
        latitude: Latitude de la position de recherche
        longitude: Longitude de la position de recherche
        radius: Rayon de recherche en kilomètres
        provider_type: Type de fournisseur à filtrer (optionnel)
        limit: Nombre maximum de résultats à retourner
        
    Returns:
        Liste de dictionnaires contenant les informations des fournisseurs proches
    """
    try:
        # Vérifier que la connexion Redis fonctionne
        ping_result = redis_client.ping()
        print(f"Redis ping result: {ping_result}")
        
        # Vérifier le nombre d'éléments dans l'ensemble géospatial
        count = redis_client.zcard(GEO_KEY)
        print(f"Number of items in Redis geo set: {count}")
        
        # Recherche par rayon avec GEORADIUS
        print(f"Searching for providers near {latitude}, {longitude} with radius {radius} km")
        results = redis_client.georadius(
            GEO_KEY, 
            longitude, 
            latitude, 
            radius, 
            unit='km', 
            withdist=True,  # Inclure la distance
            withcoord=True,  # Inclure les coordonnées
            count=limit
        )
        
        print(f"Redis georadius results: {results}")
        
        providers = []
        for result in results:
            provider_key, distance, coords = result
            provider_id = int(provider_key.split(':')[1])
            
            # Si un type est spécifié, nous devrons vérifier dans la base de données
            # Cette fonction retourne tous les fournisseurs à proximité,
            # le filtrage par type pourra être réalisé dans la couche service
            providers.append({
                "id": provider_id,
                "distance": float(distance),  # distance en km
                "longitude": float(coords[0]),
                "latitude": float(coords[1])
            })
        
        return providers
    except Exception as e:
        print(f"Erreur lors de la recherche des fournisseurs à proximité: {e}")
        return []
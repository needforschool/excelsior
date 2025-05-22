#!/usr/bin/env python3
import redis
import psycopg2
import os

# Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/4")
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@provider_db:5432/provider_service")
GEO_KEY = "provider:geo"

# Connexion à Redis
redis_parts = REDIS_URL.split(":")
redis_host = redis_parts[1].replace("//", "")
redis_port = int(redis_parts[2].split("/")[0])
redis_db = int(redis_parts[2].split("/")[1]) if len(redis_parts[2].split("/")) > 1 else 0

redis_client = redis.Redis(
    host=redis_host,
    port=redis_port,
    db=redis_db,
    decode_responses=True
)

# Connexion à PostgreSQL
conn = psycopg2.connect(DB_URL)
cursor = conn.cursor()

# Récupérer tous les fournisseurs avec leurs coordonnées
cursor.execute("SELECT id, latitude, longitude FROM providers WHERE latitude IS NOT NULL AND longitude IS NOT NULL")
providers = cursor.fetchall()

print(f"Found {len(providers)} providers with coordinates")

# Compteurs pour le rapport
total = len(providers)
success = 0
failed = 0

# Ajouter chaque fournisseur à Redis
for provider in providers:
    provider_id, latitude, longitude = provider
    try:
        # Convertir en float et vérifier la validité
        lat = float(latitude)
        lng = float(longitude)
        
        if -90 <= lat <= 90 and -180 <= lng <= 180:
            # Ajouter à Redis avec le format de liste corrigé
            redis_client.geoadd(GEO_KEY, [lng, lat, f"provider:{provider_id}"])
            print(f"Added provider {provider_id}: lat={lat}, lng={lng}")
            success += 1
        else:
            print(f"Invalid coordinates for provider {provider_id}: lat={lat}, lng={lng}")
            failed += 1
    except Exception as e:
        print(f"Error adding provider {provider_id}: {e}")
        failed += 1

# Fermer les connexions
cursor.close()
conn.close()

# Afficher le résumé
print(f"\nSync summary:")
print(f"Total providers: {total}")
print(f"Successfully added: {success}")
print(f"Failed to add: {failed}")

# Vérifier le nombre d'éléments dans l'ensemble géospatial Redis
count = redis_client.zcard(GEO_KEY)
print(f"Total providers in Redis geo set: {count}")
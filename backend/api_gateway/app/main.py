from fastapi import FastAPI, HTTPException, Depends, Request, status, Form, Body
from app.schemas import Token, UserResponse, LoginRequest, OrderEnriched
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from typing import Dict, Any, List
import json
from fastapi.openapi.utils import get_openapi
from fastapi.openapi.models import SecurityScheme as SecuritySchemeModel
import asyncio

# JWT Configuration
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # Match User Service secret key
ALGORITHM = "HS256"

from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: Signature verification failed"
        )

app = FastAPI(title="QuickServe API Gateway",
              description="Passerelle API pour les microservices QuickServe",
              docs_url="/docs",
              redoc_url="/redoc",
              openapi_url="/openapi.json")

# Add a global variable for the token auth key
TOKEN_AUTH_KEY = "your_token_auth_key_here"  # Replace with your actual key


# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration pour forwarder les requêtes
SERVICE_URLS = {
    "user": os.getenv("USER_SERVICE_URL", "http://user_service:8001"),
    "order": os.getenv("ORDER_SERVICE_URL", "http://order_service:8002"),
    "payment": os.getenv("PAYMENT_SERVICE_URL", "http://payment_service:8003"),
    "notification": os.getenv("NOTIFICATION_SERVICE_URL", "http://notification_service:8004"),
    "provider": os.getenv("PROVIDER_SERVICE_URL", "http://provider_service:8005"),
    "transport": os.getenv("TRANSPORT_SERVICE_URL", "http://transport_service:8006"),
    "moving": os.getenv("MOVING_SERVICE_URL", "http://moving_service:8007"),
    "cleaning": os.getenv("CLEANING_SERVICE_URL", "http://cleaning_service:8008"),
    "repair": os.getenv("REPAIR_SERVICE_URL", "http://repair_service:8009"),
    "child_assistance": os.getenv("CHILD_ASSISTANCE_SERVICE_URL", "http://child_assistance_service:8010"),
}

http_client = httpx.AsyncClient()

async def get_all_services_openapi():
    """Récupère et combine les schémas OpenAPI de tous les services"""
    combined_paths = {}
    combined_schemas = {}
    service_tags = []

    for service_name, service_url in SERVICE_URLS.items():
        try:
            response = await http_client.get(f"{service_url}/openapi.json")
            if response.status_code == 200:
                service_schema = response.json()

                # Ajouter le préfixe du service aux chemins
                service_paths = service_schema.get("paths", {})
                prefixed_paths = {
                    f"/{service_name}{path}": route
                    for path, route in service_paths.items()
                }
                combined_paths.update(prefixed_paths)

                # Combiner les schémas
                if "components" in service_schema and "schemas" in service_schema["components"]:
                    combined_schemas.update(service_schema["components"]["schemas"])

                # Ajouter les tags
                service_tags.extend(service_schema.get("tags", []))
        except Exception as e:
            print(f"Erreur lors de la récupération du schéma OpenAPI pour {service_name}: {str(e)}")

    return combined_paths, combined_schemas, service_tags

@app.get("/openapi.json")
async def get_openapi_schema():
    """Génère le schéma OpenAPI combiné"""
    combined_paths, combined_schemas, service_tags = await get_all_services_openapi()

    openapi_schema = get_openapi(
        title="QuickServe API Gateway",
        version="1.0.0",
        description="API unifiée pour tous les services QuickServe",
        routes=app.routes,
    )

    # Mettre à jour le schéma avec les données combinées
    openapi_schema["paths"].update(combined_paths)
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    openapi_schema["components"]["schemas"] = combined_schemas
    openapi_schema["tags"] = service_tags

    return openapi_schema

@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API QuickServe", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Vérifie l'état de santé de tous les microservices"""
    results = {}
    for service_name, service_url in SERVICE_URLS.items():
        try:
            response = await http_client.get(f"{service_url}/", timeout=2.0)
            results[service_name] = {
                "status": "up" if response.status_code == 200 else "down",
                "code": response.status_code
            }
        except Exception as e:
            results[service_name] = {"status": "down", "error": str(e)}

    return {"status": "ok", "services": results}

# Fonction pour transférer les requêtes aux microservices
import json
from fastapi import HTTPException, Request, Response, status
from typing import Any

async def proxy_request(request: Request, service: str, path: str) -> Any:
    if service not in SERVICE_URLS:
        raise HTTPException(status_code=404, detail=f"Service {service} non trouvé")

    # Auth
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        await verify_token(token)

    # Construire l'URL cible
    service_url = SERVICE_URLS[service]
    target_url = f"{service_url}/{path}"

    # Récupérer le body si nécessaire
    body = b""
    if request.method in ("POST", "PUT", "PATCH"):
        body = await request.body()

    # Reproduire les headers (sans host)
    headers = dict(request.headers)
    headers.pop("host", None)

    # Reproduire les query params
    params = dict(request.query_params)

    try:
        resp = await http_client.request(
            method  = request.method,
            url     = target_url,
            headers = headers,
            params  = params,
            content = body,
            timeout = 30.0,
        )
        print(f"Proxying to {target_url} → {resp.status_code}")

        # 1) No Content → on renvoie directement 204
        if resp.status_code == status.HTTP_204_NO_CONTENT:
            return Response(status_code=status.HTTP_204_NO_CONTENT)

        # 2) Si JSON (et un corps non vide), on parse
        content_type = resp.headers.get("Content-Type", "")
        if "application/json" in content_type:
            try:
                return resp.json()
            except ValueError:
                # JSON mal formé
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Réponse JSON mal formée depuis le service en aval"
                )

        # 3) Tout autre cas (texte, HTML, binaire) → on renvoie brut
        return Response(
            content=resp.content,
            status_code=resp.status_code,
            media_type=content_type or "application/octet-stream"
        )

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Erreur de connexion au service {service}: {str(e)}"
        )
    except HTTPException:
        # Laisser remonter les 404/401/502 déjà levées
        raise
    except Exception as e:
        # Autres erreurs inattendues
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )

# Routes pour les utilisateurs
# Removed duplicate definition of create_user to avoid conflicts

@app.get("/users/", tags=["users"])
async def read_users(request: Request):
    return await proxy_request(request, "user", "users/")

@app.get("/users/me", tags=["users"])
async def read_current_user(request: Request):
    return await proxy_request(request, "user", "users/me")

@app.post("/users/me/password", tags=["users"])
async def change_password(request: Request):
    # On proxy en POST vers le user-service à /users/me/password
    return await proxy_request(request, "user", "users/me/password")

@app.get("/api/users/{user_id}", tags=["users"])
async def read_user(request: Request, user_id: int):
    return await proxy_request(request, "user", f"users/{user_id}")

@app.post("/token", tags=["auth"], summary="Obtenir un token d'authentification", description="Authentifie un utilisateur et retourne un token JWT", response_model=Token, responses={200: {"description": "Token généré avec succès"}, 401: {"description": "Identifiants invalides"}, 422: {"description": "Erreur de validation"}})
async def login(login_data: LoginRequest):
    """Endpoint pour l'authentification des utilisateurs"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SERVICE_URLS['user']}/token",
                data={"username": login_data.username, "password": login_data.password},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email ou mot de passe incorrect",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return Token(**response.json())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de l'authentification: {str(e)}")

@app.post("/users/", tags=["users"], summary="Créer un nouvel utilisateur", description="Enregistre un nouvel utilisateur dans le système", response_model=UserResponse, responses={200: {"description": "Utilisateur créé avec succès"}, 400: {"description": "Email déjà existant"}, 422: {"description": "Erreur de validation"}})
async def create_user(request: Request):
    """Endpoint pour la création d'utilisateur"""
    return await proxy_request(request, "user", "users/")

@app.get("/users/", tags=["users"], summary="Lister les utilisateurs", description="Retourne la liste des utilisateurs (nécessite authentification)", responses={200: {"description": "Liste des utilisateurs"}, 401: {"description": "Non authentifié"}})
async def read_users(request: Request):
    """Endpoint pour récupérer la liste des utilisateurs"""
    return await proxy_request(request, "user", "users/")

@app.post("/users", tags=["auth"], summary="Register a new user", description="Registers a new user in the system")
async def register_user(request: Request, payload: dict = Body(...)):
    """Endpoint for user registration"""
    try:
        # Forward the JSON payload to the User Service's /users/ endpoint
        target_url = f"{SERVICE_URLS['user']}/users/"
        print(f"Forwarding registration request to: {target_url}")  # Debug log

        response = await http_client.post(
            target_url,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"Response from user service: {response.status_code}, {response.text}")  # Debug log

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
    except HTTPException as e:
        print(f"Error during registration: {e.detail}")  # Debug log
        raise
    except Exception as e:
        print(f"Unexpected error during registration: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail="Internal server error")

# Routes pour les commandes
@app.post("/orders/", tags=["orders"])
async def create_order(request: Request):
    print("Creating order:", request)
    return await proxy_request(request, "order", "orders/")

@app.get("/orders/", tags=["orders"])
async def read_orders(request: Request):
    return await proxy_request(request, "order", "orders/")

@app.get("/orders/provider/{provider_id}", tags=["orders"])
async def read_provider_orders(request: Request, provider_id: int):
    return await proxy_request(request, "order", f"orders/provider/{provider_id}")

@app.get("/orders/{order_id}", tags=["orders"])
async def read_order(request: Request, order_id: int):
    return await proxy_request(request, "order", f"orders/{order_id}")


@app.get(
    "/users/{user_id}/orders-enriched/",
    response_model=List[OrderEnriched],
    tags=["orders"]
)
async def read_user_orders_enriched(request: Request, user_id: int):
    # 1) Récupère les orders bruts
    orders = await proxy_request(request, "order", f"users/{user_id}/orders/")

    # 2) Prépare un client httpx
    async with httpx.AsyncClient() as client:
        async def enrich(o):
            # 2a) fetch provider
            prov_resp    = await client.get(f"{SERVICE_URLS['provider']}/providers/{o['id_provider']}")
            provider     = prov_resp.json()
            # 2b) fetch service selon service_type
            svc_url      = SERVICE_URLS[o['service_type']]
            # conversion type → endpoint pluriel
            plural = {
                "transport": "transports",
                "moving":    "movings",
                "cleaning":  "cleanings",
                "repair":    "repairs",
                "childcare": "child-assistances"
            }[o['service_type']]
            svc_resp     = await client.get(f"{svc_url}/{plural}/{o['id_service']}")
            service      = svc_resp.json()

            # 2c) fusion
            return {
                **o,
                "provider": provider,
                "service":  service
            }

        # 3) paralléliser
        enriched = await asyncio.gather(*(enrich(o) for o in orders))

    return enriched

@app.get("/users/{user_id}/orders/", tags=["orders"])
async def read_user_orders(request: Request, user_id: int):
    return await proxy_request(request, "order", f"users/{user_id}/orders/")


# Routes pour les paiements
@app.post("/payments/", tags=["payments"])
async def create_payment(request: Request):
    return await proxy_request(request, "payment", "payments/")

@app.get("/payments/", tags=["payments"])
async def read_payments(request: Request):
    return await proxy_request(request, "payment", "payments/")

@app.get("/payments/{payment_id}", tags=["payments"])
async def read_payment(request: Request, payment_id: int):
    return await proxy_request(request, "payment", f"payments/{payment_id}")

@app.post("/create-payment-intent")
async def create_payment_intent(request: Request):
    return await proxy_request(request, "payment", "create-payment-intent")

@app.get("/orders/{order_id}/payment", tags=["payments"])
async def read_order_payment(request: Request, order_id: int):
    return await proxy_request(request, "payment", f"orders/{order_id}/payment")

# Routes pour les notifications
@app.post("/notifications/", tags=["notifications"])
async def create_notification(request: Request):
    return await proxy_request(request, "notification", "notifications/")

@app.get("/notifications/", tags=["notifications"])
async def read_notifications(request: Request):
    return await proxy_request(request, "notification", "notifications/")

@app.get("/users/{user_id}/notifications/", tags=["notifications"])
async def read_user_notifications(request: Request, user_id: int):
    return await proxy_request(request, "notification", f"users/{user_id}/notifications/")

# Routes pour les prestataires
@app.post("/providers/", tags=["providers"])
async def create_provider(request: Request):
    return await proxy_request(request, "provider", "providers/")

@app.get("/providers/", tags=["providers"])
async def read_providers(request: Request):
    return await proxy_request(request, "provider", "providers/")

@app.get("/providers/{provider_id}", tags=["providers"])
async def read_provider(request: Request, provider_id: int):
    return await proxy_request(request, "provider", f"providers/{provider_id}")

@app.get("/providers/available/", tags=["providers"])
async def read_available_providers(request: Request):
    return await proxy_request(request, "provider", "providers/available/")

@app.get("/providers/type/{type}", tags=["providers"])
async def read_provider_by_type(request: Request, type: str):
    return await proxy_request(request, "provider", f"providers/type/{type}")

# Routes pour les services de transport
@app.post("/transports/", tags=["transports"])
async def create_transport(request: Request):
    return await proxy_request(request, "transport", "transports/")

@app.get("/transports/", tags=["transports"])
async def read_transports(request: Request):
    return await proxy_request(request, "transport", "transports/")

@app.get("/transports/provider/{id_provider}", tags=["transports"])
async def read_transports_by_provider(request: Request, id_provider: int):
    return await proxy_request(request, "transport", f"transports/provider/{id_provider}")

@app.get("/transports/{transport_id}", tags=["transports"])
async def read_transport(request: Request, transport_id: int):
    return await proxy_request(request, "transport", f"transports/{transport_id}")

@app.get("/orders/{order_id}/transport", tags=["transports"])
async def read_order_transport(request: Request, order_id: int):
    return await proxy_request(request, "transport", f"orders/{order_id}/transport")


# Routes pour les services de déménagement
@app.post("/movings/", tags=["movings"])
async def create_moving(request: Request):
    return await proxy_request(request, "moving", "movings/")

@app.get("/movings/", tags=["movings"])
async def read_movings(request: Request):
    return await proxy_request(request, "moving", "movings/")

@app.get("/orders/{order_id}/moving", tags=["movings"])
async def read_order_moving(request: Request, order_id: int):
    return await proxy_request(request, "moving", f"orders/{order_id}/moving")

@app.get("/movings/provider/{id_provider}", tags=["movings"])
async def read_movings_by_provider(request: Request, id_provider: int):
    return await proxy_request(request, "moving", f"movings/provider/{id_provider}")

# Routes pour les services de nettoyage
@app.post("/cleanings/", tags=["cleanings"])
async def create_cleaning(request: Request):
    return await proxy_request(request, "cleaning", "cleanings/")

@app.get("/cleanings/provider/{id_provider}", tags=["cleanings"])
async def read_cleanings_by_provider(request: Request, id_provider: int):
    return await proxy_request(request, "cleaning", f"cleanings/provider/{id_provider}")

@app.get("/cleanings/", tags=["cleanings"])
async def read_cleanings(request: Request):
    return await proxy_request(request, "cleaning", "cleanings/")

@app.get("/orders/{order_id}/cleaning", tags=["cleanings"])
async def read_order_cleaning(request: Request, order_id: int):
    return await proxy_request(request, "cleaning", f"orders/{order_id}/cleaning")

# Routes pour les services de dépannage
@app.post("/repairs/", tags=["repairs"])
async def create_repair(request: Request):
    return await proxy_request(request, "repair", "repairs/")

@app.get("/repairs/provider/{id_provider}", tags=["repairs"])
async def read_repairs_by_provider(request: Request, id_provider: int):
    return await proxy_request(request, "repair", f"repairs/provider/{id_provider}")

@app.get("/repairs/", tags=["repairs"])
async def read_repairs(request: Request):
    return await proxy_request(request, "repair", "repairs/")

@app.get("/orders/{order_id}/repair", tags=["repairs"])
async def read_order_repair(request: Request, order_id: int):
    return await proxy_request(request, "repair", f"orders/{order_id}/repair")

# Routes pour les services de garde d'enfant
@app.post("/child-assistances/", tags=["child_assistances"])
async def create_child_assistance(request: Request):
    return await proxy_request(request, "child_assistance", "child-assistances/")

@app.get("/child-assistances/provider/{id_provider}", tags=["child_assistances"])
async def read_provider_child_assistances(request: Request, id_provider: int):
    return await proxy_request(request, "child_assistance", f"child-assistances/provider/{id_provider}")

@app.get("/child-assistances/", tags=["child_assistances"])
async def read_child_assistances(request: Request):
    return await proxy_request(request, "child_assistance", "child-assistances/")

@app.get("/orders/{order_id}/child-assistance", tags=["child_assistances"])
async def read_order_child_assistance(request: Request, order_id: int):
    return await proxy_request(request, "child_assistance", f"orders/{order_id}/child-assistance")

@app.get("/auth/key", tags=["auth"])
async def get_auth_key():
    return {"token_auth_key": TOKEN_AUTH_KEY}

# Add security scheme for Swagger
security_scheme = {
    "type": "http",
    "scheme": "bearer",
    "bearerFormat": "JWT",
    "description": "Enter your JWT token in the format: Bearer <token>"
}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version="1.0.0",
        description=app.description,
        routes=app.routes,
    )

    # Add security scheme to OpenAPI schema
    openapi_schema["components"] = openapi_schema.get("components", {})
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": security_scheme
    }

    # Apply security globally to all routes
    for path in openapi_schema.get("paths", {}).values():
        for operation in path.values():
            operation.setdefault("security", [{"BearerAuth": []}])

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Fermeture du client HTTP à la fermeture de l'application
@app.on_event("shutdown")
async def shutdown_event():
    await http_client.aclose()
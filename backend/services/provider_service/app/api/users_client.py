# app/api/users_client.py
import os
import httpx
from fastapi import HTTPException

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user_service:8001")

async def fetch_user(user_id: int) -> dict:
    url = f"{USER_SERVICE_URL}/users/{user_id}"
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(url)
    # Si on n’a pas un 200, on lève une erreur explicite
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="User not found")
    if resp.status_code != 200:
        # Logguez le texte pour debug (ou replacez par un logger)
        text = resp.text
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne UserService: {resp.status_code} – {text!r}"
        )
    # À ce stade, on est sûr d’avoir du JSON
    try:
        return resp.json()
    except ValueError:
        # Cas très improbable si le service renvoie vraiment JSON
        raise HTTPException(
            status_code=500,
            detail=f"Réponse invalide du UserService (non-JSON): {resp.text!r}"
        )

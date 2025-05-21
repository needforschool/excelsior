from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import List

from app.schemas import UserCreate, UserResponse, Token, TokenData, ForgotPasswordRequest, ContactRequest
from app.crud import get_user, get_user_by_email, get_users, create_user, authenticate_user
from app.database import get_db
from app.email_utils import send_email
import secrets
import os
from dotenv import load_dotenv

# Configuration de l'authentification
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # À remplacer par une clé sécurisée en production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        print("Authorization header missing")  # Log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required",
        )
    
    # Vérification insensible à la casse
    if not authorization.lower().startswith("bearer "):
        print("Authorization header invalid format")  # Log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must start with 'Bearer '",
        )
    
    token = authorization.split(" ")[1]
    
    try:
        print(f"Token reçu: {token}")  # Log du token reçu
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Payload décodé: {payload}")  # Log du payload décodé
        
        email = payload.get("sub")
        if not email:
            print("Email manquant dans le payload")  # Log
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no email in payload",
            )
            
        user = get_user_by_email(db, email=email)
        if not user:
            print(f"Utilisateur non trouvé pour email: {email}")  # Log
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
            
        return user
        
    except JWTError as e:
        print(f"Erreur JWT: {str(e)}")  # Log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )

# The login endpoint has been removed as per the new requirement.

@router.post("/users/", response_model=UserResponse)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email déjà enregistré")
    return create_user(db=db, user=user)

load_dotenv()
path_users = os.getenv("pathUsers", "/users_service/users")

@router.get(f"{path_users}/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = get_users(db, skip=skip, limit=limit)
    return users

@router.get("/users/me", response_model=UserResponse)
def read_current_user(current_user: UserResponse = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user

@router.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return db_user

@router.post("/users/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=request.email)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    token = secrets.token_urlsafe(32)
    reset_link = f"https://127.0.0.1:3000/reset-password?token={token}"
    subject = "Réinitialisation de votre mot de passe"
    body = f"Bonjour,\n\nPour réinitialiser votre mot de passe, cliquez sur ce lien : {reset_link}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email."
    html_body = f"""
    <div style='font-family: Arial, sans-serif; color: #222;'>
      <h2 style='color: #007bff;'>Réinitialisation de votre mot de passe</h2>
      <p>Bonjour,</p>
      <p>Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :</p>
      <p style='text-align:center; margin: 30px 0;'>
        <a href='{reset_link}' style='background: #007bff; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;'>Réinitialiser mon mot de passe</a>
      </p>
      <p style='color: #888;'>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      <hr style='margin: 32px 0;'>
      <p style='font-size: 12px; color: #aaa;'>L'équipe QuickServe</p>
    </div>
    """
    send_email(subject, body, to_email=request.email, smtp_server=os.getenv('SMTP_SERVER', 'localhost'), smtp_port=int(os.getenv('SMTP_PORT', 25)), smtp_user=os.getenv('SMTP_USER'), smtp_password=os.getenv('SMTP_PASSWORD'), html_body=html_body)
    # Envoi d'une copie à l'admin
    admin_email = os.getenv('ADMIN_EMAIL')
    send_email(subject + " (copie)", body, to_email=admin_email, smtp_server=os.getenv('SMTP_SERVER', 'localhost'), smtp_port=int(os.getenv('SMTP_PORT', 25)), smtp_user=os.getenv('SMTP_USER'), smtp_password=os.getenv('SMTP_PASSWORD'), html_body=html_body)
    return {"message": "Si l'email existe, un lien de réinitialisation a été envoyé."}

@router.post("/users/contact")
def contact(request: ContactRequest):
    subject = f"Nouveau message de contact de {request.name}"
    body = f"Nom: {request.name}\nEmail: {request.email}\n\nMessage:\n{request.message}"
    html_body = f"""
    <div style='font-family: Arial, sans-serif; color: #222;'>
      <h2 style='color: #007bff;'>Nouveau message de contact</h2>
      <p><strong>Nom :</strong> {request.name}</p>
      <p><strong>Email :</strong> {request.email}</p>
      <div style='margin: 24px 0; padding: 16px; background: #f8f9fa; border-radius: 6px;'>
        <strong>Message :</strong><br>
        <span style='white-space: pre-line;'>{request.message}</span>
      </div>
      <hr style='margin: 32px 0;'>
      <p style='font-size: 12px; color: #aaa;'>Contact reçu via QuickServe</p>
    </div>
    """
    admin_email = os.getenv('ADMIN_EMAIL')
    send_email(subject, body, to_email=admin_email, smtp_server=os.getenv('SMTP_SERVER', 'localhost'), smtp_port=int(os.getenv('SMTP_PORT', 25)), smtp_user=os.getenv('SMTP_USER'), smtp_password=os.getenv('SMTP_PASSWORD'), html_body=html_body)
    return {"message": "Votre message a été reçu. Nous vous contacterons bientôt."}

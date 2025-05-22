from sqlalchemy.orm import Session
from app.models import Moving
from app.schemas import MovingCreate, MovingUpdate

def get_moving(db: Session, moving_id: int):
    """Récupère un déménagement par son ID"""
    return db.query(Moving).filter(Moving.id == moving_id).first()

def get_moving_by_order(db: Session, order_id: int):
    """Récupère un déménagement par l'ID de la commande associée"""
    return db.query(Moving).filter(Moving.id_order == order_id).first()

def get_movings(db: Session, skip: int = 0, limit: int = 100):
    """Récupère une liste de déménagements avec pagination"""
    return db.query(Moving).offset(skip).limit(limit).all()

def get_provider_movings(db: Session, provider_id: int, skip: int = 0, limit: int = 100):
    """Récupère une liste de déménagements d'un prestataire"""
    return db.query(Moving).filter(Moving.id_provider == provider_id).offset(skip).limit(limit).all()

def create_moving(db: Session, moving: MovingCreate):
    """Crée un nouveau déménagement"""
    db_moving = Moving(
        id_order=moving.id_order,
        id_provider=moving.id_provider,
        activity_range=moving.activity_range,
        team_size=moving.team_size,
        truck_size=moving.truck_size,
        availabilities=moving.availabilities
    )
    db.add(db_moving)
    db.commit()
    db.refresh(db_moving)
    return db_moving

def update_moving(db: Session, moving_id: int, moving_data: MovingUpdate):
    """Met à jour les informations d'un déménagement"""
    db_moving = get_moving(db, moving_id)
    if db_moving:
        update_data = moving_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_moving, key, value)
        db.commit()
        db.refresh(db_moving)
    return db_moving

def delete_moving(db: Session, moving_id: int):
    """Supprime un déménagement"""
    db_moving = get_moving(db, moving_id)
    if db_moving:
        db.delete(db_moving)
        db.commit()
        return True
    return False

def get_moving_by_provider(db: Session, id_provider: int):
    """Récupère un déménagement par le fournisseur"""
    return db.query(Moving).filter(Moving.id_provider == id_provider).all()

from sqlalchemy.orm import Session
from app.models import Repair
from app.schemas import RepairCreate, RepairUpdate

def get_repair(db: Session, repair_id: int):
    """Récupère un service de dépannage par son ID"""
    return db.query(Repair).filter(Repair.id == repair_id).first()

def get_repair_by_order(db: Session, order_id: int):
    """Récupère un service de dépannage par l'ID de la commande associée"""
    return db.query(Repair).filter(Repair.id_order == order_id).first()

def get_repairs(db: Session, skip: int = 0, limit: int = 100):
    """Récupère une liste de services de dépannage avec pagination"""
    return db.query(Repair).offset(skip).limit(limit).all()

def get_provider_repairs(db: Session, provider_id: int, skip: int = 0, limit: int = 100):
    """Récupère une liste de services de dépannage d'un prestataire"""
    return db.query(Repair).filter(Repair.id_provider == provider_id).offset(skip).limit(limit).all()

def create_repair(db: Session, repair: RepairCreate):
    """Crée un nouveau service de dépannage"""
    db_repair = Repair(
        id_order=repair.id_order,
        id_provider=repair.id_provider,
        issue_type=repair.issue_type,
        expertise_level=repair.expertise_level,
        availabilities=repair.availabilities
    )
    db.add(db_repair)
    db.commit()
    db.refresh(db_repair)
    return db_repair

def update_repair(db: Session, repair_id: int, repair_data: RepairUpdate):
    """Met à jour les informations d'un service de dépannage"""
    db_repair = get_repair(db, repair_id)
    if db_repair:
        update_data = repair_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_repair, key, value)
        db.commit()
        db.refresh(db_repair)
    return db_repair

def delete_repair(db: Session, repair_id: int):
    """Supprime un service de dépannage"""
    db_repair = get_repair(db, repair_id)
    if db_repair:
        db.delete(db_repair)
        db.commit()
        return True
    return False

def get_repair_by_provider(db: Session, id_provider: int):
    """Récupère un service de dépannage par le fournisseur"""
    return db.query(Repair).filter(Repair.id_provider == id_provider).all()

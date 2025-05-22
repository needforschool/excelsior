from sqlalchemy.orm import Session
from app.models import Transport
from app.schemas import TransportCreate, TransportUpdate

def get_transport(db: Session, transport_id: int):
    """Récupère un transport par son ID"""
    return db.query(Transport).filter(Transport.id == transport_id).first()

def get_transport_by_order(db: Session, order_id: int):
    """Récupère un transport par l'ID de la commande associée"""
    return db.query(Transport).filter(Transport.id_order == order_id).first()

def get_transports(db: Session, skip: int = 0, limit: int = 100):
    """Récupère une liste de transports avec pagination"""
    return db.query(Transport).offset(skip).limit(limit).all()

def get_provider_transports(db: Session, provider_id: int, skip: int = 0, limit: int = 100):
    """Récupère une liste de transports d'un prestataire"""
    return db.query(Transport).filter(Transport.id_provider == provider_id).offset(skip).limit(limit).all()

def create_transport(db: Session, transport: TransportCreate):
    """Crée un nouveau transport"""
    db_transport = Transport(
        id_order=transport.id_order,
        id_provider=transport.id_provider,
        vehicle_type=transport.vehicle_type,
        license_plate=transport.license_plate,
        availability=transport.availability
    )
    db.add(db_transport)
    db.commit()
    db.refresh(db_transport)
    return db_transport

def update_transport(db: Session, transport_id: int, transport_data: TransportUpdate):
    """Met à jour les informations d'un transport"""
    db_transport = get_transport(db, transport_id)
    if db_transport:
        update_data = transport_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_transport, key, value)
        db.commit()
        db.refresh(db_transport)
    return db_transport

def delete_transport(db: Session, transport_id: int):
    """Supprime un transport"""
    db_transport = get_transport(db, transport_id)
    if db_transport:
        db.delete(db_transport)
        db.commit()
        return True
    return False

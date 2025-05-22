from sqlalchemy.orm import Session
from app.models import Order
from app.schemas import OrderCreate, OrderUpdate

def get_order(db: Session, order_id: int):
    """Récupère une commande par son ID"""
    return db.query(Order).filter(Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    """Récupère une liste de commandes avec pagination"""
    return db.query(Order).offset(skip).limit(limit).all()

def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Récupère les commandes d'un utilisateur spécifique"""
    return db.query(Order).filter(Order.id_user == user_id).offset(skip).limit(limit).all()

def get_provider_orders(db: Session, provider_id: int, skip: int = 0, limit: int = 100):
    """Récupère les commandes d'un prestataire spécifique"""
    return db.query(Order).filter(Order.id_provider == provider_id).offset(skip).limit(limit).all()

def create_order(db: Session, order: OrderCreate):
    """Crée une nouvelle commande"""
    print("Creating order:", order)
    db_order = Order(
        id_user=order.id_user,
        id_provider=order.id_provider,
        service_type=order.service_type,
        id_service=order.id_service,
        status=order.status,
        latitude=order.latitude,
        longitude=order.longitude
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order(db: Session, order_id: int, order_data: OrderUpdate):
    """Met à jour le statut d'une commande"""
    db_order = get_order(db, order_id)
    if db_order:
        update_data = order_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_order, key, value)
        db.commit()
        db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: int):
    """Supprime une commande"""
    db_order = get_order(db, order_id)
    if db_order:
        db.delete(db_order)
        db.commit()
        return True
    return False

def get_order_by_provider(db: Session, id_provider: int):
    """Récupère une commande par le fournisseur"""
    return db.query(Order).filter(Order.id_provider == id_provider).all()

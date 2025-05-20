from sqlalchemy.orm import Session
from app.models import Notification
from app.schemas import NotificationCreate, NotificationUpdate

def get_notification(db: Session, notification_id: int):
    """Récupère une notification par son ID"""
    return db.query(Notification).filter(Notification.id == notification_id).first()

def get_notifications(db: Session, skip: int = 0, limit: int = 100):
    """Récupère une liste de notifications avec pagination"""
    return db.query(Notification).offset(skip).limit(limit).all()

def get_receiver_notifications(db: Session, receiver_id: int, skip: int = 0, limit: int = 100):
    """Récupère les notifications d'un destinataire spécifique"""
    return db.query(Notification).filter(Notification.id_receiver == receiver_id).offset(skip).limit(limit).all()

def get_sender_notifications(db: Session, sender_id: int, skip: int = 0, limit: int = 100):
    """Récupère les notifications d'un expéditeur spécifique"""
    return db.query(Notification).filter(Notification.id_sender == sender_id).offset(skip).limit(limit).all()

def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Récupère toutes les notifications où l'utilisateur est soit expéditeur soit destinataire."""
    return db.query(Notification).filter(
        (Notification.id_sender == user_id) | (Notification.id_receiver == user_id)
    ).offset(skip).limit(limit).all()

def create_notification(db: Session, notification: NotificationCreate):
    """Crée une nouvelle notification"""
    db_notification = Notification(
        id_sender=notification.id_sender,
        id_receiver=notification.id_receiver,
        message=notification.message,
        is_read=notification.is_read
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def update_notification(db: Session, notification_id: int, notification_data: NotificationUpdate):
    """Met à jour le statut de lecture d'une notification"""
    db_notification = get_notification(db, notification_id)
    if db_notification:
        update_data = notification_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_notification, key, value)
        db.commit()
        db.refresh(db_notification)
    return db_notification

def delete_notification(db: Session, notification_id: int):
    """Supprime une notification"""
    db_notification = get_notification(db, notification_id)
    if db_notification:
        db.delete(db_notification)
        db.commit()
        return True
    return False

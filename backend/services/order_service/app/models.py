from sqlalchemy import Column, Integer, String, Enum, DateTime, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.database import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    id_user = Column(Integer,  nullable=False)
    id_provider = Column(Integer, nullable=False)
    service_type = Column(String, nullable=False)
    id_service = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default='en cours')  # 'en cours', 'terminé', 'annulé'
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

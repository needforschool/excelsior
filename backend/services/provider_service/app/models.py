from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.database import Base
from sqlalchemy import Enum

class Provider(Base):
    __tablename__ = "providers"
    
    id = Column(Integer, primary_key=True, index=True)
    id_user = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    short_description = Column(String, nullable=True)
    type = Column(Enum('transport', 'cleaning', 'repair', 'childcare', 'moving', name='provider_type'), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    availability = Column(Boolean, default=True)  # Ajout du champ availability
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

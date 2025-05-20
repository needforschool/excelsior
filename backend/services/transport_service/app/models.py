from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict
from datetime import datetime
from app.database import Base

class Transport(Base):
    __tablename__ = "transports"
    
    id = Column(Integer, primary_key=True, index=True)
    id_order = Column(Integer, nullable=False)
    id_provider = Column(Integer, nullable=False)
    activity_range = Column(Integer, nullable=False)
    vehicle_type = Column(String, nullable=False)  # 'voiture', 'camion', 'moto'
    driver_name = Column(String, nullable=False)
    driver_contact = Column(String)
    availability = Column(
        MutableDict.as_mutable(JSONB),
        default=MutableDict,        # valeur par défaut = {}
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.database import Base

class Repair(Base):
    __tablename__ = "repairs"
    
    id = Column(Integer, primary_key=True, index=True)
    id_order = Column(Integer, nullable=False)
    id_provider = Column(Integer, nullable=False)
    issue_type = Column(String, nullable=False)  # 'batterie', 'pneu', 'moteur', 'autre'
    expertise_level = Column(String, nullable=False)
    availability = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

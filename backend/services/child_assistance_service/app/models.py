from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.database import Base

class ChildAssistance(Base):
    __tablename__ = "child_assistances"
    
    id = Column(Integer, primary_key=True, index=True)
    id_order = Column(Integer, nullable=False)
    id_provider = Column(Integer,  nullable=False)
    child_count = Column(Integer, nullable=False)
    experience = Column(String, nullable=False)
    availability = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

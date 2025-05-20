from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    id_sender = Column(Integer, nullable=False)
    id_receiver = Column(Integer,  nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

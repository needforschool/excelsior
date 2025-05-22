from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.database import Base

class Moving(Base):
    __tablename__ = "movings"
    id = Column(Integer, primary_key=True, index=True)
    id_order = Column(Integer,  nullable=False)
    id_provider = Column(Integer,  nullable=False)
    activity_range = Column(String, nullable=False)
    team_size = Column(Integer, nullable=False)
    truck_size = Column(String, nullable=False)
    availability = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

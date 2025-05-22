from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.database import Base
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict

class Cleaning(Base):
    __tablename__ = "cleanings"
    
    id = Column(Integer, primary_key=True, index=True)
    id_provider = Column(Integer,  nullable=False)
    location_type = Column(String, nullable=False)
    cleaning_duration = Column(Integer, nullable=False)
    availabilities = Column(
        MutableDict.as_mutable(JSONB),
        default=MutableDict,
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

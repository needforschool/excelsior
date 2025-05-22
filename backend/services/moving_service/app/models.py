from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.database import Base
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict

class Moving(Base):
    __tablename__ = "movings"
    id = Column(Integer, primary_key=True, index=True)
    id_provider = Column(Integer,  nullable=False)
    activity_range = Column(String, nullable=False)
    team_size = Column(Integer, nullable=False)
    truck_size = Column(String, nullable=False)
    availabilities = Column(
        MutableDict.as_mutable(JSONB),
        default=MutableDict,
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

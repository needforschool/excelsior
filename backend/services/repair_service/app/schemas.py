from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from sqlalchemy.dialects.postgresql import JSONB
from typing import Dict
# RepairService schemas
class RepairBase(BaseModel):

    id_provider: int
    issue_type: str
    expertise_level: str
    availabilities: Dict[str, Dict[str, bool]]

    @validator('issue_type')
    def validate_issue_type(cls, v):
        allowed_types = ['batterie', 'pneu', 'moteur', 'autre']
        if v not in allowed_types:
            raise ValueError(f'Le type de problème doit être l\'un des suivants: {", ".join(allowed_types)}')
        return v

class RepairCreate(RepairBase):
    pass

class RepairUpdate(BaseModel):
    issue_type: Optional[str] = None
    expertise_level: Optional[str] = None
    availabilities: Dict[str, Dict[str, bool]]

    @validator('issue_type')
    def validate_issue_type(cls, v):
        if v is not None:
            allowed_types = ['batterie', 'pneu', 'moteur', 'autre']
            if v not in allowed_types:
                raise ValueError(f'Le type de problème doit être l\'un des suivants: {", ".join(allowed_types)}')
        return v

class RepairResponse(RepairBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Updated from orm_mode which is deprecated

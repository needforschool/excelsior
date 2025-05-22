from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from typing import Dict
# ChildAssistanceService schemas
class ChildAssistanceBase(BaseModel):

    id_provider: int
    child_count: int = Field(..., gt=0)
    experience: str
    availabilities: Dict[str, Dict[str, bool]]

class ChildAssistanceCreate(ChildAssistanceBase):
    pass

class ChildAssistanceUpdate(BaseModel):
    child_count: Optional[int] = None
    experience: Optional[str] = None
    availabilities: Dict[str, Dict[str, bool]]

class ChildAssistanceResponse(ChildAssistanceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Updated from orm_mode which is deprecated

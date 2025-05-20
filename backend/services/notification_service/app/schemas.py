from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List

# NotificationService schemas
class NotificationBase(BaseModel):
    id_sender: int
    id_receiver: int
    message: str
    is_read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

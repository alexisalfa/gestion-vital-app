from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class LicenseStatus(BaseModel):
    is_active: bool
    type: str
    expiration: Optional[datetime] = None

    class Config:
        from_attributes = True

class MasterKeyRequest(BaseModel):
    master_key: str
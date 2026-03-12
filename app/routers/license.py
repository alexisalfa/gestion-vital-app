# app/routers/license.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.database import get_session
from app.models.user import User
from app.schemas.user import LicenseStatus, MasterKeyRequest
from app.auth.auth_bearer import get_current_user # <--- Ya no debería dar error

router = APIRouter(prefix="/api/v1/license", tags=["license"])

@router.post("/activate-full", response_model=LicenseStatus)
async def activate_full(
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    # Lógica temporal para que devuelva algo
    return {
        "is_active": True, 
        "type": "full", 
        "expiration": None
    }
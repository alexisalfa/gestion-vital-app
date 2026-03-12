# app/auth/license_check.py
from datetime import date
from fastapi import HTTPException, status, Depends
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.configuracion import Configuracion
from app.models.user import User
from app.auth.auth_bearer import get_current_user

def verificar_licencia_activa(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Buscar la configuración/licencia del usuario
    statement = select(Configuracion).where(Configuracion.user_id == current_user.id)
    config = session.exec(statement).first()

    if not config:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se encontró registro de licencia para este usuario."
        )

    # 2. Verificar si está marcada como inactiva manualmente
    if not config.licencia_activa:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Su licencia ha sido desactivada. Contacte al administrador."
        )

    # 3. Verificar fecha de vencimiento
    if config.fecha_vencimiento and config.fecha_vencimiento < date.today():
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Licencia vencida el {config.fecha_vencimiento}. Por favor, renueve su suscripción."
        )
    
    return config
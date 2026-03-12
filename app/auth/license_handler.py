from fastapi import HTTPException, status, Depends
from datetime import datetime
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.configuracion import Configuracion
from app.models.user import User
from app.auth.auth_bearer import get_current_user

def verificar_licencia_activa(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Buscamos la configuración del usuario
    statement = select(Configuracion).where(Configuracion.user_id == current_user.id)
    config = session.exec(statement).first()

    if not config:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se encontró registro de licencia para este usuario."
        )

    # Verificamos si la licencia está marcada como inactiva manualmente
    if not config.licencia_activa:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu licencia ha sido desactivada. Contacta a soporte."
        )

    # VERIFICACIÓN DE TIEMPO (El bloqueo automático)
    if datetime.now().date() > config.fecha_vencimiento:
        # Aquí es donde ocurre la magia: el usuario existe, pero no puede pasar
        mensaje = "Tu periodo de prueba de 24h ha vencido." if config.es_prueba else "Tu licencia anual ha expirado."
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{mensaje} Realiza el pago para reactivar tu cuenta."
        )

    return config
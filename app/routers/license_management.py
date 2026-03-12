from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_session
from app.models.configuracion import Configuracion
from app.models.licencia_disponible import LicenciaDisponible
from app.models.user import User
from app.auth.auth_bearer import get_current_user

router = APIRouter(prefix="/license", tags=["Gestión de Licencias"])

# Esquema para recibir el JSON del Frontend
class LicenseUpgradeRequest(BaseModel):
    new_license_key: str

@router.post("/upgrade")
def upgrade_license(
    data: LicenseUpgradeRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Validación de seguridad (Pylance check)
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no identificado")

    # 2. Buscar si el código existe en el inventario y no ha sido usado
    statement_lic = select(LicenciaDisponible).where(
        LicenciaDisponible.codigo == data.new_license_key,
        LicenciaDisponible.usada == False
    )
    licencia_db = session.exec(statement_lic).first()

    if not licencia_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Código de licencia inválido, inexistente o ya utilizado."
        )

    # 3. Buscar la configuración del usuario actual
    statement_conf = select(Configuracion).where(Configuracion.user_id == current_user.id)
    config = session.exec(statement_conf).first()

    if not config:
        raise HTTPException(
            status_code=404, 
            detail="No se encontró el registro de configuración para este usuario."
        )

    try:
        # 4. PROCESO DE ACTIVACIÓN (Transaccional)
        
        # A. Quemar la licencia del inventario
        licencia_db.usada = True
        licencia_db.fecha_uso = datetime.now()
        licencia_db.comprador_email = current_user.email
        
        # B. Actualizar la cuenta del usuario a PRO
        config.fecha_vencimiento = datetime.now() + timedelta(days=365)
        config.plan_tipo = "PRO_ANNUAL"
        config.es_prueba = False
        config.licencia_activa = True
        config.license_key = licencia_db.codigo # Guardamos la llave activa

        # Guardar cambios
        session.add(licencia_db)
        session.add(config)
        session.commit()
        session.refresh(config)

        return {
            "status": "success",
            "message": "¡Licencia activada con éxito! Tu plan ahora es Profesional.",
            "valido_hasta": config.fecha_vencimiento.strftime("%Y-%m-%d"),
            "license_key": config.license_key
        }

    except Exception as e:
        session.rollback()
        print(f"ERROR EN UPGRADE: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Error interno al procesar la activación."
        )
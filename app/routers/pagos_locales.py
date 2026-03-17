# app/routers/pagos_locales.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, desc
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.db.database import get_session
from app.models.user import User
from app.models.configuracion import Configuracion
from app.auth.auth_bearer import get_current_user
from app.models.pago_local import PagoLocal

router = APIRouter(tags=["Pagos Locales"])

class ReportePago(BaseModel):
    referencia: str
    fecha_pago: str
    banco_emisor: str
    monto_bs: float

# ==========================================
# 1. EL RECEPTOR
# ==========================================
@router.post("/pagos-locales/reportar")
def reportar_pago(
    reporte: ReportePago, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)
    
    statement = select(PagoLocal).where(PagoLocal.referencia == reporte.referencia)
    pago_existente = session.exec(statement).first()
    if pago_existente:
        raise HTTPException(status_code=400, detail="Esta referencia ya fue reportada.")

    nuevo_pago = PagoLocal(
        user_id=current_user.id,
        email_usuario=current_user.email,
        referencia=reporte.referencia,
        fecha_pago=reporte.fecha_pago,
        banco_emisor=reporte.banco_emisor,
        monto_bs=reporte.monto_bs
    )
    
    session.add(nuevo_pago)
    session.commit()
    session.refresh(nuevo_pago)
    
    return {"mensaje": "Reporte recibido", "estatus": "PENDIENTE", "id_pago": nuevo_pago.id}

# ==========================================
# 2. EL RADAR
# ==========================================
@router.get("/pagos-locales")
def obtener_pagos_locales(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)
    
    statement = select(PagoLocal).order_by(desc(PagoLocal.id))
    pagos = session.exec(statement).all()
    return pagos

# ==========================================
# 3. EL MARTILLO DE APROBACIÓN MEJORADO
# ==========================================
@router.put("/pagos-locales/{pago_id}/aprobar")
def aprobar_pago(
    pago_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)

    pago = session.get(PagoLocal, pago_id)
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    
    if pago.estatus == "APROBADO":
        raise HTTPException(status_code=400, detail="Este pago ya fue aprobado.")

    # 1. Marcamos el ticket de pago como APROBADO
    pago.estatus = "APROBADO"
    session.add(pago)

    # 2. Actualizamos el Acta de Nacimiento (User)
    usuario = session.get(User, pago.user_id)
    if usuario:
        usuario.plan_tipo = "PRO_ANNUAL"
        usuario.es_prueba = False
        session.add(usuario)

    # 3. 🚀 LA MAGIA: Actualizamos el Carnet del Club (Configuracion) y sumamos 1 año
    statement = select(Configuracion).where(Configuracion.user_id == pago.user_id)
    config = session.exec(statement).first()
    
    if config:
        config.plan_tipo = "PRO_ANNUAL"
        config.es_prueba = False
        config.fecha_vencimiento = datetime.now() + timedelta(days=365) # ¡Le sumamos 1 año exacto!
        session.add(config)
    else:
        # Por si el usuario es tan nuevo que no tenía carnet, le imprimimos uno con datos por defecto
        nueva_config = Configuracion(
            user_id=pago.user_id,
            nombre_agencia="Agencia de " + pago.email_usuario.split('@')[0], 
            license_key="LICENCIA-PRO-ACTIVA",
            plan_tipo="PRO_ANNUAL",
            es_prueba=False,
            fecha_vencimiento=datetime.now() + timedelta(days=365)
        )
        session.add(nueva_config)

    session.commit()
    return {"mensaje": f"Pago aprobado. El usuario {pago.email_usuario} ahora tiene Licencia PRO por 1 año."}

# ==========================================
# 4. LA GUILLOTINA
# ==========================================
@router.put("/pagos-locales/{pago_id}/rechazar")
def rechazar_pago(
    pago_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)

    pago = session.get(PagoLocal, pago_id)
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    
    pago.estatus = "RECHAZADO"
    session.add(pago)
    session.commit()
    
    return {"mensaje": "Pago rechazado exitosamente."}
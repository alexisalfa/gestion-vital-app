# app/routers/pagos_locales.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from app.db.database import get_session
from app.models.user import User
from app.auth.auth_bearer import get_current_user
from app.models.pago_local import PagoLocal

router = APIRouter(tags=["Pagos Locales"])

# El paquete que esperamos recibir desde React
class ReportePago(BaseModel):
    referencia: str
    fecha_pago: str
    banco_emisor: str
    monto_bs: float

@router.post("/pagos-locales/reportar")
def reportar_pago(
    reporte: ReportePago, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)
    
    # 🛡️ Seguridad anti-trampas: Verificamos que no usen la misma referencia dos veces
    statement = select(PagoLocal).where(PagoLocal.referencia == reporte.referencia)
    pago_existente = session.exec(statement).first()
    if pago_existente:
        raise HTTPException(status_code=400, detail="Esta referencia ya fue reportada anteriormente.")

    # Guardamos el reporte en la tabla
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
# app/routers/pagos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

# Importamos tu conexión a BD
from app.db.database import get_session 

# Importamos los modelos
from app.models.pago import PagoPoliza
from app.models.poliza import Poliza
from app.models.comision import Comision

# Importamos el esquema
from app.schemas.pago import PagoPolizaCreate 

router = APIRouter()

@router.post("/")
def registrar_pago_poliza(pago: PagoPolizaCreate, db: Session = Depends(get_session)):
    
    # 1. Buscamos la póliza a la que le están pagando
    poliza = db.exec(select(Poliza).where(Poliza.id == pago.poliza_id)).first()
    
    if not poliza:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")

    # 🚨 NUEVA REGLA DE NEGOCIO ESTRICTA 🚨
    # Buscamos quién es el asesor de esta póliza
    asesor_vinculado = getattr(poliza, 'id_asesor', None) or getattr(poliza, 'asesor_id', None)

    # Si NO hay asesor, bloqueamos todo el proceso inmediatamente
    if not asesor_vinculado:
        raise HTTPException(
            status_code=400, 
            detail="ERROR: Operación rechazada. Esta póliza no tiene un asesor asignado. Por favor, edita la póliza y asígnale un asesor antes de registrar el cobro para garantizar el pago de la comisión."
        )

    # --- SI PASA LA VALIDACIÓN, CONTINUAMOS CON EL COBRO ---

    # 2. Creamos el registro del recibo
    nuevo_pago = PagoPoliza(
        poliza_id=pago.poliza_id,
        monto=pago.monto,
        metodo_pago=pago.metodo_pago,
        referencia=pago.referencia,
        fecha_pago=pago.fecha_pago,
        notas=pago.notas
    )
    db.add(nuevo_pago)

    # 3. IMPACTO AUTOMÁTICO 1: Cambiamos la póliza a 'Activa'
    poliza.estado = "Activa"
    db.add(poliza) 

    # 4. 🚀 IMPACTO AUTOMÁTICO 2: GENERACIÓN DE LA COMISIÓN 🚀
    # Ya sabemos que el asesor existe, así que Pylance y el sistema están seguros
    asesor_id_seguro: int = int(asesor_vinculado)
    poliza_id_seguro: int = int(poliza.id) # type: ignore

    porcentaje_comision = 10.0 
    monto_calculado = (pago.monto * porcentaje_comision) / 100.0

    nueva_comision = Comision(
        tipo_comision="porcentaje",
        valor_comision=porcentaje_comision,
        monto_base=pago.monto,
        monto_final=monto_calculado,
        estatus_pago="pendiente",
        user_id=poliza.user_id,
        id_asesor=asesor_id_seguro, 
        id_poliza=poliza_id_seguro, 
        observaciones="Generada automáticamente por el pago de la prima"
    )
    db.add(nueva_comision)

    # 5. Guardamos todo junto en la BD
    try:
        db.commit()
        db.refresh(nuevo_pago)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error guardando la transacción completa: {str(e)}")

    return {
        "mensaje": "Pago registrado y comisión generada exitosamente", 
        "pago_id": nuevo_pago.id,
        "nuevo_estado": poliza.estado
    }
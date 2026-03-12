# app/routers/comisiones.py
import csv
import io
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import List, Optional, Any, cast

from app.db.database import get_session
from app.models.comision import Comision
from app.schemas.comision import ComisionCreate, ComisionRead
from app.models.poliza import Poliza 
from app.models.Asesores import Asesores 
from app.models.user import User
from app.auth.auth_bearer import get_current_user
from app.auth.license_handler import verificar_licencia_activa

router = APIRouter(
    prefix="/comisiones",
    tags=["Comisiones"]
)

# --- 1. CREAR COMISIÓN (POST) ---
@router.post("", response_model=ComisionRead, status_code=status.HTTP_201_CREATED)
def create_comision(
    comision_in: ComisionCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    poliza = session.exec(
        select(Poliza).where(Poliza.id == comision_in.id_poliza, Poliza.user_id == current_user.id)
    ).first()
    if not poliza:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    
    asesor = session.exec(
        select(Asesores).where(Asesores.id == comision_in.id_asesor, Asesores.user_id == current_user.id)
    ).first()
    if not asesor:
        raise HTTPException(status_code=404, detail="Asesor no encontrado")

    monto_final = comision_in.monto_final
    if comision_in.tipo_comision == "porcentaje":
        if comision_in.monto_base is not None and comision_in.valor_comision is not None:
            monto_final = (comision_in.monto_base * comision_in.valor_comision) / 100
    elif comision_in.tipo_comision == "fijo":
        monto_final = comision_in.valor_comision

    db_comision = Comision.model_validate(
        comision_in, 
        update={"monto_final": monto_final, "user_id": current_user.id}
    )
    
    session.add(db_comision)
    session.commit()
    session.refresh(db_comision)
    return db_comision

# --- 2. IMPORTACIÓN MASIVA (CSV) ---
@router.post("/importar")
async def importar_comisiones(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="El archivo debe ser formato .csv")
    
    try:
        content = await file.read()
        decoded_content = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded_content))
        
        importados = 0
        for row in reader:
            # Corrección Pylance: Conversión de fecha str a datetime
            fecha_str = row.get('fecha_generacion', '')
            fecha_dt = datetime.strptime(fecha_str, '%Y-%m-%d') if fecha_str else datetime.now()

            nueva_comision = Comision(
                id_asesor=int(row['id_asesor']),
                id_poliza=int(row['id_poliza']),
                tipo_comision=row['tipo_comision'],
                valor_comision=float(row['valor_comision']),
                monto_base=float(row.get('monto_base', 0)),
                monto_final=float(row['monto_final']),
                fecha_generacion=fecha_dt,
                estatus_pago=row.get('estatus_pago', 'pendiente'),
                user_id=current_user.id
            )
            session.add(nueva_comision)
            importados += 1
        
        session.commit()
        return {"message": f"Éxito: {importados} comisiones importadas."}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error en CSV: {str(e)}")

# --- 3. ACTUALIZAR COMISIÓN (PUT) ---
@router.put("/{comision_id}", response_model=ComisionRead)
def update_comision(
    comision_id: int,
    comision_in: ComisionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    db_comision = session.exec(
        select(Comision).where(Comision.id == comision_id, Comision.user_id == current_user.id)
    ).first()
    
    if not db_comision:
        raise HTTPException(status_code=404, detail="Comisión no encontrada")
    
    update_data = comision_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_comision, key, value)
    
    session.add(db_comision)
    session.commit()
    session.refresh(db_comision)
    return db_comision

# --- 4. LISTAR COMISIONES (GET) ---
@router.get("", response_model=List[ComisionRead])
def read_comisiones(
    offset: int = 0,
    limit: int = Query(default=10, le=100),
    id_asesor: Optional[int] = None,
    estatus_pago: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    query = select(Comision).where(Comision.user_id == current_user.id).options(
        selectinload(cast(Any, Comision.asesor)),
        selectinload(cast(Any, Comision.poliza))
    )
    
    if id_asesor:
        query = query.where(Comision.id_asesor == id_asesor)
    if estatus_pago:
        query = query.where(Comision.estatus_pago == estatus_pago)
    
    comisiones = session.exec(query.offset(offset).limit(limit)).all()
    return comisiones

# --- 5. ELIMINAR COMISIÓN (DELETE) ---
@router.delete("/{comision_id}")
def delete_comision(
    comision_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    statement = select(Comision).where(Comision.id == comision_id, Comision.user_id == current_user.id)
    comision = session.exec(statement).first()
    
    if not comision:
        raise HTTPException(status_code=404, detail="Comisión no encontrada")
        
    session.delete(comision)
    session.commit()
    return {"ok": True}

# --- 6. PAGO RÁPIDO DE COMISIÓN (PATCH) ---
@router.patch("/{id}/pagar")
def liquidar_comision_rapida(
    id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    # Buscamos la comisión asegurándonos de que pertenezca al usuario actual
    comision = session.exec(
        select(Comision).where(Comision.id == id, Comision.user_id == current_user.id)
    ).first()
    
    if not comision:
        raise HTTPException(status_code=404, detail="Comisión no encontrada")
    
    if comision.estatus_pago and comision.estatus_pago.lower() == "pagada":
        raise HTTPException(status_code=400, detail="Esta comisión ya fue pagada anteriormente")

    # Actualizamos estado y guardamos la fecha de hoy
    comision.estatus_pago = "pagada"
    comision.fecha_pago = datetime.now()
    
    session.add(comision)
    session.commit()
    session.refresh(comision)
    
    return {"mensaje": "Comisión liquidada exitosamente", "nuevo_estado": comision.estatus_pago}
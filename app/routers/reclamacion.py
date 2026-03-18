# app/routers/reclamacion.py
import csv
import io
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlmodel import Session, select
from pydantic import BaseModel # Para el esquema de actualización rápida

from app.db.database import get_session
from app.models.reclamacion import Reclamacion
from app.models.poliza import Poliza
from app.auth.license_handler import verificar_licencia_activa
from app.models.user import User  
from app.auth.auth_bearer import get_current_user 

from app.schemas.reclamacion import ReclamacionCreate, ReclamacionRead, ReclamacionUpdate
from app.crud.reclamacion import (
    crear_reclamacion,
    listar_reclamaciones,
    obtener_reclamacion_por_id,
    actualizar_reclamacion,
    eliminar_reclamacion
)

router = APIRouter(
    prefix="/reclamaciones",
    tags=["Reclamaciones"]
)

# --- ESQUEMA PARA LA ACCIÓN RÁPIDA (APROBAR/RECHAZAR) ---
class ReclamacionEstadoUpdate(BaseModel):
    estado_reclamacion: str  # 'Pagada' o 'Rechazada'
    monto_aprobado: float = 0.0

# --- 1. CREAR RECLAMACIÓN (POST) ---
@router.post("/", response_model=ReclamacionRead, status_code=status.HTTP_201_CREATED)
def crear_nueva_reclamacion(
    reclamacion_data: ReclamacionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    # Validar que la póliza pertenezca al usuario antes de crear la reclamación
    statement = select(Poliza).where(
        Poliza.id == reclamacion_data.poliza_id, 
        Poliza.user_id == current_user.id
    )
    poliza = session.exec(statement).first()
    
    if not poliza:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Póliza no encontrada o no le pertenece."
        )

    try:
        return crear_reclamacion(session, reclamacion_data, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error al crear reclamación: {e}"
        )

# --- 🚀 2. NUEVO: CIERRE RÁPIDO (PATCH) ---
@router.patch("/{id}/estado")
def actualizar_estado_reclamacion(
    id: int, 
    datos: ReclamacionEstadoUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)

    # Buscamos el siniestro asegurando que sea del usuario actual
    reclamacion = session.exec(
        select(Reclamacion).where(Reclamacion.id == id, Reclamacion.user_id == current_user.id)
    ).first()
    
    if not reclamacion:
        raise HTTPException(status_code=404, detail="Siniestro no encontrado")
        
    estado_limpio = datos.estado_reclamacion.capitalize()
    
    if estado_limpio not in ["Pendiente", "Pagada", "Rechazada"]:
        raise HTTPException(status_code=400, detail="Estado no válido")

    reclamacion.estado_reclamacion = estado_limpio
    
    if estado_limpio == "Pagada":
        reclamacion.monto_aprobado = datos.monto_aprobado
    elif estado_limpio == "Rechazada":
        reclamacion.monto_aprobado = 0.0
        
    session.add(reclamacion)
    session.commit()
    session.refresh(reclamacion)
    
    return reclamacion

# --- 3. LISTAR RECLAMACIONES (GET) ---
@router.get("/", response_model=List[ReclamacionRead])
def obtener_todas_las_reclamaciones(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)
        
    return listar_reclamaciones(session, user_id=current_user.id)

# --- 4. OBTENER UNA (GET ID) ---
@router.get("/{reclamacion_id}", response_model=ReclamacionRead)
def obtener_reclamacion(
    reclamacion_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)
        
    reclamacion = obtener_reclamacion_por_id(session, reclamacion_id, user_id=current_user.id)
    if not reclamacion:
        raise HTTPException(status_code=404, detail="Reclamación no encontrada")
    return reclamacion

# --- 5. ACTUALIZAR COMPLETO (PUT) ---
@router.put("/{reclamacion_id}", response_model=ReclamacionRead)
def actualizar_reclamacion_existente(
    reclamacion_id: int,
    reclamacion_data: ReclamacionUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)
        
    reclamacion_actualizada = actualizar_reclamacion(
        session, reclamacion_id, reclamacion_data, user_id=current_user.id
    )
    if not reclamacion_actualizada:
        raise HTTPException(status_code=404, detail="Reclamación no encontrada")
    return reclamacion_actualizada

# --- 6. ELIMINAR (DELETE) ---
@router.delete("/{reclamacion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_reclamacion_existente(
    reclamacion_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)
        
    eliminado = eliminar_reclamacion(session, reclamacion_id, user_id=current_user.id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Reclamación no encontrada")
    return None

# --- 7. NUEVO: IMPORTACIÓN MASIVA (POST) ---
@router.post("/importar")
async def importar_reclamaciones_csv(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="El archivo debe ser formato .csv")
    
    try:
        content = await file.read()
        decoded_content = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded_content))
        
        headers = [h.strip().lower() for h in reader.fieldnames or []]
        reader.fieldnames = headers

        importados = 0
        errores = 0

        for row in reader:
            try:
                poliza_str = str(row.get('poliza_id') or '0').strip()
                cliente_str = str(row.get('cliente_id') or '0').strip()
                
                nueva_reclamacion = Reclamacion(
                    descripcion=str(row.get('descripcion', 'Siniestro importado')).strip(),
                    fecha_siniestro=datetime.strptime(str(row.get('fecha_siniestro', '')).strip(), '%Y-%m-%d'),
                    fecha_reclamacion=datetime.strptime(str(row.get('fecha_reclamacion', '')).strip(), '%Y-%m-%d'),
                    monto_reclamado=float(str(row.get('monto_reclamado', '0')).strip()),
                    monto_aprobado=float(str(row.get('monto_aprobado', '0')).strip()),
                    estado_reclamacion=str(row.get('estado_reclamacion', 'Pendiente')).strip().capitalize(),
                    poliza_id=int(poliza_str),
                    cliente_id=int(cliente_str),
                    user_id=current_user.id
                )
                session.add(nueva_reclamacion)
                importados += 1
            except Exception:
                errores += 1
                continue

        session.commit()
        return {"message": f"Proceso completado: {importados} siniestros importados, {errores} omitidos (errores de formato)."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo: {str(e)}")
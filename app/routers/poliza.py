# app/routers/poliza.py
from typing import List
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, and_

from app.db.database import get_session
from app.models.poliza import Poliza 
from app.models.cliente import Cliente 
from app.auth.license_handler import verificar_licencia_activa
from app.auth.auth_bearer import get_current_user
from app.models.user import User

from app.schemas.poliza import PolizaCreate, PolizaRead, PolizaUpdate
from app.crud.poliza import (
    crear_poliza,
    listar_polizas,
    obtener_poliza_por_id,
    actualizar_poliza,
    eliminar_poliza
)

router = APIRouter(tags=["Pólizas"])

### **1. Ruta para Pólizas Próximas a Vencer (Dashboard)**
@router.get("/proximas_a_vencer", response_model=List[PolizaRead])
def obtener_polizas_proximas_a_vencer(
    days_out: int = 30, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa) # Bloqueo
    
):
    # Validación de seguridad para Pylance
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    hoy = date.today()
    limite = hoy + timedelta(days=days_out)

    # Filtramos por rango de fecha Y por dueño de la póliza
    statement = select(Poliza).where(
        and_(
            Poliza.fecha_fin >= hoy,
            Poliza.fecha_fin <= limite,
            Poliza.user_id == current_user.id
        )
    )
    
    results = session.exec(statement).all()
    return list(results)

### **2. Rutas Estándar de Pólizas**

@router.post("/polizas", response_model=PolizaRead, status_code=status.HTTP_201_CREATED)
def crear_nueva_poliza(
    poliza_data: PolizaCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="No autorizado")

    # Verificamos que el cliente exista Y le pertenezca a este usuario logueado
    # Esto evita que un usuario cree pólizas para clientes ajenos
    cliente_statement = select(Cliente).where(
        Cliente.id == poliza_data.cliente_id, 
        Cliente.user_id == current_user.id
    )
    cliente = session.exec(cliente_statement).first()

    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado o no le pertenece."
        )
    
    try:
        # Pasamos el user_id para que la póliza se guarde con dueño
        return crear_poliza(session, poliza_data, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.get("/polizas", response_model=List[PolizaRead])
def obtener_todas_las_polizas(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")
    
    # Delegamos el filtrado al CRUD
    return listar_polizas(session, user_id=current_user.id)

@router.get("/polizas/{poliza_id}", response_model=PolizaRead)
def obtener_poliza(
    poliza_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    poliza = obtener_poliza_por_id(session, poliza_id, user_id=current_user.id)
    if not poliza:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    return poliza

@router.put("/polizas/{poliza_id}", response_model=PolizaRead)
def actualizar_poliza_existente(
    poliza_id: int,
    poliza_data: PolizaUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    poliza_actualizada = actualizar_poliza(session, poliza_id, poliza_data, user_id=current_user.id)
    if not poliza_actualizada:
        raise HTTPException(status_code=404, detail="Póliza no encontrada o sin permisos")
    return poliza_actualizada

@router.delete("/polizas/{poliza_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_poliza_existente(
    poliza_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    eliminado = eliminar_poliza(session, poliza_id, user_id=current_user.id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    return None
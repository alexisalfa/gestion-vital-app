# app/routers/asesores.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db.database import get_session 
from app.models.Asesores import Asesores
from app.models.user import User
from app.auth.license_check import verificar_licencia_activa # Importación añadida
from app.auth.auth_bearer import get_current_user
from sqlalchemy.exc import IntegrityError
from typing import List

router = APIRouter(tags=["Asesores"])

@router.get("/asesores", response_model=List[Asesores])
def obtener_asesores(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa) # Bloqueo de licencia
):
    try:
        statement = select(Asesores).where(Asesores.user_id == current_user.id)
        results = session.exec(statement).all()
        return list(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/asesores", status_code=status.HTTP_201_CREATED, response_model=Asesores)
def crear_asesor(
    asesor: Asesores, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa) # Bloqueo de licencia
):
    if current_user.id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no válido")
    try:
        asesor.id = None 
        asesor.user_id = current_user.id
        session.add(asesor)
        session.commit()
        session.refresh(asesor)
        return asesor
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/asesores/{asesor_id}")
def eliminar_asesor(
    asesor_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa) # Bloqueo de licencia
):
    statement = select(Asesores).where(Asesores.id == asesor_id, Asesores.user_id == current_user.id)
    asesor = session.exec(statement).first()
    if not asesor:
        raise HTTPException(status_code=404, detail="Asesor no encontrado")
    session.delete(asesor)
    session.commit()
    return {"message": "Asesor eliminado"}

@router.put("/asesores/{asesor_id}")
def actualizar_asesor(
    asesor_id: int, 
    asesor_data: Asesores, # Cambiado a Asesores (Plural)
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    # Buscamos el asesor asegurando que le pertenece a este usuario
    statement = select(Asesores).where(Asesores.id == asesor_id, Asesores.user_id == current_user.id) # Cambiado a Asesores
    db_asesor = session.exec(statement).first()
    
    if not db_asesor:
        raise HTTPException(status_code=404, detail="Asesor no encontrado o sin permisos")
    
    # Extraemos y aplicamos los cambios
    update_data = asesor_data.model_dump(exclude_unset=True)
    update_data.pop("id", None) 
    update_data.pop("user_id", None)

    for key, value in update_data.items():
        setattr(db_asesor, key, value)
        
    session.add(db_asesor)
    session.commit()
    session.refresh(db_asesor)
    
    return db_asesor
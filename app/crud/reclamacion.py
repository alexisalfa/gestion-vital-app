# app/crud/reclamacion.py

from typing import List, Optional
from sqlmodel import Session, select
from app.models.reclamacion import Reclamacion
from app.schemas.reclamacion import ReclamacionCreate, ReclamacionUpdate

def crear_reclamacion(session: Session, reclamacion_data: ReclamacionCreate, user_id: int) -> Reclamacion:
    """Crea una nueva reclamación vinculada al usuario logueado."""
    db_reclamacion = Reclamacion.model_validate(reclamacion_data, update={"user_id": user_id})
     
    session.add(db_reclamacion)
    session.commit()
    session.refresh(db_reclamacion)
    return db_reclamacion

def listar_reclamaciones(session: Session, user_id: int) -> List[Reclamacion]:
    """Obtiene la lista de reclamaciones filtrada por el dueño actual."""
    statement = select(Reclamacion).where(Reclamacion.user_id == user_id) 
    return list(session.exec(statement).all())

def obtener_reclamacion_por_id(session: Session, reclamacion_id: int, user_id: int) -> Optional[Reclamacion]:
    """Obtiene una reclamación específica solo si pertenece al usuario logueado."""
    statement = select(Reclamacion).where(
        Reclamacion.id == reclamacion_id, 
        Reclamacion.user_id == user_id
    )
    return session.exec(statement).first()

def actualizar_reclamacion(session: Session, reclamacion_id: int, reclamacion_data: ReclamacionUpdate, user_id: int) -> Optional[Reclamacion]:
    """Actualiza una reclamación existente solo si el usuario es el dueño."""
    # Usamos obtener_reclamacion_por_id para validar la propiedad antes de actualizar
    db_reclamacion = obtener_reclamacion_por_id(session, reclamacion_id, user_id)
    
    if not db_reclamacion:
        return None

    update_data = reclamacion_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_reclamacion, key, value)

    session.add(db_reclamacion)
    session.commit()
    session.refresh(db_reclamacion)
    return db_reclamacion

def eliminar_reclamacion(session: Session, reclamacion_id: int, user_id: int) -> bool:
    """Elimina una reclamación solo si pertenece al usuario que lo solicita."""
    # Verificamos propiedad antes de borrar
    reclamacion = obtener_reclamacion_por_id(session, reclamacion_id, user_id)
    if reclamacion:
        session.delete(reclamacion)
        session.commit()
        return True
    return False
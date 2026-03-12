# app/crud/poliza.py

from typing import List, Optional
from sqlmodel import Session, select
from app.models.poliza import Poliza
from app.schemas.poliza import PolizaCreate, PolizaUpdate

# --- Función para Crear una Póliza ---
def crear_poliza(session: Session, poliza_data: PolizaCreate, user_id: int) -> Poliza:
    """Crea una nueva póliza vinculada al usuario logueado."""
    
    # CORRECCIÓN: Inyectamos el user_id durante la validación para que Pydantic
    # no arroje error por campo faltante.
    db_poliza = Poliza.model_validate(poliza_data, update={"user_id": user_id})
    
    session.add(db_poliza)
    session.commit()
    session.refresh(db_poliza)
    return db_poliza

# --- Función para Obtener una Póliza por ID ---
def obtener_poliza_por_id(session: Session, poliza_id: int, user_id: int) -> Optional[Poliza]:
    """Obtiene una póliza específica solo si pertenece al usuario logueado."""
    statement = select(Poliza).where(
        Poliza.id == poliza_id, 
        Poliza.user_id == user_id
    )
    return session.exec(statement).first()

# --- Función para Listar Pólizas ---
def listar_polizas(session: Session, user_id: int) -> List[Poliza]:
    """Obtiene la lista de pólizas filtrada por el dueño actual."""
    statement = select(Poliza).where(Poliza.user_id == user_id)
    results = session.exec(statement).all()
    # Convertimos a list() para evitar avisos de Pylance (Sequence -> List)
    return list(results)

# --- Función para Actualizar una Póliza ---
def actualizar_poliza(session: Session, poliza_id: int, poliza_data: PolizaUpdate, user_id: int) -> Optional[Poliza]:
    """Actualiza una póliza existente solo si el usuario es el dueño."""
    # Usamos la función obtener_poliza_por_id que ya tiene el filtro de seguridad
    db_poliza = obtener_poliza_por_id(session, poliza_id, user_id)
    
    if not db_poliza:
        return None

    # Extraemos solo los datos enviados
    update_data = poliza_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_poliza, key, value)

    session.add(db_poliza)
    session.commit()
    session.refresh(db_poliza)
    return db_poliza

# --- Función para Eliminar una Póliza ---
def eliminar_poliza(session: Session, poliza_id: int, user_id: int) -> bool:
    """Elimina una póliza solo si pertenece al usuario que lo solicita."""
    # Verificamos propiedad antes de borrar
    poliza = obtener_poliza_por_id(session, poliza_id, user_id)
    if poliza:
        session.delete(poliza)
        session.commit()
        return True
    return False
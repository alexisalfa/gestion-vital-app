# app/crud/cliente.py
from sqlmodel import Session, select
from typing import List, Optional 

# Importamos el modelo de base de datos
from app.models.cliente import Cliente

# Importamos los esquemas Pydantic
from app.schemas.cliente import ClienteCreate, ClienteUpdate

# --- FUNCIONES DE CREACIÓN (CREATE) ---

def crear_cliente(session: Session, cliente_data: ClienteCreate, user_id: int) -> Cliente:
    """Crea un nuevo cliente asignándole obligatoriamente un dueño (user_id)."""
    # Convertimos el esquema a modelo
    db_cliente = Cliente.model_validate(cliente_data)
    
    # ASIGNACIÓN DE PROPIEDAD: El motor de la privacidad
    db_cliente.user_id = user_id 
    
    session.add(db_cliente)
    session.commit()
    session.refresh(db_cliente) 
    return db_cliente

# --- FUNCIONES DE LECTURA (READ) ---

def obtener_cliente_por_id(session: Session, cliente_id: int, user_id: int) -> Optional[Cliente]:
    """Obtiene un cliente específico solo si pertenece al usuario logueado."""
    # Filtramos por ID de cliente Y por ID de usuario
    statement = select(Cliente).where(Cliente.id == cliente_id, Cliente.user_id == user_id)
    return session.exec(statement).first()

def listar_clientes(session: Session, user_id: int) -> List[Cliente]:
    """FILTRO DE PRIVACIDAD: Obtiene solo los clientes que pertenecen al user_id proporcionado."""
    statement = select(Cliente).where(Cliente.user_id == user_id)
    # Convertimos a list() para que Pylance no se queje del tipo Sequence
    results = session.exec(statement).all()
    return list(results)

# --- FUNCIONES DE ACTUALIZACIÓN (UPDATE) ---

def actualizar_cliente(session: Session, cliente_id: int, cliente_data: ClienteUpdate, user_id: int) -> Optional[Cliente]:
    """Actualiza un cliente solo si el usuario actual es el dueño."""
    # Buscamos el cliente usando la función que ya filtra por dueño
    db_cliente = obtener_cliente_por_id(session, cliente_id, user_id)
    
    if not db_cliente:
        return None 

    # Extraemos solo los datos que el usuario envió realmente
    update_data = cliente_data.model_dump(exclude_unset=True) 

    for key, value in update_data.items():
        setattr(db_cliente, key, value) 

    session.add(db_cliente)
    session.commit()
    session.refresh(db_cliente)
    return db_cliente

# --- FUNCIONES DE ELIMINACIÓN (DELETE) ---

def eliminar_cliente(session: Session, cliente_id: int, user_id: int) -> bool:
    """Elimina un cliente solo si pertenece al usuario que lo solicita."""
    # Verificamos propiedad antes de borrar
    cliente = obtener_cliente_por_id(session, cliente_id, user_id)
    if cliente:
        session.delete(cliente)
        session.commit()
        return True
    return False
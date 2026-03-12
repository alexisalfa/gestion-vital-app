# app/models/cliente.py
from sqlmodel import SQLModel, Field, Relationship, UniqueConstraint
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .poliza import Poliza
    from .user import User

class Cliente(SQLModel, table=True):
    # Solución al error de Pylance:
    __tablename__: str = "cliente"  # type: ignore 
    
    # --- NUEVA REGLA DE NEGOCIO ---
    # Un asesor no puede repetir cédula, pero asesores distintos sí pueden tener al mismo cliente.
    __table_args__ = (UniqueConstraint("user_id", "identificacion", name="uq_asesor_cliente"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    apellido: str
    # IMPORTANTE: Se removió el unique=True de aquí para permitir el aislamiento por asesor
    identificacion: str = Field(index=True) 
    email: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[str] = None

    # --- PRIVACIDAD ---
    # Vinculamos al corredor (User)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # --- RELACIONES ---
    polizas: List["Poliza"] = Relationship(back_populates="cliente")
    user: Optional["User"] = Relationship()
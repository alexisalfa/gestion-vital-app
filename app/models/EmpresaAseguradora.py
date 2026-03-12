# app/models/EmpresaAseguradora.py
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .poliza import Poliza
    from .user import User # Importación para el dueño

class EmpresaAseguradora(SQLModel, table=True):
    __tablename__: str = "empresaaseguradora" 

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    rif: str = Field(unique=True, index=True)
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email_contacto: Optional[str] = None

    # Campo de privacidad para el sistema SaaS
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")

    # Relaciones
    polizas: List["Poliza"] = Relationship(back_populates="empresa")
    user: Optional["User"] = Relationship() # Relación con el dueño
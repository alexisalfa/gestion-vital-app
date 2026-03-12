# app/models/Asesores.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.EmpresaAseguradora import EmpresaAseguradora
    from app.models.user import User # Importante para la relación

class Asesores(SQLModel, table=True):
    __tablename__: str = "asesores"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    apellido: str
    email: str
    telefono: str
    cedula: str
    
    # Campo de privacidad
    user_id: Optional[int] = Field(default=None, foreign_key="user.id") 
    
    empresa_aseguradora_id: Optional[int] = Field(default=None, foreign_key="empresaaseguradora.id")
    empresa_aseguradora: Optional["EmpresaAseguradora"] = Relationship()
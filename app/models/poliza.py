from typing import List, Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

# Esto evita la importación circular en tiempo de ejecución
if TYPE_CHECKING:
    from .EmpresaAseguradora import EmpresaAseguradora
    from .cliente import Cliente
    from .reclamacion import Reclamacion
    from .Asesores import Asesores  # Asegúrate de que el nombre del archivo sea correcto

class Poliza(SQLModel, table=True):
    __tablename__: str = "poliza"

    id: Optional[int] = Field(default=None, primary_key=True)
    numero_poliza: str = Field(unique=True, index=True)
    
    # Campos para coincidir con el Schema y el Frontend
    tipo_poliza: str = Field(max_length=50)
    prima: float = Field(default=0.0)
    estado: str = Field(default="Activa", max_length=20)
    
    # Fechas (importante: deben ser TIMESTAMP en Postgres)
    fecha_inicio: datetime
    fecha_fin: datetime 
    
    # El campo que causaba el Error 500 por estar ausente
    fecha_creacion: datetime = Field(default_factory=datetime.now)

    # Relación con Empresa
    empresa_id: int = Field(foreign_key="empresaaseguradora.id")
    empresa: "EmpresaAseguradora" = Relationship(back_populates="polizas")

    # Relación con Cliente
    cliente_id: int = Field(foreign_key="cliente.id")
    cliente: "Cliente" = Relationship(back_populates="polizas")

    # Relación con Asesores (apuntando a la tabla plural 'asesores')
    asesor_id: Optional[int] = Field(default=None, foreign_key="asesores.id")
    # asesor: Optional["Asesor"] = Relationship(back_populates="polizas") # Opcional si tienes la relación inversa

    # Relación con Reclamaciones
    reclamaciones: List["Reclamacion"] = Relationship(back_populates="poliza")
    user_id: int = Field(foreign_key="user.id")
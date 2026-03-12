# app/models/comision.py
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

# Importamos TYPE_CHECKING para evitar importaciones circulares
if TYPE_CHECKING:
    from .poliza import Poliza
    from .Asesores import Asesores
    from .user import User  # Añadimos la referencia al modelo de Usuario

class Comision(SQLModel, table=True):
    __tablename__: str = "comision"

    id: Optional[int] = Field(default=None, primary_key=True)
    tipo_comision: str  # 'porcentaje' o 'fijo'
    valor_comision: float
    monto_base: Optional[float] = None
    monto_final: float
    fecha_generacion: datetime = Field(default_factory=datetime.now)
    fecha_pago: Optional[datetime] = None
    estatus_pago: str = Field(default="pendiente")
    observaciones: Optional[str] = None

    # --- CAMPO CRÍTICO PARA LA PRIVACIDAD ---
    # Este campo permite que cada corredor vea solo SUS comisiones
    user_id: Optional[int] = Field(default=None, foreign_key="user.id") 

    # Relaciones de clave foránea
    id_asesor: int = Field(foreign_key="asesores.id")
    id_poliza: int = Field(foreign_key="poliza.id")

    # Relaciones inversas para facilitar las consultas con selectinload
    asesor: Optional["Asesores"] = Relationship()
    poliza: Optional["Poliza"] = Relationship()
    user: Optional["User"] = Relationship() # Relación opcional con el dueño
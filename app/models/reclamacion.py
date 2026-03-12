from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime # Importa datetime

if TYPE_CHECKING:
    from .poliza import Poliza
    from .reclamacion import Reclamacion

class Reclamacion(SQLModel, table=True):
    __tablename__: str = "reclamacion" 

    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
    fecha_siniestro: datetime
    fecha_reclamacion: datetime
    monto_reclamado: float
    monto_aprobado: float
    estado_reclamacion: str = Field(default="Pendiente")
    
    poliza_id: int = Field(foreign_key="poliza.id")
    cliente_id: int = Field(foreign_key="cliente.id")
    
    # NUEVO: Campo de auditoría y privacidad
    user_id: int = Field(foreign_key="user.id") #
    
    poliza: Optional["Poliza"] = Relationship(back_populates="reclamaciones")
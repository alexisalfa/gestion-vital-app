# app/models/pago_local.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class PagoLocal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    email_usuario: str  # Guardamos el correo para que tú (CEO) sepas rápido quién pagó
    referencia: str
    fecha_pago: str
    banco_emisor: str
    monto_bs: float
    estatus: str = Field(default="PENDIENTE") # Puede ser: PENDIENTE, APROBADO o RECHAZADO
    fecha_reporte: datetime = Field(default_factory=datetime.utcnow)
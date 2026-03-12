from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class LicenciaDisponible(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(unique=True, index=True)
    usada: bool = Field(default=False)
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    fecha_uso: Optional[datetime] = Field(default=None)
    comprador_email: Optional[str] = Field(default=None) # Registro de quién la activó
# app/models/parametro_global.py
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class ParametroGlobal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tasa_bcv: float = Field(default=36.25)
    precio_licencia: float = Field(default=99.00)
    # NUEVOS CAMPOS DE AUDITORÍA
    fuente_tasa: str = Field(default="SISTEMA_INICIAL")
    ultima_actualizacion: datetime = Field(default_factory=datetime.utcnow)

# NUEVA TABLA: El libro mayor de auditoría (Histórico)
class HistorialTasa(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    moneda_base: str = Field(default="USD")
    moneda_destino: str = Field(default="VES")
    tasa: float
    fuente: str  # Ej: "BCV_API" o "MANUAL_CEO"
    fecha: datetime = Field(default_factory=datetime.utcnow)
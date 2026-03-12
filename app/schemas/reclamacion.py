# app/schemas/reclamacion.py
from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime # <--- Esto es clave

class ReclamacionBase(BaseModel):
    descripcion: str
    fecha_siniestro: datetime    # <--- CAMBIA str POR datetime
    fecha_reclamacion: datetime  # <--- CAMBIA str POR datetime
    monto_reclamado: float
    monto_aprobado: float
    estado_reclamacion: str
    poliza_id: int
    cliente_id: int

class ReclamacionCreate(ReclamacionBase):
    pass

class ReclamacionUpdate(BaseModel):
    descripcion: Optional[str] = None
    fecha_siniestro: Optional[datetime] = None # <--- También aquí
    fecha_reclamacion: Optional[datetime] = None # <--- También aquí
    monto_reclamado: Optional[float] = None
    monto_aprobado: Optional[float] = None
    estado_reclamacion: Optional[str] = None
    poliza_id: Optional[int] = None
    cliente_id: Optional[int] = None

class ReclamacionRead(ReclamacionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
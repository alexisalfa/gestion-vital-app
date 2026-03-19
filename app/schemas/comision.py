# app/schemas/comision.py
from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ComisionBase(BaseModel):
    id_asesor: int
    id_poliza: int
    tipo_comision: str
    valor_comision: float
    monto_base: Optional[float] = None
    monto_final: Optional[float] = None
    fecha_generacion: datetime
    fecha_pago: Optional[datetime] = None
    estatus_pago: str
    observaciones: Optional[str] = None

class ComisionCreate(ComisionBase):
    pass

# --- INJERTO: CREADO PARA PERMITIR EDICIONES PARCIALES ---
class ComisionUpdate(BaseModel):
    id_asesor: Optional[int] = None
    id_poliza: Optional[int] = None
    tipo_comision: Optional[str] = None
    valor_comision: Optional[float] = None
    monto_base: Optional[float] = None
    monto_final: Optional[float] = None
    fecha_generacion: Optional[datetime] = None
    fecha_pago: Optional[datetime] = None
    estatus_pago: Optional[str] = None
    observaciones: Optional[str] = None

class ComisionRead(ComisionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
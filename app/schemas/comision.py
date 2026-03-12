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

class ComisionRead(ComisionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
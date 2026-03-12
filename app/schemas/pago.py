from pydantic import BaseModel
from typing import Optional
from datetime import date

class PagoPolizaCreate(BaseModel):
    poliza_id: int
    monto: float
    metodo_pago: str
    referencia: Optional[str] = None
    fecha_pago: date
    notas: Optional[str] = None
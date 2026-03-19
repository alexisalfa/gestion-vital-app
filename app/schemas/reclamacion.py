# app/schemas/reclamacion.py
from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime 
from app.schemas.cliente import ClienteRead # <-- Importamos esto para leer el nombre

class ReclamacionBase(BaseModel):
    descripcion: str
    fecha_siniestro: datetime    
    fecha_reclamacion: datetime  
    monto_reclamado: float
    monto_aprobado: float
    estado_reclamacion: str
    poliza_id: int
    cliente_id: int

class ReclamacionCreate(ReclamacionBase):
    pass

class ReclamacionUpdate(BaseModel):
    descripcion: Optional[str] = None
    fecha_siniestro: Optional[datetime] = None 
    fecha_reclamacion: Optional[datetime] = None 
    monto_reclamado: Optional[float] = None
    monto_aprobado: Optional[float] = None
    estado_reclamacion: Optional[str] = None
    poliza_id: Optional[int] = None
    cliente_id: Optional[int] = None

class ReclamacionRead(ReclamacionBase):
    id: int
    cliente: Optional[ClienteRead] = None # <-- Permite que React lea reclamacion.cliente.nombre
    
    model_config = ConfigDict(from_attributes=True)
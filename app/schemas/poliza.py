# app/schemas/poliza.py
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from app.schemas.cliente import ClienteRead

class PolizaBase(BaseModel):
    numero_poliza: str = Field(min_length=5, max_length=50)
    tipo_poliza: str = Field(max_length=50)
    fecha_inicio: datetime
    fecha_fin: datetime
    prima: float = Field(ge=0)
    
    # --- CAMPOS DE COBERTURA FINANCIERA ---
    suma_asegurada: float | None = 0.0
    deducible: float | None = 0.0
    
    estado: Optional[str] = Field(default="Activa", max_length=20)
    cliente_id: int
    empresa_id: int 
    asesor_id: Optional[int] = None

class PolizaCreate(PolizaBase):
    pass

class PolizaUpdate(BaseModel):
    numero_poliza: Optional[str] = None
    tipo_poliza: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    prima: Optional[float] = None
    estado: Optional[str] = None
    cliente_id: Optional[int] = None
    empresa_id: Optional[int] = None
    asesor_id: Optional[int] = None
    
    # --- 🚀 AQUÍ ESTABA EL BLOQUEO: AHORA EL PORTERO LOS DEJA PASAR ---
    suma_asegurada: Optional[float] = None
    deducible: Optional[float] = None

class PolizaRead(PolizaBase):
    id: int
    fecha_creacion: datetime
    cliente: Optional[ClienteRead] = None 
    
    model_config = ConfigDict(from_attributes=True)
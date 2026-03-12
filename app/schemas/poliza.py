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
    estado: Optional[str] = Field(default="Activa", max_length=20)
    cliente_id: int
    empresa_id: int # <-- ¡FALTABA ESTE CAMPO! Importante para vincular con la aseguradora
    asesor_id: Optional[int] = None

class PolizaCreate(PolizaBase):
    pass

class PolizaUpdate(BaseModel):
    # (Todos opcionales como los tienes)
    pass

class PolizaRead(PolizaBase):
    id: int
    fecha_creacion: datetime
    cliente: Optional[ClienteRead] = None # Información del cliente anidada
    
    model_config = ConfigDict(from_attributes=True)
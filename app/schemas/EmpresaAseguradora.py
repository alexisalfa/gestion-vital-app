from pydantic import BaseModel, ConfigDict
from typing import Optional

class EmpresaAseguradoraBase(BaseModel):
    nombre: str
    rif: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None

class EmpresaAseguradoraCreate(EmpresaAseguradoraBase):
    pass

class EmpresaAseguradoraRead(EmpresaAseguradoraBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
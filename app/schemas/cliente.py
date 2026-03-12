# app/schemas/cliente.py

from pydantic import BaseModel, Field
from typing import Optional

class ClienteBase(BaseModel):
    nombre: str
    apellido: str
    # El alias permite recibir "cedula" del frontend y usar "identificacion" internamente
    identificacion: str = Field(..., alias="cedula")
    email: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[str] = None

    class Config:
        # Permite que el modelo funcione con el nombre del campo o el alias
        populate_by_name = True

class ClienteCreate(ClienteBase):
    pass

class ClienteRead(ClienteBase):
    id: int

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    identificacion: Optional[str] = Field(None, alias="cedula")
    email: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[str] = None

    class Config:
        populate_by_name = True
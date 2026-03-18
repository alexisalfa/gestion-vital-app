# app/models/documento.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Documento(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    url_archivo: str
    tipo: str  # Ej: 'poliza', 'identidad', 'recibo', 'otro'
    
    # Relaciones para saber a quién pertenece el archivo
    cliente_id: Optional[int] = Field(default=None, foreign_key="cliente.id")
    poliza_id: Optional[int] = Field(default=None, foreign_key="poliza.id")
    user_id: int = Field(foreign_key="user.id")
    
    fecha_subida: datetime = Field(default_factory=datetime.utcnow)
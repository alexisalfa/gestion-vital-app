# app/models/parametro_global.py
from typing import Optional
from sqlmodel import SQLModel, Field

class ParametroGlobal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tasa_bcv: float = Field(default=36.25)
    precio_licencia: float = Field(default=99.00)
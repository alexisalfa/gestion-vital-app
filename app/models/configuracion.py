from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Configuracion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre_agencia: str
    licencia_activa: bool = Field(default=True)
    fecha_vencimiento: datetime
    plan_tipo: str = Field(default="trial") # "TRIAL_24H" o "PRO_ANNUAL"
    
    # Campo comercial para la matrícula única
    license_key: str = Field(unique=True, index=True) 
    
    # Para lógica de marketing/ventas
    es_prueba: bool = Field(default=True)
    
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
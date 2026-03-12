from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date

# =====================================================================
# 1. PAGO DE SUSCRIPCIÓN (TU DINERO - SaaS)
# Lo dejamos intacto para que no se rompa tu integración con PayPal
# =====================================================================
class Pago(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    monto: float
    moneda: str = "USD"
    referencia_pasarela: str = Field(unique=True) # ID de transacción de PayPal
    estado: str = "completado"
    fecha_pago: datetime = Field(default_factory=datetime.now)


# =====================================================================
# 2. PAGO DE PÓLIZAS (EL DINERO DEL CORREDOR / ASEGURADORA)
# Nueva tabla para los registros manuales (Zelle, Pago Móvil, etc.)
# =====================================================================
class PagoPoliza(SQLModel, table=True):
    __tablename__ = "pagos_polizas" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    # CORRECCIÓN: Quitamos la 's' para que coincida con tu base de datos
    poliza_id: int = Field(foreign_key="poliza.id") 
    monto: float
    metodo_pago: str  # 'Zelle', 'Pago Movil', 'Transferencia', etc.
    referencia: Optional[str] = Field(default=None)
    fecha_pago: date  # Usamos date porque es un recibo manual
    notas: Optional[str] = Field(default=None)
    estado: str = Field(default="procesado")
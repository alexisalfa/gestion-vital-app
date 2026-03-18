# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import create_db_and_tables
from app.models.parametro_global import ParametroGlobal, HistorialTasa
from app.models.pago_local import PagoLocal
import os
from dotenv import load_dotenv

load_dotenv()

from app.routers import (
    cliente, 
    poliza, 
    reclamacion, 
    EmpresaAseguradora, 
    auth,
    statistics,
    asesores,
    comisiones,
    configuracion,
    license_management,
    payments,
    pagos,
    pagos_locales,
    documentos
)

app = FastAPI(
    title="Insurtech API",
    description="API modular para gestión de correduría de seguros",
    version="1.0.0"
)

# --- CONFIGURACIÓN DE CORS ---
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://127.0.0.1:5173","https://gestion-vital.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- REGISTRO DE ROUTERS ---
# Mantenemos un orden lógico de carga
app.include_router(auth.router, prefix="/api/v1") 
app.include_router(cliente.router, prefix="/api/v1")
app.include_router(poliza.router, prefix="/api/v1")
app.include_router(reclamacion.router, prefix="/api/v1")
app.include_router(EmpresaAseguradora.router, prefix="/api/v1")
app.include_router(statistics.router, prefix="/api/v1")
app.include_router(asesores.router, prefix="/api/v1")
app.include_router(comisiones.router, prefix="/api/v1") # Nota: Quitamos el doble comisiones del prefix
app.include_router(configuracion.router, prefix="/api/v1")
app.include_router(license_management.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(pagos.router, prefix="/api/v1/pagos", tags=["Pagos"])
app.include_router(pagos_locales.router, prefix="/api/v1")
app.include_router(documentos.router, prefix="/api/v1")

# Ruta de verificación de salud
@app.get("/", tags=["Salud"])
def health_check():
    return {
        "status": "online",
        "message": "Insurtech API modular funcionando correctamente",
        "comercial_mode": "Trial 24h Active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
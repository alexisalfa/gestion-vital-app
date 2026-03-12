from fastapi import APIRouter

from app.routers import (
    cliente, 
    poliza, 
    reclamacion, 
    EmpresaAseguradora, 
    license,
    auth,
    statistics,
    asesores
)

api_router = APIRouter()

# Aquí centralizamos todos los módulos bajo el estándar de la industria
api_router.include_router(cliente.router)
api_router.include_router(statistics.router)
api_router.include_router(poliza.router)
api_router.include_router(EmpresaAseguradora.router)
api_router.include_router(asesores.router)
# Cuando agregues 'siniestros' o 'pagos', solo los añades aquí una vez.
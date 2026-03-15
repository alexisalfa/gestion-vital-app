# app/routers/configuracion.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from datetime import datetime
from app.db.database import get_session
from app.models.configuracion import Configuracion
from app.models.user import User
from app.auth.auth_bearer import get_current_user

# Importamos los nuevos modelos
from app.models.parametro_global import ParametroGlobal, HistorialTasa 

router = APIRouter(tags=["Configuración"])

class ParametrosUpdate(BaseModel):
    tasa_bcv: float
    precio_licencia: float

# ==========================================
# RUTAS DE CONFIGURACIÓN DEL USUARIO (Se mantienen igual)
# ==========================================
@router.get("/configuracion", response_model=Configuracion)
def obtener_configuracion(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if current_user.id is None: raise HTTPException(status_code=401)
    statement = select(Configuracion).where(Configuracion.user_id == current_user.id)
    config = session.exec(statement).first()
    if not config: raise HTTPException(status_code=404, detail="No se encontró configuración")
    return config

@router.put("/configuracion")
def actualizar_configuracion(config_data: Configuracion, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if current_user.id is None: raise HTTPException(status_code=401)
    statement = select(Configuracion).where(Configuracion.user_id == current_user.id)
    db_config = session.exec(statement).first()
    if not db_config:
        config_data.user_id = current_user.id
        session.add(config_data)
        db_config = config_data
    else:
        data = config_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            if key != "user_id": setattr(db_config, key, value)
        session.add(db_config)
    session.commit()
    session.refresh(db_config)
    return db_config

# ==========================================
# LA BÓVEDA DEL CEO Y EL CURRENCY ENGINE
# ==========================================
@router.get("/parametros-globales")
def obtener_parametros_globales(session: Session = Depends(get_session)):
    statement = select(ParametroGlobal)
    parametros = session.exec(statement).first()
    if not parametros:
        parametros = ParametroGlobal(tasa_bcv=36.25, precio_licencia=99.00)
        session.add(parametros)
        session.commit()
        session.refresh(parametros)
    return parametros

@router.put("/parametros-globales")
def actualizar_parametros_globales(
    datos: ParametrosUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id is None: raise HTTPException(status_code=401)

    statement = select(ParametroGlobal)
    parametros_db = session.exec(statement).first()

    fuente_actualizacion = "MANUAL_CEO" # Como entra por este endpoint (Frontend), sabemos que fuiste tú

    # 1. Actualizamos los parámetros globales
    if not parametros_db:
        parametros_db = ParametroGlobal(
            tasa_bcv=datos.tasa_bcv, 
            precio_licencia=datos.precio_licencia,
            fuente_tasa=fuente_actualizacion,
            ultima_actualizacion=datetime.utcnow()
        )
        session.add(parametros_db)
    else:
        parametros_db.tasa_bcv = datos.tasa_bcv
        parametros_db.precio_licencia = datos.precio_licencia
        parametros_db.fuente_tasa = fuente_actualizacion
        parametros_db.ultima_actualizacion = datetime.utcnow()
        session.add(parametros_db)

    # 2. Guardamos la evidencia en el Historial (Auditoría)
    nuevo_historial = HistorialTasa(
        moneda_base="USD",
        moneda_destino="VES",
        tasa=datos.tasa_bcv,
        fuente=fuente_actualizacion
    )
    session.add(nuevo_historial)

    session.commit()
    session.refresh(parametros_db)
    return parametros_db

# --- NUEVO: MICROSERVICIO FINTECH DE CONVERSIÓN ---
@router.get("/convert")
def convert_currency(amount: float, from_currency: str = "USD", to_currency: str = "VES", db: Session = Depends(get_session)):
    
    # Buscamos la tasa actual en la bóveda
    statement = select(ParametroGlobal)
    parametros = db.exec(statement).first()
    
    if not parametros:
        raise HTTPException(status_code=500, detail="Tasas de cambio no configuradas en el sistema")

    # Lógica del motor de conversión
    rate = 1.0
    if from_currency == "USD" and to_currency == "VES":
        rate = parametros.tasa_bcv
    elif from_currency == "VES" and to_currency == "USD":
        rate = 1 / parametros.tasa_bcv
    else:
        raise HTTPException(status_code=400, detail=f"Conversión de {from_currency} a {to_currency} no soportada aún")

    resultado = round(amount * rate, 2)

    return {
        "amount": amount,
        "from": from_currency,
        "to": to_currency,
        "rate": rate,
        "source": parametros.fuente_tasa,
        "last_updated": parametros.ultima_actualizacion,
        "result": resultado
    }
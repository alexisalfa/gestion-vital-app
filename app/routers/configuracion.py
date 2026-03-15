# app/routers/configuracion.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel  
from app.db.database import get_session
from app.models.configuracion import Configuracion
from app.models.user import User
from app.auth.auth_bearer import get_current_user
from app.models.parametro_global import ParametroGlobal 

router = APIRouter(tags=["Configuración"])

# ==========================================
# MOLDE RECEPTOR (SCHEMA PARA EVITAR EL ERROR 422)
# ==========================================
class ParametrosUpdate(BaseModel):
    tasa_bcv: float
    precio_licencia: float

# ==========================================
# RUTAS DE CONFIGURACIÓN DEL USUARIO
# ==========================================
@router.get("/configuracion", response_model=Configuracion)
def obtener_configuracion(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)

    statement = select(Configuracion).where(Configuracion.user_id == current_user.id)
    config = session.exec(statement).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="No se encontró configuración")
    
    return config

@router.put("/configuracion")
def actualizar_configuracion(
    config_data: Configuracion,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)

    statement = select(Configuracion).where(Configuracion.user_id == current_user.id)
    db_config = session.exec(statement).first()

    if not db_config:
        config_data.user_id = current_user.id
        session.add(config_data)
        db_config = config_data
    else:
        data = config_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            if key != "user_id": 
                setattr(db_config, key, value)
        session.add(db_config)
    
    session.commit()
    session.refresh(db_config)
    return db_config

# ==========================================
# RUTAS GLOBALES DE LA BÓVEDA DEL CEO
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
    datos: ParametrosUpdate,  # Usamos el molde receptor aquí
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)

    statement = select(ParametroGlobal)
    parametros_db = session.exec(statement).first()

    if not parametros_db:
        nuevo_parametro = ParametroGlobal(tasa_bcv=datos.tasa_bcv, precio_licencia=datos.precio_licencia)
        session.add(nuevo_parametro)
        session.commit()
        session.refresh(nuevo_parametro)
        return nuevo_parametro
    else:
        parametros_db.tasa_bcv = datos.tasa_bcv
        parametros_db.precio_licencia = datos.precio_licencia
        session.add(parametros_db)
        session.commit()
        session.refresh(parametros_db)
        return parametros_db
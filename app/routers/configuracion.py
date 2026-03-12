from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.configuracion import Configuracion
from app.models.user import User
from app.auth.auth_bearer import get_current_user

router = APIRouter(tags=["Configuración"])

@router.get("/configuracion", response_model=Configuracion)
def obtener_configuracion(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)

    # Buscamos la configuración que pertenece al usuario logueado
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

    # Buscamos la existente
    statement = select(Configuracion).where(Configuracion.user_id == current_user.id)
    db_config = session.exec(statement).first()

    if not db_config:
        # Si no existe, la creamos
        config_data.user_id = current_user.id
        session.add(config_data)
        db_config = config_data
    else:
        # Si existe, actualizamos solo lo que viene en el body
        data = config_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            if key != "user_id": # El dueño no cambia
                setattr(db_config, key, value)
        session.add(db_config)
    
    session.commit()
    session.refresh(db_config)
    return db_config
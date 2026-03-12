from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.user import User 
from app.models.configuracion import Configuracion
from app.auth.utils import generar_codigo_licencia 
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter(tags=["Autenticación"])

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = "Usuario Nuevo"
    nombre_agencia: Optional[str] = "Mi Agencia de Seguros"
    tipo_registro: Optional[str] = "prueba" 

@router.post("/register")
def register_user(user_data: UserRegister, session: Session = Depends(get_session)):
    # 1. Verificar si el usuario ya existe
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")
    
    # 2. Crear el nuevo usuario
    new_user = User(
        email=user_data.email, 
        hashed_password=user_data.password, 
        full_name=user_data.full_name
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # --- SOLUCIÓN PARA PYLANCE ---
    # Verificamos explícitamente que el ID no sea None. 
    # Esto "asegura" a Pylance que a partir de aquí, new_user.id es un 'int'.
    if new_user.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Error al generar el ID de usuario"
        )
    # -----------------------------

    # 3. LÓGICA COMERCIAL DE LICENCIA
    if user_data.tipo_registro == "prueba":
        vencimiento = datetime.now() + timedelta(hours=24)
        plan = "TRIAL_24H"
        es_trial = True
    else:
        vencimiento = datetime.now() + timedelta(days=365)
        plan = "PRO_ANNUAL"
        es_trial = False

    # Ahora Pylance ya no marcará error aquí porque ya validamos el ID arriba
    codigo_licencia = generar_codigo_licencia(new_user.id)

    agencia_final = user_data.nombre_agencia if user_data.nombre_agencia else "Agencia Sin Nombre"
    
    nueva_config = Configuracion(
        nombre_agencia=agencia_final,
        licencia_activa=True,
        fecha_vencimiento=vencimiento,
        plan_tipo=plan,
        license_key=codigo_licencia,
        es_prueba=es_trial,
        user_id=new_user.id
    )
    
    session.add(nueva_config)
    session.commit()
    
    return {
        "message": f"Registro exitoso. Plan: {plan}",
        "license_key": codigo_licencia,
        "expires_at": vencimiento.strftime("%Y-%m-%d %H:%M:%S")
    }

@router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()

    if not user or user.hashed_password != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Otro check rápido para el login por si acaso
    if user.id is None:
         raise HTTPException(status_code=500, detail="Error de consistencia de datos")

    return {
        "access_token": user.email, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }
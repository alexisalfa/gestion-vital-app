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
import requests  # <-- NUEVO: Para comunicarnos con Google
import secrets   # <-- NUEVO: Para crear contraseñas seguras automáticas

router = APIRouter(tags=["Autenticación"])

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = "Usuario Nuevo"
    nombre_agencia: Optional[str] = "Mi Agencia de Seguros"
    tipo_registro: Optional[str] = "prueba" 

# --- NUEVO INJERTO: MODELO PARA RECIBIR EL TOKEN DE GOOGLE ---
class GoogleAuthRequest(BaseModel):
    access_token: str
# -----------------------------------------------------------

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

    if new_user.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Error al generar el ID de usuario"
        )

    # 3. LÓGICA COMERCIAL DE LICENCIA
    if user_data.tipo_registro == "prueba":
        vencimiento = datetime.now() + timedelta(hours=24)
        plan = "TRIAL_24H"
        es_trial = True
    else:
        vencimiento = datetime.now() + timedelta(days=365)
        plan = "PRO_ANNUAL"
        es_trial = False

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

# --- NUEVO INJERTO: LA ADUANA DE GOOGLE ---
@router.post("/google-login")
def google_login(request: GoogleAuthRequest, session: Session = Depends(get_session)):
    # 1. Llamamos a Google para validar el token
    google_response = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {request.access_token}"}
    )
    
    if google_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Token de Google inválido o expirado.")
        
    user_info = google_response.json()
    google_email = user_info.get("email")
    full_name = user_info.get("name", "Usuario Google")
    
    if not google_email:
        raise HTTPException(status_code=400, detail="Google no proporcionó un correo válido.")

    # 2. Verificamos si tú (o el usuario) ya existen en la base de datos
    statement = select(User).where(User.email == google_email)
    user = session.exec(statement).first()

    # 3. Si no existe, lo creamos automáticamente (Magia SaaS)
    if not user:
        # Le generamos una contraseña aleatoria ultra segura (como ingresa con Google, no la necesita)
        random_password = secrets.token_urlsafe(20) 
        user = User(
            email=google_email,
            hashed_password=random_password, 
            full_name=full_name
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
        if user.id is None:
            raise HTTPException(status_code=500, detail="Error creando usuario de Google")
            
        # Le damos su licencia de prueba de 24H
        vencimiento = datetime.now() + timedelta(hours=24)
        codigo_licencia = generar_codigo_licencia(user.id)
        nueva_config = Configuracion(
            nombre_agencia=f"Agencia de {full_name}",
            licencia_activa=True,
            fecha_vencimiento=vencimiento,
            plan_tipo="TRIAL_24H",
            license_key=codigo_licencia,
            es_prueba=True,
            user_id=user.id
        )
        session.add(nueva_config)
        session.commit()

    # 4. Tanto si ya existía como si es nuevo, le entregamos la llave de la Bóveda
    return {
        "access_token": user.email, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }
# ------------------------------------------
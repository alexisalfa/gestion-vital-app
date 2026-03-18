# app/routers/documentos.py
import os
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List

from app.db.database import get_session
from app.models.documento import Documento
from app.models.user import User
from app.auth.auth_bearer import get_current_user

router = APIRouter(prefix="/documentos", tags=["Gestor Documental"])

# Le decimos a Python que busque las llaves en tu archivo .env
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

@router.post("/")
async def subir_documento(
    file: UploadFile = File(...),
    nombre: str = Form(...),
    tipo: str = Form(...),
    cliente_id: int = Form(None),
    poliza_id: int = Form(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # --- ESCUDO ANTI-PYLANCE ---
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no autorizado")
    # ---------------------------

    try:
        # 1. Enviamos el archivo a la nube de Cloudinary
        result = cloudinary.uploader.upload(file.file, resource_type="auto")
        url_segura = result.get("secure_url")

        # 2. Guardamos el link en nuestra Base de Datos
        nuevo_doc = Documento(
            nombre=nombre,
            url_archivo=url_segura,
            tipo=tipo,
            cliente_id=cliente_id,
            poliza_id=poliza_id,
            user_id=current_user.id # Pylance ya sabe que aquí hay un INT seguro
        )
        session.add(nuevo_doc)
        session.commit()
        session.refresh(nuevo_doc)
        return nuevo_doc
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir archivo: {str(e)}")

@router.get("/cliente/{cliente_id}")
def listar_documentos_cliente(
    cliente_id: int, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    # --- ESCUDO ANTI-PYLANCE ---
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no autorizado")
    # ---------------------------

    docs = session.exec(
        select(Documento).where(Documento.cliente_id == cliente_id, Documento.user_id == current_user.id)
    ).all()
    return docs
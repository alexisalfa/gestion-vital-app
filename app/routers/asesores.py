# app/routers/asesores.py
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlmodel import Session, select
from app.db.database import get_session 
from app.models.Asesores import Asesores
from app.models.user import User
from app.models.poliza import Poliza
from app.models.comision import Comision
from app.auth.license_check import verificar_licencia_activa 
from app.auth.auth_bearer import get_current_user
from sqlalchemy.exc import IntegrityError
from typing import List

router = APIRouter(tags=["Asesores"])

@router.get("/asesores", response_model=List[Asesores])
def obtener_asesores(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa) 
):
    try:
        statement = select(Asesores).where(Asesores.user_id == current_user.id)
        results = session.exec(statement).all()
        return list(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/asesores", status_code=status.HTTP_201_CREATED, response_model=Asesores)
def crear_asesor(
    asesor: Asesores, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa) 
):
    if current_user.id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no válido")
    try:
        asesor.id = None 
        asesor.user_id = current_user.id
        session.add(asesor)
        session.commit()
        session.refresh(asesor)
        return asesor
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/asesores/{asesor_id}")
def eliminar_asesor(
    asesor_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa) 
):
    statement = select(Asesores).where(Asesores.id == asesor_id, Asesores.user_id == current_user.id)
    asesor = session.exec(statement).first()
    if not asesor:
        raise HTTPException(status_code=404, detail="Asesor no encontrado")
    session.delete(asesor)
    session.commit()
    return {"message": "Asesor eliminado"}

@router.put("/asesores/{asesor_id}")
def actualizar_asesor(
    asesor_id: int, 
    asesor_data: Asesores, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    statement = select(Asesores).where(Asesores.id == asesor_id, Asesores.user_id == current_user.id) 
    db_asesor = session.exec(statement).first()
    
    if not db_asesor:
        raise HTTPException(status_code=404, detail="Asesor no encontrado o sin permisos")
    
    update_data = asesor_data.model_dump(exclude_unset=True)
    update_data.pop("id", None) 
    update_data.pop("user_id", None)

    for key, value in update_data.items():
        setattr(db_asesor, key, value)
        
    session.add(db_asesor)
    session.commit()
    session.refresh(db_asesor)
    
    return db_asesor

# --- 🚀 NUEVO: IMPORTACIÓN MASIVA DE ASESORES ---
@router.post("/asesores/import/csv")
async def importar_asesores_csv(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401)
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Debe ser archivo .csv")
    
    try:
        content = await file.read()
        decoded = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded))
        headers = [h.strip().lower() for h in reader.fieldnames or []]
        reader.fieldnames = headers

        importados = 0
        errores = 0
        
        for row in reader:
            try:
                cedula = str(row.get('cedula', '')).strip()
                if not cedula:
                    errores += 1
                    continue
                
                # Evitamos asesores duplicados por cédula
                existe = session.exec(select(Asesores).where(Asesores.cedula == cedula, Asesores.user_id == current_user.id)).first()
                if existe:
                    errores += 1
                    continue
                
                empresa_id_str = str(row.get('empresa_aseguradora_id', '')).strip()
                empresa_id = int(empresa_id_str) if empresa_id_str and empresa_id_str.isdigit() else None

                nuevo = Asesores(
                    nombre=str(row.get('nombre', '')).strip(),
                    apellido=str(row.get('apellido', '')).strip(),
                    cedula=cedula,
                    email=str(row.get('email', '')).strip(),
                    telefono=str(row.get('telefono', '')).strip(),
                    empresa_aseguradora_id=empresa_id,
                    user_id=current_user.id
                )
                session.add(nuevo)
                importados += 1
            except Exception:
                errores += 1
                continue
                
        session.commit()
        return {"message": f"{importados} asesores importados, {errores} omitidos (duplicados)."}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 🚀 NUEVO: PERFIL COMERCIAL 360° PARA ASESORES ---
@router.get("/asesores/{asesor_id}/360")
def obtener_asesor_360(
    asesor_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    asesor = session.exec(select(Asesores).where(Asesores.id == asesor_id, Asesores.user_id == current_user.id)).first()
    if not asesor:
        raise HTTPException(status_code=404, detail="Asesor no encontrado")

    # Extraemos el rendimiento del asesor (Pólizas vendidas y Comisiones generadas)
    polizas = session.exec(select(Poliza).where(Poliza.asesor_id == asesor_id, Poliza.user_id == current_user.id)).all()
    comisiones = session.exec(select(Comision).where(Comision.id_asesor == asesor_id, Comision.user_id == current_user.id)).all()

    return {
        "asesor": asesor,
        "polizas": polizas,
        "comisiones": comisiones
    }
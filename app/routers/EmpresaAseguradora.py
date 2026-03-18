# app/routers/EmpresaAseguradora.py
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from typing import List

from app.db.database import get_session
from app.models.EmpresaAseguradora import EmpresaAseguradora
from app.models.user import User
from app.models.poliza import Poliza # 🚀 IMPORTANTE PARA EL 360
from app.auth.auth_bearer import get_current_user
from app.auth.license_handler import verificar_licencia_activa

router = APIRouter(tags=["Empresas Aseguradoras"])

@router.post("/empresas-aseguradoras", status_code=status.HTTP_201_CREATED, response_model=EmpresaAseguradora)
def crear_aseguradora(
    empresa: EmpresaAseguradora, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user), 
    _licencia = Depends(verificar_licencia_activa)  
):
    try:
        empresa.id = None
        empresa.user_id = current_user.id 
        
        session.add(empresa)
        session.commit()
        session.refresh(empresa)
        return empresa
    except IntegrityError as e:
        session.rollback()
        error_msg = str(e.orig).lower()
        if "unique" in error_msg or "duplicada" in error_msg:
            raise HTTPException(
                status_code=400,
                detail=f"El RIF '{empresa.rif}' ya está registrado."
            )
        raise HTTPException(
            status_code=500, 
            detail="Error interno al guardar la empresa aseguradora"
        )

@router.get("/empresas-aseguradoras", response_model=List[EmpresaAseguradora])
def listar_aseguradoras(
    offset: int = 0, 
    limit: int = 9999, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user), 
    _licencia = Depends(verificar_licencia_activa)  
):
    statement = (
        select(EmpresaAseguradora)
        .where(EmpresaAseguradora.user_id == current_user.id)
        .offset(offset)
        .limit(limit)
    )
    results = session.exec(statement).all()
    return list(results)

@router.delete("/empresas-aseguradoras/{empresa_id}")
def eliminar_aseguradora(
    empresa_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    statement = select(EmpresaAseguradora).where(
        EmpresaAseguradora.id == empresa_id, 
        EmpresaAseguradora.user_id == current_user.id
    )
    empresa = session.exec(statement).first()
    
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada o no tiene permisos")
    
    session.delete(empresa)
    session.commit()
    return {"message": "Empresa eliminada correctamente"}

@router.put("/empresas-aseguradoras/{empresa_id}")
def actualizar_empresa(
    empresa_id: int, 
    empresa_data: EmpresaAseguradora, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    statement = select(EmpresaAseguradora).where(EmpresaAseguradora.id == empresa_id, EmpresaAseguradora.user_id == current_user.id)
    db_empresa = session.exec(statement).first()
    
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada o sin permisos")
    
    update_data = empresa_data.model_dump(exclude_unset=True)
    update_data.pop("id", None) 
    update_data.pop("user_id", None)

    for key, value in update_data.items():
        setattr(db_empresa, key, value)
        
    session.add(db_empresa)
    session.commit()
    session.refresh(db_empresa)
    return db_empresa

# --- 🚀 NUEVO: IMPORTACIÓN MASIVA ---
@router.post("/empresas-aseguradoras/import/csv")
async def importar_aseguradoras_csv(
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
                rif = str(row.get('rif', '')).strip()
                if not rif:
                    errores += 1
                    continue
                
                # Evitar duplicados
                existe = session.exec(select(EmpresaAseguradora).where(EmpresaAseguradora.rif == rif, EmpresaAseguradora.user_id == current_user.id)).first()
                if existe:
                    errores += 1
                    continue
                
                nueva = EmpresaAseguradora(
                    nombre=str(row.get('nombre', '')).strip(),
                    rif=rif,
                    direccion=str(row.get('direccion', '')).strip(),
                    telefono=str(row.get('telefono', '')).strip(),
                    email_contacto=str(row.get('email_contacto', '')).strip(),
                    user_id=current_user.id
                )
                session.add(nueva)
                importados += 1
            except Exception:
                errores += 1
                continue
                
        session.commit()
        return {"message": f"{importados} aseguradoras importadas, {errores} omitidas (duplicadas)."}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 🚀 NUEVO: PERFIL 360° PARA ASEGURADORAS ---
@router.get("/empresas-aseguradoras/{empresa_id}/360")
def obtener_aseguradora_360(
    empresa_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    # Buscamos la aseguradora
    empresa = session.exec(select(EmpresaAseguradora).where(EmpresaAseguradora.id == empresa_id, EmpresaAseguradora.user_id == current_user.id)).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Aseguradora no encontrada")

    # Buscamos TODAS las pólizas que nuestra agencia ha vendido de esta aseguradora
    polizas = session.exec(select(Poliza).where(Poliza.empresa_id == empresa_id, Poliza.user_id == current_user.id)).all()

    return {
        "empresa": empresa,
        "polizas": polizas
    }
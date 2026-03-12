# app/routers/EmpresaAseguradora.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from typing import List
from app.db.database import get_session
from app.models.EmpresaAseguradora import EmpresaAseguradora
from app.models.user import User
from app.auth.auth_bearer import get_current_user
from app.auth.license_handler import verificar_licencia_activa

# Quitamos el prefijo de aquí para que main.py lo controle globalmente
router = APIRouter(tags=["Empresas Aseguradoras"])

@router.post("/empresas-aseguradoras", status_code=status.HTTP_201_CREATED, response_model=EmpresaAseguradora)
def crear_aseguradora(
    empresa: EmpresaAseguradora, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user), # Inyectar usuario para seguridad
    _licencia = Depends(verificar_licencia_activa)  # Validar licencia activa
):
    try:
        empresa.id = None
        empresa.user_id = current_user.id # Asignamos el dueño automáticamente (Usuario 2)
        
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
    current_user: User = Depends(get_current_user), # Filtro de seguridad
    _licencia = Depends(verificar_licencia_activa)  # Validar licencia activa
):
    # FILTRO CRÍTICO: Solo traemos las empresas donde el user_id coincida con el logueado
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
    # Buscamos la empresa asegurándonos de que pertenezca al usuario
    statement = select(EmpresaAseguradora).where(
        EmpresaAseguradora.id == empresa_id, 
        EmpresaAseguradora.user_id == current_user.id
    )
    empresa = session.exec(statement).first()
    
    if not empresa:
        raise HTTPException(
            status_code=404, 
            detail="Empresa no encontrada o no tiene permisos para eliminarla"
        )
    
    session.delete(empresa)
    session.commit()
    return {"message": "Empresa aseguradora eliminada correctamente"}
@router.put("/{empresa_id}")
def actualizar_empresa(
    empresa_id: int, 
    empresa_data: EmpresaAseguradora, # O el nombre de tu modelo/schema
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    # Buscamos la empresa asegurando que le pertenece a este usuario
    statement = select(EmpresaAseguradora).where(EmpresaAseguradora.id == empresa_id, EmpresaAseguradora.user_id == current_user.id)
    db_empresa = session.exec(statement).first()
    
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada o sin permisos")
    
    # Extraemos y aplicamos los cambios
    update_data = empresa_data.model_dump(exclude_unset=True)
    update_data.pop("id", None) 
    update_data.pop("user_id", None)

    for key, value in update_data.items():
        setattr(db_empresa, key, value)
        
    session.add(db_empresa)
    session.commit()
    session.refresh(db_empresa)
    
    return db_empresa
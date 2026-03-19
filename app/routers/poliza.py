# app/routers/poliza.py
import csv
import io
from typing import List
from datetime import date, timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlmodel import Session, select, and_

from app.db.database import get_session
from app.models.poliza import Poliza 
from app.models.cliente import Cliente 
from app.auth.license_handler import verificar_licencia_activa
from app.auth.auth_bearer import get_current_user
from app.models.user import User

from app.schemas.poliza import PolizaCreate, PolizaRead, PolizaUpdate
from app.crud.poliza import (
    crear_poliza,
    listar_polizas,
    obtener_poliza_por_id,
    actualizar_poliza,
    eliminar_poliza
)

router = APIRouter(tags=["Pólizas"])

### **1. Ruta para Pólizas Próximas a Vencer (Dashboard)**
@router.get("/proximas_a_vencer", response_model=List[PolizaRead])
def obtener_polizas_proximas_a_vencer(
    days_out: int = 30, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa) # Bloqueo
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    hoy = date.today()
    limite = hoy + timedelta(days=days_out)

    statement = select(Poliza).where(
        and_(
            Poliza.fecha_fin >= hoy,
            Poliza.fecha_fin <= limite,
            Poliza.user_id == current_user.id
        )
    )
    
    results = session.exec(statement).all()
    return list(results)


### **2. Rutas Estándar de Pólizas**
@router.post("/polizas", response_model=PolizaRead, status_code=status.HTTP_201_CREATED)
def crear_nueva_poliza(
    poliza_data: PolizaCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="No autorizado")

    cliente_statement = select(Cliente).where(
        Cliente.id == poliza_data.cliente_id, 
        Cliente.user_id == current_user.id
    )
    cliente = session.exec(cliente_statement).first()

    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado o no le pertenece."
        )
    
    try:
        return crear_poliza(session, poliza_data, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.get("/polizas", response_model=List[PolizaRead])
def obtener_todas_las_polizas(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")
    return listar_polizas(session, user_id=current_user.id)

@router.get("/polizas/{poliza_id}", response_model=PolizaRead)
def obtener_poliza(
    poliza_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    poliza = obtener_poliza_por_id(session, poliza_id, user_id=current_user.id)
    if not poliza:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    return poliza

@router.put("/polizas/{poliza_id}", response_model=PolizaRead)
def actualizar_poliza_existente(
    poliza_id: int,
    poliza_data: PolizaUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    poliza_actualizada = actualizar_poliza(session, poliza_id, poliza_data, user_id=current_user.id)
    if not poliza_actualizada:
        raise HTTPException(status_code=404, detail="Póliza no encontrada o sin permisos")
    return poliza_actualizada

@router.delete("/polizas/{poliza_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_poliza_existente(
    poliza_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    eliminado = eliminar_poliza(session, poliza_id, user_id=current_user.id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    return None


### **3. IMPORTACIÓN MASIVA DE PÓLIZAS**
@router.post("/polizas/importar")
async def importar_polizas_csv(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="El archivo debe ser formato .csv")
    
    try:
        content = await file.read()
        decoded_content = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded_content))
        
        headers = [h.strip().lower() for h in reader.fieldnames or []]
        reader.fieldnames = headers

        importados = 0
        errores = 0

        for row in reader:
            try:
                numero_poliza = str(row.get('numero_poliza', '')).strip()
                if not numero_poliza:
                    errores += 1
                    continue

                existe = session.exec(
                    select(Poliza).where(
                        Poliza.numero_poliza == numero_poliza,
                        Poliza.user_id == current_user.id
                    )
                ).first()

                if existe:
                    errores += 1 
                    continue 

                cliente_str = str(row.get('cliente_id') or '0').strip()
                empresa_str = str(row.get('empresa_aseguradora_id') or '0').strip()
                asesor_str = str(row.get('asesor_id') or '').strip()
                prima_str = str(row.get('prima') or '0').strip()
                
                # INJERTO DE RIESGO
                suma_str = str(row.get('suma_asegurada') or '0').strip()
                deducible_str = str(row.get('deducible') or '0').strip()

                nueva_poliza = Poliza(
                    numero_poliza=numero_poliza,
                    tipo_poliza=str(row.get('tipo_poliza', 'Otros')).strip(),
                    fecha_inicio=datetime.strptime(str(row.get('fecha_inicio', '')).strip(), '%Y-%m-%d'),
                    fecha_fin=datetime.strptime(str(row.get('fecha_fin', '')).strip(), '%Y-%m-%d'),
                    prima=float(prima_str),
                    suma_asegurada=float(suma_str),
                    deducible=float(deducible_str),
                    estado=str(row.get('estado', 'Activa')).strip(),
                    cliente_id=int(cliente_str),
                    empresa_id=int(empresa_str),
                    asesor_id=int(asesor_str) if asesor_str else None,
                    user_id=current_user.id
                )
                session.add(nueva_poliza)
                importados += 1
            except Exception:
                errores += 1
                continue

        session.commit()
        return {"message": f"Proceso completado: {importados} pólizas importadas, {errores} omitidas."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error general al procesar el archivo: {str(e)}")
# app/routers/cliente.py
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlmodel import Session, select
from typing import List

# Importamos la herramienta para capturar el error de duplicados
from sqlalchemy.exc import IntegrityError

from app.db.database import get_session
from app.models.cliente import Cliente
from app.models.user import User
from app.auth.auth_bearer import get_current_user
from app.auth.license_handler import verificar_licencia_activa

router = APIRouter(tags=["Clientes"])

@router.get("/clientes", response_model=List[Cliente])
def obtener_clientes(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    try:
        statement = select(Cliente).where(Cliente.user_id == current_user.id)
        results = session.exec(statement).all()
        return list(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clientes", status_code=status.HTTP_201_CREATED, response_model=Cliente)
def crear_cliente(
    cliente: Cliente, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    cliente.id = None
    cliente.user_id = current_user.id
    
    # 🚨 BLINDAJE AÑADIDO AQUÍ 🚨
    try:
        session.add(cliente)
        session.commit()
        session.refresh(cliente)
        return cliente
    except IntegrityError:
        # Si choca con un dato duplicado en la base de datos, abortamos el guardado
        session.rollback() 
        # Enviamos un error 400 (Bad Request) que React sí entiende
        raise HTTPException(
            status_code=400, 
            detail="Ya existe un cliente registrado con este documento de identidad o correo electrónico."
        )

# --- NUEVO ENDPOINT: IMPORTACIÓN MASIVA ---
@router.post("/clientes/importar")
async def importar_clientes(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    # Solución Pylance: Validamos que exista un nombre antes de usar .endswith()
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="El archivo debe ser formato .csv")
    
    try:
        # Leer y decodificar el archivo
        content = await file.read()
        decoded_content = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded_content))
        
        # Estandarizar cabeceras a minúsculas
        headers = [h.strip().lower() for h in reader.fieldnames or []]
        reader.fieldnames = headers

        # Validar que vengan las columnas obligatorias del modelo
        columnas_obligatorias = {'nombre', 'apellido', 'identificacion', 'email'}
        if not columnas_obligatorias.issubset(set(headers)):
            raise HTTPException(
                status_code=400, 
                detail=f"Faltan columnas. Requeridas: {', '.join(columnas_obligatorias)}"
            )

        importados = 0
        errores = 0

        for row in reader:
            identificacion = row.get('identificacion', '').strip()
            email = row.get('email', '').strip()
            
            if not identificacion or not email:
                errores += 1
                continue

            # Buscar si el cliente ya existe en la cartera de este asesor
            existe = session.exec(
                select(Cliente).where(
                    (Cliente.user_id == current_user.id) & 
                    (Cliente.identificacion == identificacion)
                )
            ).first()

            if existe:
                errores += 1 # Saltamos los duplicados para no explotar la DB
                continue 

            nuevo_cliente = Cliente(
                nombre=row.get('nombre', '').strip(),
                apellido=row.get('apellido', '').strip(),
                identificacion=identificacion,
                email=email,
                telefono=row.get('telefono', '').strip() or None,
                direccion=row.get('direccion', '').strip() or None,
                fecha_nacimiento=row.get('fecha_nacimiento', '').strip() or None,
                user_id=current_user.id
            )
            session.add(nuevo_cliente)
            importados += 1

        session.commit()
        return {"message": f"Proceso completado: {importados} clientes importados, {errores} omitidos (duplicados o incompletos)."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo: {str(e)}")

@router.delete("/clientes/{cliente_id}")
def eliminar_cliente(
    cliente_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    statement = select(Cliente).where(Cliente.id == cliente_id, Cliente.user_id == current_user.id)
    cliente = session.exec(statement).first()
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado o sin permisos")
        
    session.delete(cliente)
    session.commit()
    return {"message": "Cliente eliminado"}

@router.put("/clientes/{cliente_id}", response_model=Cliente)
def actualizar_cliente_endpoint(
    cliente_id: int, 
    cliente_data: Cliente, # Recibimos los datos editados
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    # 1. Buscamos el cliente asegurando que le pertenece a este usuario
    statement = select(Cliente).where(Cliente.id == cliente_id, Cliente.user_id == current_user.id)
    db_cliente = session.exec(statement).first()
    
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado o sin permisos")
    
    # 2. Extraemos los datos enviados por React (excluyendo campos vacíos o no modificados)
    update_data = cliente_data.model_dump(exclude_unset=True)
    
    # Protección extra: Evitamos que modifiquen el ID o el dueño accidentalmente
    update_data.pop("id", None) 
    update_data.pop("user_id", None)

    # 3. Aplicamos los cambios al cliente encontrado
    for key, value in update_data.items():
        setattr(db_cliente, key, value)
        
    # 4. Guardamos en la base de datos
    try:
        session.add(db_cliente)
        session.commit()
        session.refresh(db_cliente)
        return db_cliente
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Error al actualizar: los datos ingresados (como cédula o correo) ya pertenecen a otro cliente."
        )
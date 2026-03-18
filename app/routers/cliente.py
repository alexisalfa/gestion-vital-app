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
from app.models.poliza import Poliza
from datetime import datetime
from app.models.reclamacion import Reclamacion

router = APIRouter(tags=["Clientes"])

# 🚨 NUEVO CEREBRO FINANCIERO CRM 360 🚨
@router.get("/clientes")
def obtener_clientes(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    try:
        # 1. Buscamos a los clientes de este asesor
        statement_clientes = select(Cliente).where(Cliente.user_id == current_user.id)
        clientes = session.exec(statement_clientes).all()

        # 2. Buscamos TODAS las pólizas del asesor para hacer los cálculos
        statement_polizas = select(Poliza).where(Poliza.user_id == current_user.id)
        polizas = session.exec(statement_polizas).all()

        # 3. Agrupamos las pólizas por cliente para procesarlas rápido
        polizas_por_cliente = {}
        for p in polizas:
            if p.cliente_id not in polizas_por_cliente:
                polizas_por_cliente[p.cliente_id] = []
            polizas_por_cliente[p.cliente_id].append(p)

        # 4. Procesamos cliente por cliente
        hoy = datetime.now()
        resultado_crm = []

        for cliente in clientes:
            # Convertimos el cliente a diccionario para poder inyectarle los datos financieros
            datos_cliente = cliente.model_dump()
            
            mis_polizas = polizas_por_cliente.get(cliente.id, [])
            
            cartera_total = 0.0
            activas = 0
            dias_renovacion = None

            for poliza in mis_polizas:
                # Consideramos solo las pólizas "Activas"
                if poliza.estado and poliza.estado.lower() == "activa":
                    activas += 1
                    cartera_total += poliza.prima
                    
                    # Calculamos los días restantes para el vencimiento
                    if poliza.fecha_fin:
                        # Limpiamos la zona horaria por seguridad matemática
                        fecha_fin_limpia = poliza.fecha_fin.replace(tzinfo=None)
                        dias_restantes = (fecha_fin_limpia - hoy).days
                        
                        # Guardamos la fecha que esté más próxima a vencerse
                        if dias_renovacion is None or dias_restantes < dias_renovacion:
                            dias_renovacion = dias_restantes

            # Inyectamos los cálculos al perfil del cliente
            datos_cliente["valor_cartera"] = cartera_total
            datos_cliente["polizas_activas"] = activas
            datos_cliente["dias_proxima_renovacion"] = dias_renovacion

            resultado_crm.append(datos_cliente)

        return resultado_crm

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
    # ==========================================
# 🚀 EL DETECTIVE: PERFIL 360° DEL CLIENTE
# ==========================================
@router.get("/clientes/{cliente_id}/360")
def obtener_perfil_360(
    cliente_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    _licencia = Depends(verificar_licencia_activa)
):
    # 1. Validamos que el cliente exista y le pertenezca a este CEO/Asesor
    statement_cliente = select(Cliente).where(Cliente.id == cliente_id, Cliente.user_id == current_user.id)
    cliente = session.exec(statement_cliente).first()
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado o sin permisos")

    # 2. Buscamos todo su historial de Pólizas
    statement_polizas = select(Poliza).where(Poliza.cliente_id == cliente_id)
    polizas = session.exec(statement_polizas).all()
    
    # 3. Buscamos todo su historial de Siniestros/Reclamaciones
    statement_reclamaciones = select(Reclamacion).where(Reclamacion.cliente_id == cliente_id)
    reclamaciones = session.exec(statement_reclamaciones).all()

    # 4. Empaquetamos el expediente completo y se lo mandamos a React
    return {
        "cliente": cliente,
        "polizas": polizas,
        "reclamaciones": reclamaciones
    }
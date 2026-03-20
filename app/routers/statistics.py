# app/routers/statistics.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from datetime import datetime
from typing import cast, Any, Optional

from app.db.database import get_session
from app.models.cliente import Cliente
from app.models.poliza import Poliza
from app.models.reclamacion import Reclamacion
from app.models.EmpresaAseguradora import EmpresaAseguradora
from app.models.configuracion import Configuracion
from app.models.user import User 
from app.models.Asesores import Asesores 
from app.models.comision import Comision 
from app.auth.auth_bearer import get_current_user 
from app.auth.license_handler import verificar_licencia_activa 

router = APIRouter(prefix="/statistics", tags=["statistics"])

# --- FUNCIÓN AUXILIAR PARA EVITAR ERRORES DE PYLANCE ---
def safe_parse_date(d_val: Any) -> Optional[datetime]:
    if not d_val:
        return None
    if isinstance(d_val, datetime):
        return d_val
    try:
        s_val = str(d_val).replace("Z", "+00:00")
        return datetime.fromisoformat(s_val)
    except Exception:
        return None
# -------------------------------------------------------

@router.get("/summary")
def get_summary(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    config: Configuracion = Depends(verificar_licencia_activa) 
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")
    
    user_id = cast(int, current_user.id)

    try:
        # 1. Conteos Generales
        total_clientes = session.exec(select(func.count()).select_from(Cliente).where(Cliente.user_id == user_id)).one() # type: ignore
        total_polizas = session.exec(select(func.count()).select_from(Poliza).where(Poliza.user_id == user_id)).one() # type: ignore
        
        # --- 🚀 INJERTO: FILTRO DE SINIESTROS PENDIENTES ---
        # Solo cuenta las que NO están Pagada ni Rechazada
        total_reclamaciones = session.exec(
            select(func.count())
            .select_from(Reclamacion)
            .where(
                Reclamacion.user_id == user_id,
                Reclamacion.estado_reclamacion != 'Pagada',
                Reclamacion.estado_reclamacion != 'Rechazada'
            )
        ).one() # type: ignore
        # ---------------------------------------------------

        empresas_activas = session.exec(select(func.count()).select_from(EmpresaAseguradora).where(EmpresaAseguradora.user_id == user_id)).one() # type: ignore
        total_asesores = session.exec(select(func.count()).select_from(Asesores).where(Asesores.user_id == user_id)).one() # type: ignore

        # Sumatoria de Comisiones
        suma_comisiones = session.exec(select(func.sum(Comision.monto_final)).where(Comision.user_id == user_id)).one() # type: ignore
        monto_total_comisiones = float(suma_comisiones) if suma_comisiones else 0.0
        
        suma_primas = session.exec(select(func.sum(Poliza.prima)).where(Poliza.user_id == user_id)).one() # type: ignore
        monto_total_primas = float(suma_primas) if suma_primas else 0.0

        # 2. Reclamaciones por Estado
        reclamaciones_por_estado = {}
        reclamaciones_query = session.exec(
            select(Reclamacion.estado_reclamacion, func.count())
            .where(Reclamacion.user_id == user_id)
            .group_by(Reclamacion.estado_reclamacion)
        ).all()
        
        for row in reclamaciones_query:
            if row[0] is not None:
                reclamaciones_por_estado[str(row[0])] = int(row[1])

        # 3. Pólizas Mensuales
        meses_nombres = {1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun", 
                         7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic"}
        hoy = datetime.now()
        datos_mensuales = []
        
        for i in range(5, -1, -1):
            mes = hoy.month - i
            anio = hoy.year
            if mes <= 0:
                mes += 12
                anio -= 1
            datos_mensuales.append({
                "mes_texto": meses_nombres[mes], "mes_num": mes, "anio": anio,
                "emitidas": 0, "vencidas": 0
            })

        todas_las_polizas = session.exec(select(Poliza).where(Poliza.user_id == user_id)).all()
        
        for poliza in todas_las_polizas:
            # Usamos la función auxiliar limpia
            f_in = safe_parse_date(poliza.fecha_inicio)
            f_fin = safe_parse_date(poliza.fecha_fin)
            
            if f_in:
                for m in datos_mensuales:
                    if f_in.year == m["anio"] and f_in.month == m["mes_num"]:
                        m["emitidas"] += 1
            
            if f_fin:
                for m in datos_mensuales:
                    if f_fin.year == m["anio"] and f_fin.month == m["mes_num"]:
                        m["vencidas"] += 1

        polizas_mensuales = [{"mes": d["mes_texto"], "emitidas": d["emitidas"], "vencidas": d["vencidas"]} for d in datos_mensuales]

        plan_tipo_val = config.plan_tipo if config else "TRIAL_24H"
        es_prueba_val = config.es_prueba if config else True
        fecha_venc_val = config.fecha_vencimiento.isoformat() if config and config.fecha_vencimiento else None

        return {
            "total_clientes_activos": int(total_clientes) if total_clientes else 0,
            "total_polizas_activas": int(total_polizas) if total_polizas else 0,
            "total_reclamaciones_pendientes": int(total_reclamaciones) if total_reclamaciones else 0,
            "total_empresas_activas": int(empresas_activas) if empresas_activas else 0,
            "total_asesores_activos": int(total_asesores) if total_asesores else 0,
            "total_comisiones": monto_total_comisiones,
            "total_primas": monto_total_primas,
            "polizas_por_estado": {}, 
            "reclamaciones_por_estado": reclamaciones_por_estado,
            "polizas_mensuales": polizas_mensuales,
            "monto_aprobado_reclamaciones_anual": 0,
            "plan_tipo": plan_tipo_val,
            "es_prueba": es_prueba_val,
            "fecha_vencimiento": fecha_venc_val
        }

    except Exception as e:
        print(f"ERROR CRÍTICO EN SUMMARY: {str(e)}")
        return {
            "total_clientes_activos": 0,
            "total_polizas_activas": 0,
            "total_reclamaciones_pendientes": 0,
            "total_empresas_activas": 0,
            "total_asesores_activos": 0,
            "total_comisiones": 0,
            "polizas_por_estado": {},
            "reclamaciones_por_estado": {},
            "polizas_mensuales": [],
            "monto_aprobado_reclamaciones_anual": 0,
            "plan_tipo": "TRIAL_24H",
            "es_prueba": True,
            "fecha_vencimiento": None
        }

@router.get("/license-status")
def get_license_status(config: Configuracion = Depends(verificar_licencia_activa)):
    ahora = datetime.now()
    if config.fecha_vencimiento:
        tiempo_restante = config.fecha_vencimiento - ahora
        total_segundos = int(tiempo_restante.total_seconds())
    else:
        total_segundos = -1

    if total_segundos < 0:
        return {"es_prueba": config.es_prueba, "activo": False, "horas_restantes": 0, "minutos_restantes": 0, "mensaje": "Licencia vencida"}
    
    horas = total_segundos // 3600
    minutos = (total_segundos % 3600) // 60
    return {"es_prueba": config.es_prueba, "activo": True, "horas_restantes": horas, "minutos_restantes": minutos, "mensaje": "Licencia Activa"}
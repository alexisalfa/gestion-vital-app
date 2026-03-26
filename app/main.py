# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import create_db_and_tables, engine # <-- ENGINE AÑADIDO
from app.models.parametro_global import ParametroGlobal, HistorialTasa
from app.models.pago_local import PagoLocal

# --- 🤖 IMPORTACIONES PARA EL PILOTO AUTOMÁTICO ---
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import smtplib
from email.message import EmailMessage
from datetime import date, timedelta
from sqlmodel import Session, select
from app.models.poliza import Poliza
from app.models.cliente import Cliente
# --------------------------------------------------

import os
from dotenv import load_dotenv

load_dotenv()

from app.routers import (
    cliente, 
    poliza, 
    reclamacion, 
    EmpresaAseguradora, 
    auth,
    statistics,
    asesores,
    comisiones,
    configuracion,
    license_management,
    payments,
    pagos,
    pagos_locales,
    documentos
)

app = FastAPI(
    title="Insurtech API",
    description="API modular para gestión de correduría de seguros",
    version="1.0.0"
)

# --- CONFIGURACIÓN DE CORS ---
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://127.0.0.1:5173","https://gestion-vital.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 🚀 LÓGICA DEL ROBOT DE CORREOS AUTOMÁTICOS ---
def tarea_recordatorios_diarios():
    print("🤖 [PILOTO AUTOMÁTICO] Iniciando escaneo matutino de pólizas...")
    hoy = date.today()
    # Buscar pólizas que vencen en exactamente 30 días
    dia_objetivo = hoy + timedelta(days=30)
    
    remitente = os.getenv("EMAIL_SENDER")
    password = os.getenv("EMAIL_PASSWORD")
    
    if not remitente or not password:
        print("⚠️ [ERROR] Credenciales de correo no configuradas. El robot no puede enviar mensajes.")
        return

    try:
        with Session(engine) as session:
            # Filtrar pólizas activas que coincidan con la fecha exacta
            polizas_a_vencer = session.exec(
                select(Poliza).where(
                    Poliza.fecha_fin == dia_objetivo,
                    Poliza.estado == "Activa"
                )
            ).all()

            if not polizas_a_vencer:
                print("✅ [PILOTO AUTOMÁTICO] Ninguna póliza vence en 30 días. Nada por enviar hoy.")
                return

            print(f"🚀 [PILOTO AUTOMÁTICO] Se encontraron {len(polizas_a_vencer)} pólizas por vencer. Iniciando envíos...")
            
            # Abrimos conexión SMTP única para mandar todos los correos de golpe (rápido y eficiente)
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                smtp.login(remitente, password)
                
                for poliza in polizas_a_vencer:
                    cliente = session.exec(select(Cliente).where(Cliente.id == poliza.cliente_id)).first()
                    if not cliente or not cliente.email:
                        continue
                        
                    msg = EmailMessage()
                    msg['Subject'] = f"Aviso Importante: Renovación de Póliza {poliza.numero_poliza} 🛡️"
                    msg['From'] = remitente
                    msg['To'] = cliente.email

                    fecha_fin_str = poliza.fecha_fin.strftime("%d/%m/%Y")
                    
                    cuerpo_html = f"""
                    <html>
                        <body style="font-family: Arial, sans-serif; color: #333;">
                            <h2 style="color: #2563eb;">Gestión Vital - Aviso Automático de Renovación</h2>
                            <p>Hola <b>{cliente.nombre} {cliente.apellido or ''}</b>,</p>
                            <p>Esperamos que te encuentres muy bien.</p>
                            <p>El sistema automático de tu asesor te recuerda que tu póliza <b>{poliza.tipo_poliza}</b> (Nro: {poliza.numero_poliza}) está próxima a vencer el día <b>{fecha_fin_str}</b>.</p>
                            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                                <p style="margin: 0;"><b>Suma Asegurada:</b> ${poliza.suma_asegurada:,.2f}</p>
                                <p style="margin: 0;"><b>Prima a Pagar:</b> ${poliza.prima:,.2f}</p>
                            </div>
                            <p>Por favor, comunícate con tu corredor lo antes posible para gestionar tu renovación y asegurar que sigas protegido sin interrupciones.</p>
                            <p>Atentamente,<br><b>Tu Equipo de Gestión Vital</b></p>
                        </body>
                    </html>
                    """
                    msg.set_content(f"Tu póliza {poliza.numero_poliza} está por vencer en 30 días. Por favor renueva.", subtype='text')
                    msg.add_alternative(cuerpo_html, subtype='html')

                    smtp.send_message(msg)
                    print(f"📧 [ENVIADO] -> {cliente.email} (Póliza: {poliza.numero_poliza})")
                    
        print("🤖 [PILOTO AUTOMÁTICO] Todos los correos enviados con éxito. Hasta mañana.")
    except Exception as e:
        print(f"❌ [ERROR ROBOT] Falló el proceso de envío automático: {str(e)}")

# Configuramos el Reloj Biológico del servidor
scheduler = BackgroundScheduler()
# Render usa hora UTC. Las 12:00 UTC son las 08:00 AM en Venezuela.
scheduler.add_job(tarea_recordatorios_diarios, CronTrigger(hour=12, minute=0))
# --------------------------------------------------------------

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    scheduler.start() # Encendemos el robot
    print("⏰ Scheduler iniciado: El Piloto Automático está en guardia.")

@app.on_event("shutdown")
def on_shutdown():
    scheduler.shutdown() # Apagamos el robot de forma segura
    print("💤 Scheduler detenido.")

# --- REGISTRO DE ROUTERS ---
app.include_router(auth.router, prefix="/api/v1") 
app.include_router(cliente.router, prefix="/api/v1")
app.include_router(poliza.router, prefix="/api/v1")
app.include_router(reclamacion.router, prefix="/api/v1")
app.include_router(EmpresaAseguradora.router, prefix="/api/v1")
app.include_router(statistics.router, prefix="/api/v1")
app.include_router(asesores.router, prefix="/api/v1")
app.include_router(comisiones.router, prefix="/api/v1")
app.include_router(configuracion.router, prefix="/api/v1")
app.include_router(license_management.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(pagos.router, prefix="/api/v1/pagos", tags=["Pagos"])
app.include_router(pagos_locales.router, prefix="/api/v1")
app.include_router(documentos.router, prefix="/api/v1")

# Ruta de verificación de salud
@app.get("/", tags=["Salud"])
def health_check():
    return {
        "status": "online",
        "message": "Insurtech API modular funcionando correctamente",
        "comercial_mode": "Trial 24h Active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
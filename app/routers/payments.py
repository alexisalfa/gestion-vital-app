import stripe
import os
import traceback
import base64
import json
import urllib.request
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlmodel import Session, select
from datetime import datetime, timedelta
import uuid

from app.db.database import get_session
from app.models.user import User
from app.models.configuracion import Configuracion
from app.models.pago import Pago  # Para el historial de pagos
from app.auth.auth_bearer import get_current_user

# Cargar variables de entorno
load_dotenv()

router = APIRouter(prefix="/payments", tags=["Pagos con Stripe y PayPal"])

# ==========================================
# 💳 SECCIÓN 1: STRIPE (TU CÓDIGO INTACTO)
# ==========================================

# Configuración inicial de Stripe (Por si acaso)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/create-checkout-session")
async def create_checkout_session(current_user: User = Depends(get_current_user)):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")
    
    user_email = current_user.email if current_user.email else "sin_email@test.com"

    try:
        # TRUCO: Volvemos a leer las variables justo antes de cobrar
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        frontend_url = os.getenv("FRONTEND_URL", "https://gestion-vital.onrender.com")
        
        # LOGS DE DEPURACIÓN (Aparecerán en Render)
        print(f"💸 Intentando crear pago para: {user_email}")
        print(f"🔑 Tipo de llave Stripe leída: {type(stripe.api_key)}")
        if stripe.api_key:
            print(f"🔑 Llave Stripe empieza con: {str(stripe.api_key)[:7]}...")
        else:
            print("❌ ALERTA: La llave STRIPE_SECRET_KEY está VACÍA o no se leyó.")
            
        print(f"🌐 URL de retorno frontend: {frontend_url}")
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': 'Licencia Anual Insurtech PRO'},
                    'unit_amount': 9900, 
                },
                'quantity': 1,
            }],
            mode='payment',
            metadata={
                "user_id": str(current_user.id), 
                "user_email": str(user_email)
            },
            # Redirecciones seguras usando la variable de entorno
            success_url=f"{frontend_url}/?payment=success",
            cancel_url=f"{frontend_url}/?payment=cancel",
        )
        print(f"✅ Sesión de Stripe creada con éxito. URL: {checkout_session.url}")
        return {"url": checkout_session.url}
        
    except Exception as e:
        # ¡AQUÍ PRENDEMOS LA LUZ EN RENDER!
        print("=======================================")
        print(f"🔥 ERROR CRÍTICO AL CREAR PAGO STRIPE 🔥")
        print(f"Motivo: {str(e)}")
        print("--- Radiografía completa (Traceback) ---")
        traceback.print_exc()
        print("=======================================")
        
        raise HTTPException(status_code=500, detail=f"Error en pasarela de pago: {str(e)}")

@router.post("/webhook")
async def stripe_webhook(
    request: Request, 
    stripe_signature: str = Header(None),
    session: Session = Depends(get_session)
):
    payload = await request.body()
    
    try:
        # Validamos la firma
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except stripe.error.SignatureVerificationError as e: # type: ignore
        print(f"⚠️ Error de validación de firma de Webhook: {e}")
        raise HTTPException(status_code=400, detail="Firma de Stripe inválida")
    except Exception as e:
        print(f"⚠️ Error inesperado en Webhook: {e}")
        raise HTTPException(status_code=400, detail="Error en payload del webhook")

    # PROCESAMIENTO DEL PAGO EXITOSO
    if event['type'] == 'checkout.session.completed':
        session_data = event['data']['object']
        
        user_id = session_data.get('metadata', {}).get('user_id')
        session_id = session_data.get('id')
        amount_total = session_data.get('amount_total', 0)

        if user_id:
            statement = select(Configuracion).where(Configuracion.user_id == int(user_id))
            config = session.exec(statement).first()

            if config:
                nueva_llave = f"AKA-PRO-{str(uuid.uuid4())[:8].upper()}"
                
                config.fecha_vencimiento = datetime.now() + timedelta(days=365)
                config.plan_tipo = "PRO_ANNUAL"
                config.es_prueba = False
                config.licencia_activa = True
                config.license_key = nueva_llave

                session.add(config)

                nuevo_pago = Pago(
                    user_id=int(user_id),
                    monto=amount_total / 100.0,  
                    moneda="USD",
                    referencia_pasarela=session_id,
                    estado="completado"
                )
                
                session.add(nuevo_pago)
                session.commit()
                print(f"✅ PAGO EXITOSO STRIPE: Licencia PRO activada y transacción {session_id} registrada para usuario {user_id}")

    return {"status": "success"}


# ==========================================
# 🅿️ SECCIÓN 2: PAYPAL (NUEVO MOTOR)
# ==========================================
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"

def get_paypal_access_token():
    client_id = os.getenv("PAYPAL_CLIENT_ID", "")
    secret = os.getenv("PAYPAL_SECRET", "")
    auth_str = f"{client_id}:{secret}"
    b64_auth = base64.b64encode(auth_str.encode()).decode()

    url = f"{PAYPAL_API_BASE}/v1/oauth2/token"
    req = urllib.request.Request(url, data=b"grant_type=client_credentials")
    req.add_header("Authorization", f"Basic {b64_auth}")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data["access_token"]
    except Exception as e:
        print(f"🔥 Error Auth PayPal: {e}")
        raise ValueError("No se pudo obtener el token de PayPal. Verifica tus llaves en Render.")

@router.post("/paypal/create-order")
async def create_paypal_order(current_user: User = Depends(get_current_user)):
    try:
        token = get_paypal_access_token()
        url = f"{PAYPAL_API_BASE}/v2/checkout/orders"
        
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": { "currency_code": "USD", "value": "99.00" },
                "description": "Licencia Anual Insurtech PRO"
            }]
        }
        
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'))
        req.add_header("Authorization", f"Bearer {token}")
        req.add_header("Content-Type", "application/json")
        
        with urllib.request.urlopen(req) as response:
            order_data = json.loads(response.read().decode())
            return {"id": order_data["id"]}
            
    except Exception as e:
        print(f"🔥 ERROR PAYPAL CREATE: {e}")
        raise HTTPException(status_code=500, detail="Error al crear orden en PayPal")

@router.post("/paypal/capture-order")
async def capture_paypal_order(request: Request, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    
    # 1. ALCABALA PARA CALMAR A PYLANCE (Aseguramos que no sea None)
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    data = await request.json()
    order_id = data.get("orderID")

    try:
        token = get_paypal_access_token()
        url = f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture"
        
        req = urllib.request.Request(url, data=b"", method="POST")
        req.add_header("Authorization", f"Bearer {token}")
        req.add_header("Content-Type", "application/json")
        
        with urllib.request.urlopen(req) as response:
            capture_data = json.loads(response.read().decode())
            
            if capture_data["status"] == "COMPLETED":
                # ACTUALIZAR BASE DE DATOS AL CAPTURAR EL PAGO
                statement = select(Configuracion).where(Configuracion.user_id == current_user.id)
                config = session.exec(statement).first()

                if config:
                    config.fecha_vencimiento = datetime.now() + timedelta(days=365)
                    config.plan_tipo = "PRO_ANNUAL"
                    config.es_prueba = False
                    config.licencia_activa = True
                    config.license_key = f"AKA-PRO-{str(uuid.uuid4())[:8].upper()}"
                    
                    # 2. CAST EXPLÍCITO A INT PARA EL MODELO PAGO
                    nuevo_pago = Pago(
                        user_id=int(current_user.id), 
                        monto=99.00, 
                        moneda="USD", 
                        referencia_pasarela=capture_data["id"], 
                        estado="completado"
                    )
                    session.add(config)
                    session.add(nuevo_pago)
                    session.commit()
                    print(f"✅ PAGO EXITOSO PAYPAL: Licencia PRO activada para usuario {current_user.id}")

                return {"status": "success"}
            else:
                raise HTTPException(status_code=400, detail="El pago no fue completado en PayPal")
                
    except Exception as e:
        print(f"🔥 ERROR PAYPAL CAPTURE: {e}")
        raise HTTPException(status_code=500, detail="Error al capturar el pago en PayPal")
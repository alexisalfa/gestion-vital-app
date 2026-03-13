import stripe
import os
import traceback
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

router = APIRouter(prefix="/payments", tags=["Pagos con Stripe"])

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
        frontend_url = os.getenv("FRONTEND_URL")
        
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
                print(f"✅ PAGO EXITOSO: Licencia PRO activada y transacción {session_id} registrada para usuario {user_id}")

    return {"status": "success"}
import stripe
import os
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

# Configuración de Stripe desde el archivo .env
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/create-checkout-session")
async def create_checkout_session(current_user: User = Depends(get_current_user)):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")
    
    user_email = current_user.email if current_user.email else "sin_email@test.com"

    try:
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
            # Redirecciones seguras a la raíz para evitar errores 404 de Vite
            success_url=f"{os.getenv('FRONTEND_URL')}/?payment=success",
            cancel_url=f"{os.getenv('FRONTEND_URL')}/?payment=cancel",
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(
    request: Request, 
    stripe_signature: str = Header(None),
    session: Session = Depends(get_session)
):
    payload = await request.body()
    
    try:
        # Validamos que la firma de Stripe coincida con nuestro secreto del .env
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError as e: # type: ignore
        # Usamos type: ignore para que Pylance no marque falso error
        print(f"⚠️ Error de validación de firma de Webhook: {e}")
        raise HTTPException(status_code=400, detail="Firma de Stripe inválida")
    except Exception as e:
        print(f"⚠️ Error inesperado en Webhook: {e}")
        raise HTTPException(status_code=400, detail="Error en payload del webhook")

    # PROCESAMIENTO DEL PAGO EXITOSO
    if event['type'] == 'checkout.session.completed':
        session_data = event['data']['object']
        
        # Extraer datos vitales de la sesión de Stripe
        user_id = session_data.get('metadata', {}).get('user_id')
        session_id = session_data.get('id')  # ID único de la transacción de Stripe
        amount_total = session_data.get('amount_total', 0)  # Viene en centavos (ej. 9900)

        if user_id:
            # Buscar la configuración del usuario en la BD
            statement = select(Configuracion).where(Configuracion.user_id == int(user_id))
            config = session.exec(statement).first()

            if config:
                # 1. ACTUALIZAR LA SUSCRIPCIÓN A PRO
                nueva_llave = f"AKA-PRO-{str(uuid.uuid4())[:8].upper()}"
                
                config.fecha_vencimiento = datetime.now() + timedelta(days=365)
                config.plan_tipo = "PRO_ANNUAL"
                config.es_prueba = False
                config.licencia_activa = True
                config.license_key = nueva_llave

                session.add(config)

                # 2. REGISTRAR EL RECIBO EN EL HISTORIAL DE PAGOS
                nuevo_pago = Pago(
                    user_id=int(user_id),
                    monto=amount_total / 100.0,  
                    moneda="USD",
                    referencia_pasarela=session_id,
                    estado="completado"
                )
                
                session.add(nuevo_pago)
                
                # Guardamos ambos registros (Configuración y Pago) en una sola transacción
                session.commit()
                print(f"✅ PAGO EXITOSO: Licencia PRO activada y transacción {session_id} registrada para usuario {user_id}")

    return {"status": "success"}
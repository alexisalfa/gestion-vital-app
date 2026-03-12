from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.user import User

# Esto permite a FastAPI leer el token del Header "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/token")

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    session: Session = Depends(get_session)
):
    print(f"\n--- DEBUG SEGURIDAD ---")
    print(f"Token recibido: {token}")

    # En tu auth.py configuramos que el token sea el EMAIL del usuario.
    # Buscamos al usuario que tenga ESE email exacto.
    statement = select(User).where(User.email == token)
    user = session.exec(statement).first()

    if not user:
        print(f"RESULTADO: Usuario no encontrado para el token: {token}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o usuario no encontrado",
        )

    print(f"RESULTADO: Usuario identificado: {user.email} (ID: {user.id})")
    print(f"-----------------------\n")
    
    return user
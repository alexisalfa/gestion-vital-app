from sqlalchemy.orm import Session
from app.models.user import User
from datetime import datetime, timedelta

async def activate_license(db: Session, user_id: int, l_type: str = "full"):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active_license = True
        user.license_type = l_type
        # Ponemos 1 año de expiración por defecto
        user.license_expiration = datetime.utcnow() + timedelta(days=365)
        db.commit()
        db.refresh(user)
        return user
    return None
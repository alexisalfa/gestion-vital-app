# database.py
import os
from sqlmodel import SQLModel, create_engine, Session

# Credenciales y configuración de URL
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "2424")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "insurtech_db")

LOCAL_DB_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
DATABASE_URL = os.getenv("DATABASE_URL", LOCAL_DB_URL)

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# --- 🦾 ARQUITECTURA DE CONEXIÓN ROBUSTA ---
# Implementamos un Pool de conexiones para evitar el error "Max connections reached"
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,             # Mantiene 5 conexiones siempre abiertas y listas
    max_overflow=10,         # Permite abrir hasta 10 más en picos de tráfico
    pool_timeout=30,         # Si la DB está full, espera 30 seg antes de dar error
    pool_recycle=1800,       # Recicla conexiones cada 30 min para evitar fugas
    pool_pre_ping=True,      # Verifica si la conexión sigue viva antes de usarla
    connect_args={
        "options": "-c client_encoding=utf8"
    }
)

def create_db_and_tables():
    try:
        SQLModel.metadata.create_all(engine)
        print("¡Estructura de base de datos verificada con éxito!")
    except Exception as e:
        print(f"Error creando tablas: {e}")

def get_session():
    # El uso de 'with' aquí es vital: asegura que la conexión 
    # se cierre y regrese al pool automáticamente al terminar la petición.
    with Session(engine) as session:
        yield session
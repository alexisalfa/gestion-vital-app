import os
from sqlmodel import SQLModel, create_engine, Session

# Credenciales simples (Variables locales por defecto si no estamos en la nube)
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "2424")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "insurtech_db")

# 1. Armamos la URL local por si estás probando en tu computadora
LOCAL_DB_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# 2. Buscamos la llave maestra en Render. Si no está, usamos la local.
DATABASE_URL = os.getenv("DATABASE_URL", LOCAL_DB_URL)

# 3. Corrección vital: SQLAlchemy/SQLModel exige que diga "postgresql://"
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "options": "-c client_encoding=utf8"
    }
)

def create_db_and_tables():
    try:
        SQLModel.metadata.create_all(engine)
        print("¡Tablas creadas o verificadas con éxito en la base de datos!")
    except Exception as e:
        print(f"Error creando tablas: {e}")

def get_session():
    with Session(engine) as session:
        yield session
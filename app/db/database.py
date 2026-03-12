from sqlmodel import SQLModel, create_engine, Session

# Credenciales simples
DB_USER = "postgres"  
DB_PASS = "2424"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "insurtech_db" 

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


engine = create_engine(
    DATABASE_URL,
    connect_args={
        "options": "-c client_encoding=utf8"
    }
)

def create_db_and_tables():
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"Error creando tablas: {e}")

def get_session():
    with Session(engine) as session:
        yield session
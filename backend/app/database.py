from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

# Import all models to ensure SQLModel relationships resolve correctly
# This must happen before create_db_and_tables() is called
from app.models import ScreeningSession, CriteriaConversation, Candidate

# check_same_thread=False is needed for SQLite
engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

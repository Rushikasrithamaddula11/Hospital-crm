import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger("hospital_crm.database")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hospital_crm.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        echo=False,
        future=True
    )
except Exception as e:
    logger.error(f"Failed to create engine for {DATABASE_URL}, falling back to SQLite: {e}")
    DATABASE_URL = "sqlite:///./hospital_crm.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
        future=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

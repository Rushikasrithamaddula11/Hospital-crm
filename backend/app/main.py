import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.database.seed_data import seed_database
from app.database.firebase_config import init_firebase
from app.api.v1 import api_v1_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hospital_crm")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Initializing Mentneo Hospital CRM Database...")
    Base.metadata.create_all(bind=engine)
    
    # Initialize Firebase if enabled
    init_firebase()

    # Seed data if empty
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield
    # Shutdown tasks
    logger.info("Shutting down Mentneo Hospital CRM Application...")

app = FastAPI(
    title="Mentneo Hospital CRM API",
    description="Enterprise API for Hospital Patient Management & CRM Modules",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
cors_origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if cors_origins == ["*"] else cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_v1_router, prefix="/api/v1")

@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "system": "Mentneo Hospital CRM API",
        "module": "Module 1 — Patient Management",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

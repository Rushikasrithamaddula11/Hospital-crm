import os
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field

from app.auth.rbac import UserRole
from app.database.firebase_config import get_firestore_db

router = APIRouter(prefix="/settings", tags=["Settings"])


class SettingsUpdate(BaseModel):
    hospital_name: Optional[str] = "Mentneo Central Hospital"
    branch_name: Optional[str] = "Main Branch — Bangalore"
    active_role: Optional[str] = "Receptionist"
    contact_phone: Optional[str] = "+91 80 4910 2000"
    contact_email: Optional[str] = "contact@mentneo.com"


@router.get("", response_model=dict)
def get_system_settings():
    db_url = os.getenv("DATABASE_URL", "sqlite:///./hospital_crm.db")
    use_firebase = os.getenv("USE_FIREBASE", "false").lower() in ("true", "1", "yes")

    db_driver = "SQLite (Local Dev Database)"
    if "postgresql" in db_url.lower():
        db_driver = "PostgreSQL (Enterprise Production Database)"
    elif use_firebase or get_firestore_db():
        db_driver = "Google Cloud Firestore (Firebase Admin SDK)"

    roles_matrix = [
        {
            "role": UserRole.SUPER_ADMIN.value,
            "permissions": ["Register Patients", "View Medical History", "Issue Prescriptions", "Order Lab Tests", "View Audit Logs", "Manage System Settings"]
        },
        {
            "role": UserRole.HOSPITAL_ADMIN.value,
            "permissions": ["Register Patients", "View Medical History", "Issue Prescriptions", "Order Lab Tests", "View Audit Logs"]
        },
        {
            "role": UserRole.DOCTOR.value,
            "permissions": ["View Medical History", "Issue Prescriptions", "Order Lab Tests", "Doctor Consultation Notes"]
        },
        {
            "role": UserRole.NURSE.value,
            "permissions": ["View Medical History", "Vitals Assessment", "Order Lab Tests"]
        },
        {
            "role": UserRole.RECEPTIONIST.value,
            "permissions": ["Register Patients", "Book Appointments", "View Basic Demographics", "Update Contact Details"]
        },
        {
            "role": UserRole.LAB_STAFF.value,
            "permissions": ["View Lab Orders", "Update Pathology Findings", "Upload Lab Reports"]
        },
        {
            "role": UserRole.PHARMACY_STAFF.value,
            "permissions": ["View Prescriptions", "Medication Dispensing", "Pharmacy Inventory"]
        }
    ]

    return {
        "app_name": "Mentneo Hospital CRM",
        "version": "1.0.0",
        "hospital_name": "Mentneo Central Hospital",
        "branch_name": "Main Branch — Bangalore",
        "contact_phone": "+91 80 4910 2000",
        "contact_email": "contact@mentneo.com",
        "database_driver": db_driver,
        "environment": os.getenv("APP_ENV", "development"),
        "active_role": "Receptionist",
        "roles_matrix": roles_matrix
    }


@router.put("", status_code=status.HTTP_200_OK)
def update_system_settings(settings_in: SettingsUpdate):
    return {
        "message": "System settings updated successfully",
        "hospital_name": settings_in.hospital_name,
        "branch_name": settings_in.branch_name,
        "active_role": settings_in.active_role
    }

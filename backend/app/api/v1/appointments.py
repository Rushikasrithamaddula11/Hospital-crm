from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from pydantic import BaseModel, Field

from app.database.session import get_db
from app.models.patient import Appointment, Patient
from app.schemas.patient import AppointmentResponse
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/appointments", tags=["Appointments"])


class AppointmentCreate(BaseModel):
    patient_identifier: str = Field(..., description="Patient ID (PT-xxxxxx) or integer ID")
    appointment_date: str
    appointment_time: str
    doctor_name: str
    department: str
    type: str = "Consultation"
    status: str = "Scheduled"


class AppointmentStatusUpdate(BaseModel):
    status: str = Field(..., description="Scheduled, Completed, Cancelled, No Show")


@router.get("", response_model=dict)
def list_all_appointments(
    q: Optional[str] = Query(None, description="Search by Patient Name, Patient ID, Doctor Name"),
    status_filter: Optional[str] = Query(None, alias="status"),
    department: Optional[str] = Query(None),
    doctor_name: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Appointment).join(Patient, Appointment.patient_id == Patient.id).filter(Patient.is_deleted == False)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Patient.patient_id.ilike(term),
                Patient.first_name.ilike(term),
                Patient.last_name.ilike(term),
                (Patient.first_name + " " + Patient.last_name).ilike(term),
                Appointment.doctor_name.ilike(term),
                Appointment.department.ilike(term)
            )
        )

    if status_filter and status_filter != "All":
        query = query.filter(Appointment.status.ilike(status_filter.strip()))

    if department and department != "All":
        query = query.filter(Appointment.department.ilike(department.strip()))

    if doctor_name and doctor_name != "All":
        query = query.filter(Appointment.doctor_name.ilike(doctor_name.strip()))

    total = query.count()
    appointments = query.order_by(desc(Appointment.id)).offset(skip).limit(limit).all()

    # Build response items enriched with patient details
    items = []
    for app in appointments:
        p = app.patient
        items.append({
            "id": app.id,
            "patient_id": app.patient_id,
            "patient_id_str": p.patient_id if p else "PT-000000",
            "patient_name": f"{p.first_name} {p.last_name}" if p else "Unknown",
            "patient_mobile": p.address.mobile if (p and p.address) else "",
            "patient_age": p.age if p else 0,
            "patient_gender": p.gender if p else "",
            "appointment_date": app.appointment_date,
            "appointment_time": app.appointment_time,
            "doctor_name": app.doctor_name,
            "department": app.department,
            "type": app.type,
            "status": app.status
        })

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_appointment(
    app_in: AppointmentCreate,
    db: Session = Depends(get_db)
):
    # Lookup patient
    identifier = app_in.patient_identifier.strip()
    if identifier.isdigit():
        p = db.query(Patient).filter(Patient.id == int(identifier), Patient.is_deleted == False).first()
    else:
        p = db.query(Patient).filter(Patient.patient_id == identifier.upper(), Patient.is_deleted == False).first()

    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient '{identifier}' not found in database."
        )

    new_app = Appointment(
        patient_id=p.id,
        appointment_date=app_in.appointment_date,
        appointment_time=app_in.appointment_time,
        doctor_name=app_in.doctor_name,
        department=app_in.department,
        type=app_in.type,
        status=app_in.status
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    create_audit_log(
        db=db,
        patient_id_str=p.patient_id,
        action="Appointment Created",
        details=f"Booked appointment with {new_app.doctor_name} on {new_app.appointment_date} ({new_app.appointment_time})"
    )

    return {
        "id": new_app.id,
        "patient_id": p.id,
        "patient_id_str": p.patient_id,
        "patient_name": f"{p.first_name} {p.last_name}",
        "appointment_date": new_app.appointment_date,
        "appointment_time": new_app.appointment_time,
        "doctor_name": new_app.doctor_name,
        "department": new_app.department,
        "type": new_app.type,
        "status": new_app.status
    }


@router.put("/{app_id}/status")
def update_appointment_status(
    app_id: int,
    status_in: AppointmentStatusUpdate,
    db: Session = Depends(get_db)
):
    app_obj = db.query(Appointment).filter(Appointment.id == app_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Appointment record not found.")

    app_obj.status = status_in.status
    db.commit()

    if app_obj.patient:
        create_audit_log(
            db=db,
            patient_id_str=app_obj.patient.patient_id,
            action="Appointment Status Changed",
            details=f"Updated appointment #{app_id} status to '{status_in.status}'"
        )

    return {"message": "Status updated successfully", "status": app_obj.status}

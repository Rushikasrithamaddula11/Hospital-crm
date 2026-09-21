from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from pydantic import BaseModel, Field

from app.database.session import get_db
from app.models.patient import Prescription, Patient
from app.schemas.patient import MedicationItem
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


class PrescriptionCreate(BaseModel):
    patient_identifier: str = Field(..., description="Patient ID (PT-xxxxxx) or integer ID")
    doctor_name: str
    department: str
    date: str
    medications: List[MedicationItem]


@router.get("", response_model=dict)
def list_all_prescriptions(
    q: Optional[str] = Query(None, description="Search by Patient Name, Patient ID, Doctor Name, or Medication Name"),
    department: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Prescription).join(Patient, Prescription.patient_id == Patient.id).filter(Patient.is_deleted == False)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Patient.patient_id.ilike(term),
                Patient.first_name.ilike(term),
                Patient.last_name.ilike(term),
                (Patient.first_name + " " + Patient.last_name).ilike(term),
                Prescription.doctor_name.ilike(term),
                Prescription.department.ilike(term)
            )
        )

    if department and department != "All":
        query = query.filter(Prescription.department.ilike(department.strip()))

    total = query.count()
    prescriptions = query.order_by(desc(Prescription.id)).offset(skip).limit(limit).all()

    items = []
    for rx in prescriptions:
        p = rx.patient
        items.append({
            "id": rx.id,
            "patient_id": rx.patient_id,
            "patient_id_str": p.patient_id if p else "PT-000000",
            "patient_name": f"{p.first_name} {p.last_name}" if p else "Unknown",
            "patient_age": p.age if p else 0,
            "patient_gender": p.gender if p else "",
            "date": rx.date,
            "doctor_name": rx.doctor_name,
            "department": rx.department,
            "medications": rx.medications
        })

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_prescription(
    rx_in: PrescriptionCreate,
    db: Session = Depends(get_db)
):
    identifier = rx_in.patient_identifier.strip()
    if identifier.isdigit():
        p = db.query(Patient).filter(Patient.id == int(identifier), Patient.is_deleted == False).first()
    else:
        p = db.query(Patient).filter(Patient.patient_id == identifier.upper(), Patient.is_deleted == False).first()

    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient '{identifier}' not found in database."
        )

    meds_dict_list = [med.model_dump() for med in rx_in.medications]

    new_rx = Prescription(
        patient_id=p.id,
        date=rx_in.date,
        doctor_name=rx_in.doctor_name,
        department=rx_in.department,
        medications=meds_dict_list
    )
    db.add(new_rx)
    db.commit()
    db.refresh(new_rx)

    med_names = ", ".join([m["name"] for m in meds_dict_list])
    create_audit_log(
        db=db,
        patient_id_str=p.patient_id,
        action="Prescription Issued",
        details=f"Issued prescription by {new_rx.doctor_name} containing: {med_names}"
    )

    return {
        "id": new_rx.id,
        "patient_id": p.id,
        "patient_id_str": p.patient_id,
        "patient_name": f"{p.first_name} {p.last_name}",
        "date": new_rx.date,
        "doctor_name": new_rx.doctor_name,
        "department": new_rx.department,
        "medications": new_rx.medications
    }

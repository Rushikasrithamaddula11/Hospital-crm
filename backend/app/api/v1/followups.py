from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from pydantic import BaseModel, Field

from app.database.session import get_db
from app.models.patient import FollowUp, Patient
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/followups", tags=["Follow-ups"])


class FollowUpCreate(BaseModel):
    patient_identifier: str = Field(..., description="Patient ID (PT-xxxxxx) or integer ID")
    doctor_name: str
    followup_date: str
    reason: str
    status: str = "Pending"
    notes: Optional[str] = None


class FollowUpStatusUpdate(BaseModel):
    status: str = Field(..., description="Pending, Completed, Missed, Cancelled")


@router.get("", response_model=dict)
def list_all_followups(
    q: Optional[str] = Query(None, description="Search by Patient Name, Patient ID, Doctor Name, or Reason"),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(FollowUp).join(Patient, FollowUp.patient_id == Patient.id).filter(Patient.is_deleted == False)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Patient.patient_id.ilike(term),
                Patient.first_name.ilike(term),
                Patient.last_name.ilike(term),
                (Patient.first_name + " " + Patient.last_name).ilike(term),
                FollowUp.doctor_name.ilike(term),
                FollowUp.reason.ilike(term)
            )
        )

    if status_filter and status_filter != "All":
        query = query.filter(FollowUp.status.ilike(status_filter.strip()))

    total = query.count()
    followups = query.order_by(desc(FollowUp.id)).offset(skip).limit(limit).all()

    items = []
    for f in followups:
        p = f.patient
        items.append({
            "id": f.id,
            "patient_id": f.patient_id,
            "patient_id_str": p.patient_id if p else "PT-000000",
            "patient_name": f"{p.first_name} {p.last_name}" if p else "Unknown",
            "patient_age": p.age if p else 0,
            "patient_gender": p.gender if p else "",
            "patient_mobile": p.address.mobile if (p and p.address) else "",
            "followup_date": f.followup_date,
            "doctor_name": f.doctor_name,
            "reason": f.reason,
            "status": f.status,
            "notes": f.notes
        })

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_followup(
    fu_in: FollowUpCreate,
    db: Session = Depends(get_db)
):
    identifier = fu_in.patient_identifier.strip()
    if identifier.isdigit():
        p = db.query(Patient).filter(Patient.id == int(identifier), Patient.is_deleted == False).first()
    else:
        p = db.query(Patient).filter(Patient.patient_id == identifier.upper(), Patient.is_deleted == False).first()

    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient '{identifier}' not found in database."
        )

    new_fu = FollowUp(
        patient_id=p.id,
        followup_date=fu_in.followup_date,
        doctor_name=fu_in.doctor_name,
        reason=fu_in.reason,
        status=fu_in.status,
        notes=fu_in.notes
    )
    db.add(new_fu)

    # Also set patient status to "Follow-up"
    p.status = "Follow-up"

    db.commit()
    db.refresh(new_fu)

    create_audit_log(
        db=db,
        patient_id_str=p.patient_id,
        action="Follow-up Scheduled",
        details=f"Scheduled clinical follow-up for {new_fu.followup_date} with {new_fu.doctor_name}"
    )

    return {
        "id": new_fu.id,
        "patient_id": p.id,
        "patient_id_str": p.patient_id,
        "patient_name": f"{p.first_name} {p.last_name}",
        "followup_date": new_fu.followup_date,
        "doctor_name": new_fu.doctor_name,
        "reason": new_fu.reason,
        "status": new_fu.status,
        "notes": new_fu.notes
    }


@router.put("/{fu_id}/status")
def update_followup_status(
    fu_id: int,
    status_in: FollowUpStatusUpdate,
    db: Session = Depends(get_db)
):
    fu_obj = db.query(FollowUp).filter(FollowUp.id == fu_id).first()
    if not fu_obj:
        raise HTTPException(status_code=404, detail="Follow-up record not found.")

    fu_obj.status = status_in.status
    db.commit()

    if fu_obj.patient:
        create_audit_log(
            db=db,
            patient_id_str=fu_obj.patient.patient_id,
            action="Follow-up Status Updated",
            details=f"Updated follow-up #{fu_id} status to '{status_in.status}'"
        )

    return {"message": "Status updated successfully", "status": fu_obj.status}

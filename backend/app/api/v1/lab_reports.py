from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from pydantic import BaseModel, Field

from app.database.session import get_db
from app.models.patient import LabReport, Patient
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/lab-reports", tags=["Lab Reports"])


class LabReportCreate(BaseModel):
    patient_identifier: str = Field(..., description="Patient ID (PT-xxxxxx) or integer ID")
    test_name: str
    doctor_name: str
    date: str
    status: str = "Completed"
    report_summary: Optional[str] = None


@router.get("", response_model=dict)
def list_all_lab_reports(
    q: Optional[str] = Query(None, description="Search by Patient Name, Patient ID, Test Name, or Doctor Name"),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(LabReport).join(Patient, LabReport.patient_id == Patient.id).filter(Patient.is_deleted == False)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Patient.patient_id.ilike(term),
                Patient.first_name.ilike(term),
                Patient.last_name.ilike(term),
                (Patient.first_name + " " + Patient.last_name).ilike(term),
                LabReport.test_name.ilike(term),
                LabReport.doctor_name.ilike(term)
            )
        )

    if status_filter and status_filter != "All":
        query = query.filter(LabReport.status.ilike(status_filter.strip()))

    total = query.count()
    reports = query.order_by(desc(LabReport.id)).offset(skip).limit(limit).all()

    items = []
    for r in reports:
        p = r.patient
        items.append({
            "id": r.id,
            "patient_id": r.patient_id,
            "patient_id_str": p.patient_id if p else "PT-000000",
            "patient_name": f"{p.first_name} {p.last_name}" if p else "Unknown",
            "patient_age": p.age if p else 0,
            "patient_gender": p.gender if p else "",
            "test_name": r.test_name,
            "date": r.date,
            "doctor_name": r.doctor_name,
            "status": r.status,
            "report_summary": r.report_summary,
            "file_url": r.file_url
        })

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_lab_report(
    report_in: LabReportCreate,
    db: Session = Depends(get_db)
):
    identifier = report_in.patient_identifier.strip()
    if identifier.isdigit():
        p = db.query(Patient).filter(Patient.id == int(identifier), Patient.is_deleted == False).first()
    else:
        p = db.query(Patient).filter(Patient.patient_id == identifier.upper(), Patient.is_deleted == False).first()

    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient '{identifier}' not found in database."
        )

    new_report = LabReport(
        patient_id=p.id,
        test_name=report_in.test_name,
        date=report_in.date,
        doctor_name=report_in.doctor_name,
        status=report_in.status,
        report_summary=report_in.report_summary or "Physiological parameters evaluated. Summary within reference limits.",
        file_url="#"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    create_audit_log(
        db=db,
        patient_id_str=p.patient_id,
        action="Lab Report Added",
        details=f"Added lab report '{new_report.test_name}' ordered by {new_report.doctor_name}"
    )

    return {
        "id": new_report.id,
        "patient_id": p.id,
        "patient_id_str": p.patient_id,
        "patient_name": f"{p.first_name} {p.last_name}",
        "test_name": new_report.test_name,
        "date": new_report.date,
        "doctor_name": new_report.doctor_name,
        "status": new_report.status,
        "report_summary": new_report.report_summary
    }

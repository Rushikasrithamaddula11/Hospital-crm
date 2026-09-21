from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.patient import (
    PatientCreate, PatientUpdate, PatientResponse,
    VisitResponse, AppointmentResponse, PrescriptionResponse,
    LabReportResponse, ConsultationNoteResponse, FollowUpResponse,
    AuditLogResponse
)
from app.services import patient_service
from app.models.patient import Patient, Visit, Appointment, Prescription, LabReport, FollowUp

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("", response_model=dict)
def list_patients(
    q: Optional[str] = Query(None, description="Search by ID, Name, Mobile, Email"),
    gender: Optional[str] = Query(None, description="Gender filter"),
    status_filter: Optional[str] = Query(None, alias="status", description="Status filter (Active, Inactive, Follow-up)"),
    age_min: Optional[int] = Query(None, ge=0),
    age_max: Optional[int] = Query(None, le=130),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    patients, total = patient_service.list_patients(
        db=db,
        search_query=q,
        gender=gender,
        status=status_filter,
        age_min=age_min,
        age_max=age_max,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit
    )

    items = [PatientResponse.model_validate(p) for p in patients]

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db)
):
    new_patient = patient_service.create_patient_record(db=db, patient_in=patient_in)
    return PatientResponse.model_validate(new_patient)


@router.get("/{identifier}", response_model=PatientResponse)
def get_patient(
    identifier: str,
    db: Session = Depends(get_db)
):
    patient = patient_service.get_patient_by_id_or_pid(db=db, identifier=identifier)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with identifier '{identifier}' was not found."
        )
    return PatientResponse.model_validate(patient)


@router.put("/{identifier}", response_model=PatientResponse)
def update_patient(
    identifier: str,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db)
):
    patient = patient_service.get_patient_by_id_or_pid(db=db, identifier=identifier)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with identifier '{identifier}' was not found."
        )
    updated = patient_service.update_patient_record(db=db, patient=patient, patient_in=patient_in)
    return PatientResponse.model_validate(updated)


@router.delete("/{identifier}", status_code=status.HTTP_200_OK)
def delete_patient(
    identifier: str,
    db: Session = Depends(get_db)
):
    patient = patient_service.get_patient_by_id_or_pid(db=db, identifier=identifier)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with identifier '{identifier}' was not found."
        )
    patient_service.soft_delete_patient(db=db, patient=patient)
    return {
        "message": f"Patient {patient.patient_id} successfully archived.",
        "patient_id": patient.patient_id
    }


# Sub-resource Endpoints
@router.get("/{identifier}/visits", response_model=List[VisitResponse])
def get_patient_visits(identifier: str, db: Session = Depends(get_db)):
    patient = patient_service.get_patient_by_id_or_pid(db=db, identifier=identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    visits = patient_service.get_patient_visits(db, patient.id)
    return [VisitResponse.model_validate(v) for v in visits]


@router.get("/{identifier}/appointments", response_model=List[AppointmentResponse])
def get_patient_appointments(identifier: str, db: Session = Depends(get_db)):
    patient = patient_service.get_patient_by_id_or_pid(db=db, identifier=identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    apps = patient_service.get_patient_appointments(db, patient.id)
    return [AppointmentResponse.model_validate(a) for a in apps]


@router.get("/{identifier}/prescriptions", response_model=List[PrescriptionResponse])
def get_patient_prescriptions(identifier: str, db: Session = Depends(get_db)):
    patient = patient_service.get_patient_by_id_or_pid(db=db, identifier=identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    rx_list = patient_service.get_patient_prescriptions(db, patient.id)
    return [PrescriptionResponse.model_validate(r) for r in rx_list]


@router.get("/{identifier}/lab-reports", response_model=List[LabReportResponse])
def get_patient_lab_reports(identifier: str, db: Session = Depends(get_db)):
    patient = patient_service.get_patient_by_id_or_pid(db=db, identifier=identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    labs = patient_service.get_patient_lab_reports(db, patient.id)
    return [LabReportResponse.model_validate(l) for l in labs]


@router.get("/{identifier}/consultations", response_model=List[ConsultationNoteResponse])
def get_patient_consultations(identifier: str, db: Session = Depends(get_db)):
    patient = patient_service.get_patient_by_id_or_pid(db=db, identifier=identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    notes = patient_service.get_patient_consultations(db, patient.id)
    return [ConsultationNoteResponse.model_validate(n) for n in notes]


@router.get("/{identifier}/follow-ups", response_model=List[FollowUpResponse])
def get_patient_followups(identifier: str, db: Session = Depends(get_db)):
    patient = patient_service.get_patient_by_id_or_pid(db=db, identifier=identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    fus = patient_service.get_patient_followups(db, patient.id)
    return [FollowUpResponse.model_validate(f) for f in fus]


@router.get("/{identifier}/activity", response_model=List[AuditLogResponse])
def get_patient_activity(identifier: str, db: Session = Depends(get_db)):
    patient = patient_service.get_patient_by_id_or_pid(db=db, identifier=identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    logs = patient_service.get_patient_activity(db, patient.patient_id)
    return [AuditLogResponse.model_validate(l) for l in logs]

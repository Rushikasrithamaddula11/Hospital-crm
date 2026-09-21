from typing import List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from app.models.patient import (
    Patient, PatientAddress, EmergencyContact, Visit,
    Appointment, Prescription, LabReport, ConsultationNote,
    FollowUp, AuditLog
)
from app.schemas.patient import PatientCreate, PatientUpdate
from app.services.id_generator import generate_patient_id
from app.services.audit_service import create_audit_log
from app.database.firebase_config import get_firestore_db


def list_patients(
    db: Session,
    search_query: Optional[str] = None,
    gender: Optional[str] = None,
    status: Optional[str] = None,
    age_min: Optional[int] = None,
    age_max: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[Patient], int]:
    query = db.query(Patient).filter(Patient.is_deleted == False)

    # Search filter (Patient ID, Name, Mobile, Email)
    if search_query and search_query.strip():
        term = f"%{search_query.strip()}%"
        query = query.join(Patient.address, isouter=True).filter(
            or_(
                Patient.patient_id.ilike(term),
                Patient.first_name.ilike(term),
                Patient.last_name.ilike(term),
                (Patient.first_name + " " + Patient.last_name).ilike(term),
                PatientAddress.mobile.ilike(term),
                PatientAddress.email.ilike(term)
            )
        )

    # Gender filter
    if gender and gender.strip() and gender != "All":
        query = query.filter(Patient.gender.ilike(gender.strip()))

    # Status filter
    if status and status.strip() and status != "All":
        query = query.filter(Patient.status.ilike(status.strip()))

    # Age filter
    if age_min is not None:
        query = query.filter(Patient.age >= age_min)
    if age_max is not None:
        query = query.filter(Patient.age <= age_max)

    # Date filter
    if date_from:
        try:
            df = datetime.fromisoformat(date_from)
            query = query.filter(Patient.created_at >= df)
        except ValueError:
            pass
    if date_to:
        try:
            dt = datetime.fromisoformat(date_to)
            query = query.filter(Patient.created_at <= dt)
        except ValueError:
            pass

    total = query.count()
    patients = query.order_by(desc(Patient.created_at)).offset(skip).limit(limit).all()

    # Populate summary counts
    for p in patients:
        p.total_visits = db.query(Visit).filter(Visit.patient_id == p.id).count()
        p.total_appointments = db.query(Appointment).filter(Appointment.patient_id == p.id).count()
        p.total_prescriptions = db.query(Prescription).filter(Prescription.patient_id == p.id).count()
        p.total_lab_reports = db.query(LabReport).filter(LabReport.patient_id == p.id).count()
        p.total_followups = db.query(FollowUp).filter(FollowUp.patient_id == p.id).count()
        
        last_v = db.query(Visit).filter(Visit.patient_id == p.id).order_by(desc(Visit.visit_date)).first()
        p.last_visit_date = last_v.visit_date if last_v else (p.created_at.strftime("%d %b %Y") if p.created_at else None)

    return patients, total


def get_patient_by_id_or_pid(db: Session, identifier: str) -> Optional[Patient]:
    """Lookup patient by integer ID or string patient_id (e.g. PT-000001)"""
    query = db.query(Patient).filter(Patient.is_deleted == False)
    if identifier.isdigit():
        p = query.filter(Patient.id == int(identifier)).first()
    else:
        p = query.filter(Patient.patient_id == identifier.upper()).first()

    if p:
        p.total_visits = db.query(Visit).filter(Visit.patient_id == p.id).count()
        p.total_appointments = db.query(Appointment).filter(Appointment.patient_id == p.id).count()
        p.total_prescriptions = db.query(Prescription).filter(Prescription.patient_id == p.id).count()
        p.total_lab_reports = db.query(LabReport).filter(LabReport.patient_id == p.id).count()
        p.total_followups = db.query(FollowUp).filter(FollowUp.patient_id == p.id).count()
        
        last_v = db.query(Visit).filter(Visit.patient_id == p.id).order_by(desc(Visit.visit_date)).first()
        p.last_visit_date = last_v.visit_date if last_v else (p.created_at.strftime("%d %b %Y") if p.created_at else None)

    return p


def create_patient_record(db: Session, patient_in: PatientCreate) -> Patient:
    """Create a new patient record with auto-generated Patient ID"""
    new_pid = generate_patient_id(db)

    # Initial avatar initials photo if not provided
    photo_url = patient_in.profile_photo
    if not photo_url:
        initials = f"{patient_in.first_name[0]}{patient_in.last_name[0]}".upper()
        photo_url = f"https://api.dicebear.com/7.x/initials/svg?seed={initials}"

    db_patient = Patient(
        patient_id=new_pid,
        first_name=patient_in.first_name.strip(),
        last_name=patient_in.last_name.strip(),
        dob=patient_in.dob,
        age=patient_in.age,
        gender=patient_in.gender,
        blood_group=patient_in.blood_group,
        profile_photo=photo_url,
        occupation=patient_in.occupation,
        marital_status=patient_in.marital_status,
        preferred_language=patient_in.preferred_language,
        is_existing_patient=patient_in.is_existing_patient,
        status=patient_in.status or "Active",
        is_deleted=False
    )
    db.add(db_patient)
    db.flush()

    # Create address
    addr_data = patient_in.address
    db_address = PatientAddress(
        patient_id=db_patient.id,
        mobile=addr_data.mobile,
        alt_mobile=addr_data.alt_mobile,
        email=addr_data.email,
        address_line=addr_data.address_line,
        city=addr_data.city,
        state=addr_data.state,
        pincode=addr_data.pincode
    )
    db.add(db_address)

    # Create emergency contact if provided
    if patient_in.emergency_contact:
        ec = patient_in.emergency_contact
        db_ec = EmergencyContact(
            patient_id=db_patient.id,
            name=ec.name,
            relationship_type=ec.relationship,
            phone=ec.phone
        )
        db.add(db_ec)

    db.commit()
    db.refresh(db_patient)

    # Record Audit Log
    create_audit_log(
        db=db,
        patient_id_str=new_pid,
        action="Patient Registered",
        details=f"Registered patient {db_patient.first_name} {db_patient.last_name} with ID {new_pid}"
    )

    # Firestore Sync if enabled
    firestore_db = get_firestore_db()
    if firestore_db:
        try:
            firestore_db.collection("patients").document(new_pid).set({
                "patient_id": new_pid,
                "first_name": db_patient.first_name,
                "last_name": db_patient.last_name,
                "age": db_patient.age,
                "gender": db_patient.gender,
                "blood_group": db_patient.blood_group,
                "mobile": db_address.mobile,
                "email": db_address.email,
                "status": db_patient.status,
                "created_at": datetime.utcnow().isoformat()
            })
        except Exception as e:
            print(f"Firestore patient sync error: {e}")

    # Set initial zero counters
    db_patient.total_visits = 0
    db_patient.total_appointments = 0
    db_patient.total_prescriptions = 0
    db_patient.total_lab_reports = 0
    db_patient.total_followups = 0
    db_patient.last_visit_date = db_patient.created_at.strftime("%d %b %Y")

    return db_patient


def update_patient_record(db: Session, patient: Patient, patient_in: PatientUpdate) -> Patient:
    update_data = patient_in.model_dump(exclude_unset=True)

    # Update address if provided
    if "address" in update_data and update_data["address"]:
        addr_data = update_data.pop("address")
        if patient.address:
            for k, v in addr_data.items():
                if v is not None:
                    setattr(patient.address, k, v)
        else:
            patient.address = PatientAddress(patient_id=patient.id, **addr_data)

    # Update emergency contact if provided
    if "emergency_contact" in update_data and update_data["emergency_contact"]:
        ec_data = update_data.pop("emergency_contact")
        if patient.emergency_contact:
            for k, v in ec_data.items():
                if k == "relationship":
                    setattr(patient.emergency_contact, "relationship_type", v)
                elif v is not None:
                    setattr(patient.emergency_contact, k, v)
        else:
            patient.emergency_contact = EmergencyContact(
                patient_id=patient.id,
                name=ec_data.get("name"),
                relationship_type=ec_data.get("relationship"),
                phone=ec_data.get("phone")
            )

    # Update patient base fields
    for field, val in update_data.items():
        if val is not None:
            setattr(patient, field, val)

    patient.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(patient)

    # Record Audit Log
    create_audit_log(
        db=db,
        patient_id_str=patient.patient_id,
        action="Patient Information Updated",
        details=f"Updated details for patient {patient.patient_id}"
    )

    return patient


def soft_delete_patient(db: Session, patient: Patient) -> None:
    patient.is_deleted = True
    patient.status = "Inactive"
    patient.updated_at = datetime.utcnow()
    db.commit()

    create_audit_log(
        db=db,
        patient_id_str=patient.patient_id,
        action="Patient Record Archived",
        details=f"Soft deleted/archived patient record {patient.patient_id}"
    )


# Detail sub-resource queries
def get_patient_visits(db: Session, patient_id: int) -> List[Visit]:
    return db.query(Visit).filter(Visit.patient_id == patient_id).order_by(desc(Visit.id)).all()

def get_patient_appointments(db: Session, patient_id: int) -> List[Appointment]:
    return db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(desc(Appointment.id)).all()

def get_patient_prescriptions(db: Session, patient_id: int) -> List[Prescription]:
    return db.query(Prescription).filter(Prescription.patient_id == patient_id).order_by(desc(Prescription.id)).all()

def get_patient_lab_reports(db: Session, patient_id: int) -> List[LabReport]:
    return db.query(LabReport).filter(LabReport.patient_id == patient_id).order_by(desc(LabReport.id)).all()

def get_patient_consultations(db: Session, patient_id: int) -> List[ConsultationNote]:
    return db.query(ConsultationNote).filter(ConsultationNote.patient_id == patient_id).order_by(desc(ConsultationNote.id)).all()

def get_patient_followups(db: Session, patient_id: int) -> List[FollowUp]:
    return db.query(FollowUp).filter(FollowUp.patient_id == patient_id).order_by(desc(FollowUp.id)).all()

def get_patient_activity(db: Session, patient_id_str: str) -> List[AuditLog]:
    return db.query(AuditLog).filter(AuditLog.patient_id_str == patient_id_str).order_by(desc(AuditLog.timestamp)).all()

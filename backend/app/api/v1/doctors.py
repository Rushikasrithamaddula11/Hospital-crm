from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Boolean, DateTime, or_
from pydantic import BaseModel, Field

from app.database.session import get_db
from app.database.base import Base
from app.models.patient import Visit, Appointment, Prescription

# SQLAlchemy ORM Model for Doctor
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    qualification = Column(String, nullable=False, default="MBBS, MD")
    experience_years = Column(Integer, default=10)
    opd_room = Column(String, default="OPD Room 101")
    opd_timings = Column(String, default="09:00 AM - 01:00 PM")
    consultation_fee = Column(Integer, default=500)
    mobile = Column(String, nullable=True)
    email = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


router = APIRouter(prefix="/doctors", tags=["Doctors"])


class DoctorCreate(BaseModel):
    name: str = Field(..., min_length=1)
    department: str = Field(..., min_length=1)
    qualification: str = Field(default="MBBS, MD")
    experience_years: int = Field(default=10, ge=0)
    opd_room: str = Field(default="OPD Room 101")
    opd_timings: str = Field(default="09:00 AM - 01:00 PM")
    consultation_fee: int = Field(default=500, ge=0)
    mobile: Optional[str] = None
    email: Optional[str] = None


@router.get("", response_model=dict)
def list_doctors(
    q: Optional[str] = Query(None, description="Search by Doctor Name or Qualification"),
    department: Optional[str] = Query(None, description="Filter by Department"),
    db: Session = Depends(get_db)
):
    # Ensure tables exist
    Base.metadata.create_all(bind=db.get_bind())

    # Seed initial doctors if empty
    if db.query(Doctor).count() == 0:
        seed_doctors = [
            {"doctor_id": "DOC-001", "name": "Dr. Raj Kumar", "department": "Cardiology", "qualification": "MBBS, MD, DM (Cardiology)", "experience_years": 18, "opd_room": "Heart Wing - OPD 102", "opd_timings": "09:00 AM - 01:00 PM", "consultation_fee": 800, "mobile": "9876511101", "email": "raj.kumar@mentneo.com"},
            {"doctor_id": "DOC-002", "name": "Dr. Anil Sharma", "department": "General Medicine", "qualification": "MBBS, MD (Medicine)", "experience_years": 15, "opd_room": "Main Block - OPD 204", "opd_timings": "10:00 AM - 03:00 PM", "consultation_fee": 500, "mobile": "9876511102", "email": "anil.sharma@mentneo.com"},
            {"doctor_id": "DOC-003", "name": "Dr. Sneha Kulkarni", "department": "Pediatrics", "qualification": "MBBS, DCH, MD (Pediatrics)", "experience_years": 12, "opd_room": "Child Care Wing - OPD 105", "opd_timings": "09:30 AM - 01:30 PM", "consultation_fee": 600, "mobile": "9876511103", "email": "sneha.k@mentneo.com"},
            {"doctor_id": "DOC-004", "name": "Dr. Vivek Nambiar", "department": "Orthopedics", "qualification": "MBBS, MS (Ortho), Fellowship Joint Replacement", "experience_years": 16, "opd_room": "Ortho Wing - OPD 301", "opd_timings": "11:00 AM - 04:00 PM", "consultation_fee": 750, "mobile": "9876511104", "email": "vivek.n@mentneo.com"},
            {"doctor_id": "DOC-005", "name": "Dr. Farida Khan", "department": "Dermatology", "qualification": "MBBS, DVD, MD (Dermatology)", "experience_years": 9, "opd_room": "Skin Clinic - OPD 202", "opd_timings": "02:00 PM - 06:00 PM", "consultation_fee": 700, "mobile": "9876511105", "email": "farida.k@mentneo.com"},
            {"doctor_id": "DOC-006", "name": "Dr. Ramesh Sen", "department": "Neurology", "qualification": "MBBS, MD, DM (Neurology)", "experience_years": 20, "opd_room": "Neuro Block - OPD 401", "opd_timings": "10:00 AM - 02:00 PM", "consultation_fee": 1000, "mobile": "9876511106", "email": "ramesh.sen@mentneo.com"}
        ]
        for d_data in seed_doctors:
            db.add(Doctor(**d_data))
        db.commit()

    query = db.query(Doctor).filter(Doctor.is_active == True)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Doctor.name.ilike(term),
                Doctor.qualification.ilike(term),
                Doctor.department.ilike(term),
                Doctor.doctor_id.ilike(term)
            )
        )

    if department and department != "All":
        query = query.filter(Doctor.department.ilike(department.strip()))

    doctors = query.order_by(Doctor.id).all()

    # Build response enriched with live consultation counts
    items = []
    for doc in doctors:
        v_count = db.query(Visit).filter(Visit.doctor_name.ilike(f"%{doc.name}%")).count()
        app_count = db.query(Appointment).filter(Appointment.doctor_name.ilike(f"%{doc.name}%")).count()

        initials = "".join([part[0] for part in doc.name.replace("Dr. ", "").split() if part]).upper()
        photo_url = f"https://api.dicebear.com/7.x/initials/svg?seed=Doc{initials}"

        items.append({
            "id": doc.id,
            "doctor_id": doc.doctor_id,
            "name": doc.name,
            "department": doc.department,
            "qualification": doc.qualification,
            "experience_years": doc.experience_years,
            "opd_room": doc.opd_room,
            "opd_timings": doc.opd_timings,
            "consultation_fee": doc.consultation_fee,
            "mobile": doc.mobile,
            "email": doc.email,
            "photo": photo_url,
            "total_visits": v_count,
            "total_appointments": app_count,
            "status": "Available" if doc.is_active else "On Leave"
        })

    return {
        "items": items,
        "total": len(items)
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_doctor(
    doc_in: DoctorCreate,
    db: Session = Depends(get_db)
):
    count = db.query(Doctor).count()
    new_doc_id = f"DOC-{(count + 1):03d}"

    db_doc = Doctor(
        doctor_id=new_doc_id,
        name=doc_in.name.strip(),
        department=doc_in.department.strip(),
        qualification=doc_in.qualification.strip(),
        experience_years=doc_in.experience_years,
        opd_room=doc_in.opd_room.strip(),
        opd_timings=doc_in.opd_timings.strip(),
        consultation_fee=doc_in.consultation_fee,
        mobile=doc_in.mobile,
        email=doc_in.email,
        is_active=True
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    return {
        "id": db_doc.id,
        "doctor_id": db_doc.doctor_id,
        "name": db_doc.name,
        "department": db_doc.department,
        "qualification": db_doc.qualification,
        "opd_room": db_doc.opd_room,
        "opd_timings": db_doc.opd_timings,
        "consultation_fee": db_doc.consultation_fee
    }

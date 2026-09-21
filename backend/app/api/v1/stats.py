from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.patient import Patient, Visit, Appointment, Prescription, LabReport, FollowUp

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_patients = db.query(Patient).filter(Patient.is_deleted == False).count()
    active_patients = db.query(Patient).filter(Patient.is_deleted == False, Patient.status == "Active").count()
    followup_patients = db.query(Patient).filter(Patient.is_deleted == False, Patient.status == "Follow-up").count()
    total_visits = db.query(Visit).count()
    scheduled_appointments = db.query(Appointment).filter(Appointment.status == "Scheduled").count()
    total_prescriptions = db.query(Prescription).count()
    total_lab_reports = db.query(LabReport).count()
    pending_followups = db.query(FollowUp).filter(FollowUp.status == "Pending").count()

    return {
        "total_patients": total_patients,
        "active_patients": active_patients,
        "followup_patients": followup_patients,
        "total_visits": total_visits,
        "scheduled_appointments": scheduled_appointments,
        "total_prescriptions": total_prescriptions,
        "total_lab_reports": total_lab_reports,
        "pending_followups": pending_followups
    }

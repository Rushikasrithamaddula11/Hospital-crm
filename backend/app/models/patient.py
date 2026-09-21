from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    dob = Column(String, nullable=True)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    blood_group = Column(String, nullable=False, default="Unknown")
    profile_photo = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    preferred_language = Column(String, nullable=True, default="English")
    is_existing_patient = Column(Boolean, default=False)
    status = Column(String, default="Active")  # Active, Inactive, Follow-up
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    address = relationship("PatientAddress", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    emergency_contact = relationship("EmergencyContact", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    visits = relationship("Visit", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    lab_reports = relationship("LabReport", back_populates="patient", cascade="all, delete-orphan")
    consultations = relationship("ConsultationNote", back_populates="patient", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="patient", cascade="all, delete-orphan")


class PatientAddress(Base):
    __tablename__ = "patient_addresses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    mobile = Column(String, nullable=False)
    alt_mobile = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address_line = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="address")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    name = Column(String, nullable=True)
    relationship_type = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="emergency_contact")


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    visit_date = Column(String, nullable=False)
    department = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    visit_type = Column(String, nullable=False, default="OP Consultation")
    status = Column(String, nullable=False, default="Completed")

    patient = relationship("Patient", back_populates="visits")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_date = Column(String, nullable=False)
    appointment_time = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    type = Column(String, nullable=False, default="Consultation")
    status = Column(String, nullable=False, default="Scheduled")  # Scheduled, Completed, Cancelled, No Show

    patient = relationship("Patient", back_populates="appointments")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    date = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    medications = Column(JSON, nullable=False)  # List of {name, dosage, frequency, duration}

    patient = relationship("Patient", back_populates="prescriptions")


class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    test_name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Completed")
    report_summary = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="lab_reports")


class ConsultationNote(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    date = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    symptoms = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)
    plan = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="consultations")


class FollowUp(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    followup_date = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Pending")  # Pending, Completed, Missed, Cancelled
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="followups")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id_str = Column(String, nullable=True, index=True)
    action = Column(String, nullable=False)
    performed_by = Column(String, nullable=False, default="Receptionist R102")
    role = Column(String, nullable=False, default="Receptionist")
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)

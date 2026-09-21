from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
import re

class EmergencyContactBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    name: Optional[str] = None
    relationship: Optional[str] = Field(default=None, alias="relationship_type")
    phone: Optional[str] = None


class PatientAddressBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    mobile: str = Field(..., description="10-digit Indian mobile number")
    alt_mobile: Optional[str] = None
    email: Optional[str] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        clean = re.sub(r"\D", "", v)
        if len(clean) < 10:
            raise ValueError("Mobile number must be at least 10 digits")
        return clean[-10:]

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: Optional[str]) -> Optional[str]:
        if v and v.strip():
            clean = v.strip()
            if not re.match(r"^\d{6}$", clean):
                raise ValueError("Pincode must be a valid 6-digit number")
            return clean
        return None


class PatientCreate(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    dob: Optional[str] = None
    age: int = Field(..., ge=0, le=130)
    gender: str = Field(..., description="Male, Female, Other, Prefer not to say")
    blood_group: str = Field(default="Unknown")
    profile_photo: Optional[str] = None
    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    preferred_language: Optional[str] = "English"
    is_existing_patient: bool = False
    status: str = Field(default="Active")  # Active, Inactive, Follow-up

    address: PatientAddressBase
    emergency_contact: Optional[EmergencyContactBase] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    profile_photo: Optional[str] = None
    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    preferred_language: Optional[str] = None
    is_existing_patient: Optional[bool] = None
    status: Optional[str] = None

    address: Optional[PatientAddressBase] = None
    emergency_contact: Optional[EmergencyContactBase] = None


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: str
    first_name: str
    last_name: str
    dob: Optional[str] = None
    age: int
    gender: str
    blood_group: str
    profile_photo: Optional[str] = None
    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    preferred_language: Optional[str] = None
    is_existing_patient: bool
    status: str
    created_at: datetime
    updated_at: datetime
    
    address: Optional[PatientAddressBase] = None
    emergency_contact: Optional[EmergencyContactBase] = None

    # Summary counts
    total_visits: int = 0
    total_appointments: int = 0
    total_prescriptions: int = 0
    total_lab_reports: int = 0
    total_followups: int = 0
    last_visit_date: Optional[str] = None


class VisitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    visit_date: str
    department: str
    doctor_name: str
    visit_type: str
    status: str


class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    appointment_date: str
    appointment_time: str
    doctor_name: str
    department: str
    type: str
    status: str


class MedicationItem(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str


class PrescriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    date: str
    doctor_name: str
    department: str
    medications: List[MedicationItem]


class LabReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    test_name: str
    date: str
    doctor_name: str
    status: str
    report_summary: Optional[str] = None
    file_url: Optional[str] = None


class ConsultationNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    date: str
    doctor_name: str
    department: str
    symptoms: Optional[str] = None
    clinical_notes: Optional[str] = None
    diagnosis: Optional[str] = None
    plan: Optional[str] = None


class FollowUpResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    followup_date: str
    doctor_name: str
    reason: str
    status: str
    notes: Optional[str] = None


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id_str: Optional[str] = None
    action: str
    performed_by: str
    role: str
    timestamp: datetime
    details: Optional[str] = None

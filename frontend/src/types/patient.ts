export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
export type PatientStatus = 'Active' | 'Inactive' | 'Follow-up' | 'In Consultation';

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
  relationship_type?: string;
}

export interface Patient {
  id?: string;
  patient_id?: string;
  patientNumber: string; // e.g. PT-000001
  firstName: string;
  first_name?: string;
  lastName: string;
  last_name?: string;
  dateOfBirth: string;
  dob?: string;
  gender: Gender;
  phone: string;
  email?: string;
  address?: any;
  bloodGroup: BloodGroup;
  blood_group?: BloodGroup;
  allergies?: string;
  conditions?: string;
  emergencyContact?: EmergencyContact;
  emergency_contact?: EmergencyContact;
  photoUrl?: string;
  profile_photo?: string;
  qrCodeUrl?: string;
  status: PatientStatus;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  age?: number;
  lastVisitDate?: string;
  last_visit_date?: string;
  occupation?: string;
  marital_status?: string;
  preferred_language?: string;
  is_existing_patient?: boolean;
  total_visits?: number;
  total_appointments?: number;
  total_prescriptions?: number;
  total_lab_reports?: number;
  total_followups?: number;
}

export interface PatientFormData {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  dateOfBirth?: string;
  dob?: string;
  age?: number;
  gender?: Gender;
  phone?: string;
  email?: string;
  address?: any;
  bloodGroup?: BloodGroup;
  blood_group?: BloodGroup;
  allergies?: string;
  conditions?: string;
  emergencyContact?: EmergencyContact;
  emergency_contact?: EmergencyContact;
  occupation?: string;
  marital_status?: string;
  preferred_language?: string;
  is_existing_patient?: boolean;
  status?: any;
  profile_photo?: string;
}

export interface PatientFilters {
  q?: string;
  gender?: string;
  status?: string;
  age_min?: number;
  age_max?: number;
  date_from?: string;
  date_to?: string;
}

export interface Visit {
  id: string;
  patientNumber: string;
  visitDate: string;
  department: string;
  doctorName: string;
  diagnosis: string;
  type: string;
}

export interface ConsultationNote {
  id: string;
  patientNumber: string;
  doctorName: string;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentPlan: string;
}

export interface FollowUp {
  id: string;
  patientNumber: string;
  scheduledDate: string;
  department: string;
  doctorName: string;
  status: string;
  notes: string;
}

export interface DashboardStats {
  totalPatients: number;
  activeAppointments: number;
  prescriptionsIssued: number;
  labReportsCompleted: number;
}

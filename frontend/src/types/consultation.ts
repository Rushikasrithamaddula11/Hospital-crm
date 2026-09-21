export interface Consultation {
  id?: string;
  patientId: string;
  patientNumber: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  appointmentId?: string;
  chiefComplaint: string;
  symptoms: string;
  diagnosis: string;
  clinicalNotes: string;
  treatmentPlan: string;
  recommendedTests?: string;
  followupInstructions?: string;
  createdAt: string;
}

export interface Medication {
  medicine: string;
  medicationName?: string;
  dosage: string; // e.g. 500 mg
  frequency: string; // e.g. Twice Daily
  duration: string; // e.g. 3 Days
  durationDays?: number;
  instructions?: string;
}

export interface Prescription {
  id?: string;
  patientId?: string;
  patientNumber: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  department?: string;
  diagnosis?: string;
  consultationId?: string;
  date?: string;
  medications: Medication[];
  notes?: string;
  status?: string;
  createdAt: string;
}

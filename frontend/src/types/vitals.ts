export interface PatientVitals {
  id?: string;
  patientId?: string;
  patientNumber: string;
  patientName: string;
  bloodPressure: string; // e.g. 120/80 mmHg
  heartRate: number; // e.g. 72 bpm
  temperature: number; // e.g. 98.6 °F
  spO2: number; // e.g. 98 %
  weight: number; // e.g. 68 kg
  weightKg?: number;
  notes?: string;
  recordedBy: string; // Nurse Name
  recordedAt: string;
}

import { UserRole } from './user';

export interface AuditLog {
  id?: string;
  user: string; // e.g. Dr. Anil or admin@hospital.com
  role: UserRole;
  action: string;
  module: string; // e.g. Patients, Consultations, Prescriptions, Lab Reports
  patientNumber?: string;
  description: string;
  timestamp: string;
}

export type UserRole = 'Admin' | 'Doctor' | 'Nurse' | 'Patient';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  specialization?: string;
  patientId?: string; // Linked Patient ID if role is Patient
  status: 'Active' | 'Inactive' | 'On Leave';
  createdAt: string;
}

export interface DemoAccount {
  email: string;
  role: UserRole;
  label: string;
  description: string;
  patientId?: string;
}

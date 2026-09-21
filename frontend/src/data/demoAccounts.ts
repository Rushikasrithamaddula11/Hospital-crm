import { DemoAccount } from '../types/user';

export const DEMO_PASSWORD = "admin@123";
export const DEFAULT_DEMO_PASSWORD = DEMO_PASSWORD;

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@gmail.com',
    role: 'Admin',
    label: 'Hospital Admin',
    description: 'Manage Patients, Doctors, and Nurses'
  },
  {
    email: 'doctor@hospital.com',
    role: 'Doctor',
    label: 'Doctor (Dr. Anil Sharma)',
    description: 'OPD schedule, consultations, digital prescriptions, lab orders'
  },
  {
    email: 'nurse@hospital.com',
    role: 'Nurse',
    label: 'Nurse (Sister Meera)',
    description: 'Assigned OPD/Ward patients, vitals recording (BP, Pulse, Temp, SpO2)'
  },
  {
    email: 'patient@hospital.com',
    role: 'Patient',
    patientId: 'PT-000001',
    label: 'Patient (Rahul Kumar)',
    description: 'Outpatient (OP) record: OP ticket, QR card, prescriptions, lab reports'
  }
];

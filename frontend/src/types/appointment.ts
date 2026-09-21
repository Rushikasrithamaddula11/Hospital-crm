export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'In Consultation' | 'Completed' | 'Cancelled';

export interface Appointment {
  id?: string;
  patientId?: string; // Document ID or patientNumber
  patientNumber: string;
  patientName: string;
  patientPhone?: string;
  patientAge?: number;
  patientGender?: string;
  doctorId?: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType?: 'Consultation' | 'Follow-up' | 'Routine Checkup' | 'Emergency';
  type?: string;
  reason?: string;
  status: AppointmentStatus;
  createdAt: string;
}

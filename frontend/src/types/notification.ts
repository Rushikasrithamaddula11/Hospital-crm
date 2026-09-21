export type NotificationType =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'prescription_available'
  | 'lab_report_available'
  | 'new_consultation'
  | 'hospital_announcement';

export interface AppNotification {
  id?: string;
  notificationId?: string;
  userId: string; // Patient/User UID or role target
  patientNumber?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './config';
import { Patient, PatientFormData } from '../types/patient';
import { Appointment } from '../types/appointment';
import { Consultation } from '../types/consultation';
import { Prescription } from '../types/prescription';
import { LabReport } from '../types/labReport';
import { PatientVitals } from '../types/vitals';
import { AppNotification } from '../types/notification';
import { AuditLog } from '../types/auditLog';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_NURSES,
  INITIAL_DEPARTMENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_CONSULTATIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_REPORTS,
  INITIAL_VITALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from '../data/seedData';

// Local storage backup keys for zero-config offline execution
const LOCAL_STORAGE_KEY_PREFIX = 'hospital_crm_';

const getLocalStore = <T>(key: string, defaultVal: T[]): T[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setLocalStore = <T>(key: string, val: T[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch {}
};

// Seed utility to load all demo data into Firestore/LocalStore
export const seedFirestoreDemoData = async (): Promise<void> => {
  setLocalStore('patients', INITIAL_PATIENTS);
  setLocalStore('doctors', INITIAL_DOCTORS);
  setLocalStore('nurses', INITIAL_NURSES);
  setLocalStore('departments', INITIAL_DEPARTMENTS);
  setLocalStore('appointments', INITIAL_APPOINTMENTS);
  setLocalStore('consultations', INITIAL_CONSULTATIONS);
  setLocalStore('prescriptions', INITIAL_PRESCRIPTIONS);
  setLocalStore('labReports', INITIAL_LAB_REPORTS);
  setLocalStore('vitals', INITIAL_VITALS);
  setLocalStore('notifications', INITIAL_NOTIFICATIONS);
  setLocalStore('auditLogs', INITIAL_AUDIT_LOGS);

  // Sync to Cloud Firestore if connected
  try {
    for (const pat of INITIAL_PATIENTS) {
      await setDoc(doc(db, 'patients', pat.patientNumber), pat, { merge: true });
    }
  } catch (e) {
    console.log('Local store seeded successfully (Firestore offline mode).');
  }
};

// Ensure seed data exists on first load
if (!localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'patients')) {
  seedFirestoreDemoData();
}

// ---------------- Patients Firestore Service ----------------
export const getPatients = async (): Promise<Patient[]> => {
  try {
    const snap = await getDocs(collection(db, 'patients'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Patient));
    }
  } catch (e) {}
  return getLocalStore<Patient>('patients', INITIAL_PATIENTS);
};

export const getPatientByNumber = async (patientNumber: string): Promise<Patient | null> => {
  const all = await getPatients();
  return all.find(p => p.patientNumber === patientNumber || p.id === patientNumber || p.patient_id === patientNumber) || null;
};

export const generateNextPatientNumber = async (): Promise<string> => {
  const all = await getPatients();
  let maxSeq = 0;
  for (const p of all) {
    if (p.patientNumber && p.patientNumber.startsWith('PT-')) {
      try {
        const seq = parseInt(p.patientNumber.split('-')[1], 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      } catch (e) {}
    }
  }
  const nextSeq = maxSeq + 1;
  return `PT-${nextSeq.toString().padStart(6, '0')}`;
};

export const createPatientRecord = async (formData: PatientFormData): Promise<Patient> => {
  const patientNumber = await generateNextPatientNumber();
  const now = new Date().toISOString();

  const dobStr = formData.dateOfBirth || formData.dob || '1990-05-15';
  const dobDate = new Date(dobStr);
  const calculatedAge = !isNaN(dobDate.getTime()) ? Math.abs(new Date(Date.now() - dobDate.getTime()).getUTCFullYear() - 1970) : (formData.age || 30);

  const fn = formData.firstName || formData.first_name || 'Patient';
  const ln = formData.lastName || formData.last_name || 'Record';
  const initials = `${fn[0]}${ln[0]}`.toUpperCase();
  const photoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${initials}`;

  const phoneStr = formData.phone || (typeof formData.address === 'object' ? formData.address?.mobile : '') || '+1 (555) 000-0000';
  const emailStr = formData.email || (typeof formData.address === 'object' ? formData.address?.email : '') || 'patient@example.com';
  const bg = formData.bloodGroup || formData.blood_group || 'O+';
  const gen = formData.gender || 'Male';

  const newPatient: Patient = {
    id: patientNumber,
    patientNumber,
    patient_id: patientNumber,
    firstName: fn,
    first_name: fn,
    lastName: ln,
    last_name: ln,
    dateOfBirth: dobStr,
    dob: dobStr,
    gender: gen,
    phone: phoneStr,
    email: emailStr,
    address: formData.address,
    bloodGroup: bg,
    blood_group: bg,
    allergies: formData.allergies || 'None',
    conditions: formData.conditions || 'None',
    emergencyContact: formData.emergencyContact || formData.emergency_contact,
    emergency_contact: formData.emergencyContact || formData.emergency_contact,
    photoUrl,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${patientNumber}`,
    status: 'Active',
    createdAt: now,
    created_at: now,
    updatedAt: now,
    age: calculatedAge,
    lastVisitDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  try {
    await setDoc(doc(db, 'patients', patientNumber), newPatient);
  } catch (e) {}

  const local = getLocalStore<Patient>('patients', INITIAL_PATIENTS);
  setLocalStore('patients', [newPatient, ...local]);

  // Log Audit Entry
  await addAuditLog({
    user: 'admin@gmail.com',
    role: 'Admin',
    action: 'Registered Patient',
    module: 'Patients',
    patientNumber,
    description: `Registered patient ${newPatient.firstName} ${newPatient.lastName} (${patientNumber})`,
    timestamp: now
  });

  return newPatient;
};

// ---------------- Appointments Firestore Service ----------------
export const getNextOpSlotForDoctor = async (doctorName: string): Promise<string> => {
  const allAppointments = await getAppointments();
  const docApps = allAppointments.filter(a =>
    (a.doctorName && a.doctorName.toLowerCase().includes(doctorName.toLowerCase())) ||
    ((a as any).doctor_name && (a as any).doctor_name.toLowerCase().includes(doctorName.toLowerCase()))
  );

  const count = docApps.length;

  let currentMins = 9 * 60; // 540 mins (9:00 AM)
  const lunchStart = 12 * 60; // 720 mins (12:00 PM)
  const lunchEnd = 14 * 60; // 840 mins (2:00 PM)
  const dayEnd = 22 * 60 + 30; // 1350 mins (10:30 PM)

  for (let i = 0; i < count; i++) {
    currentMins += 10;
    if (currentMins >= lunchStart && currentMins < lunchEnd) {
      currentMins = lunchEnd;
    }
    if (currentMins > dayEnd - 10) {
      currentMins = 9 * 60;
    }
  }

  const hours = Math.floor(currentMins / 60);
  const mins = currentMins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = mins.toString().padStart(2, '0');

  return `${displayHour.toString().padStart(2, '0')}:${displayMins} ${period}`;
};

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const snap = await getDocs(collection(db, 'appointments'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
    }
  } catch (e) {}
  return getLocalStore<Appointment>('appointments', INITIAL_APPOINTMENTS);
};

export const createAppointmentRecord = async (appData: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> => {
  const now = new Date().toISOString();
  const id = `app-${Date.now()}`;
  const newApp: Appointment = { ...appData, id, createdAt: now };

  try {
    await setDoc(doc(db, 'appointments', id), newApp);
  } catch (e) {}

  const local = getLocalStore<Appointment>('appointments', INITIAL_APPOINTMENTS);
  setLocalStore('appointments', [newApp, ...local]);

  // Create Notification for Patient & Doctor
  await addNotificationRecord({
    userId: 'patient@hospital.com',
    patientNumber: appData.patientNumber,
    title: 'Appointment Booked',
    message: `Appointment with ${appData.doctorName} (${appData.department}) scheduled for ${appData.appointmentDate} at ${appData.appointmentTime}.`,
    type: 'appointment_confirmation',
    read: false,
    createdAt: now
  });

  await addAuditLog({
    user: 'admin@gmail.com',
    role: 'Admin',
    action: 'Booked Appointment',
    module: 'Appointments',
    patientNumber: appData.patientNumber,
    description: `Booked appointment for ${appData.patientName} with ${appData.doctorName}`,
    timestamp: now
  });

  return newApp;
};

export const updateAppointmentStatus = async (appId: string, status: Appointment['status']): Promise<void> => {
  const local = getLocalStore<Appointment>('appointments', INITIAL_APPOINTMENTS);
  const updated = local.map(a => (a.id === appId ? { ...a, status } : a));
  setLocalStore('appointments', updated);
};

// ---------------- Consultations Firestore Service ----------------
export const getConsultations = async (patientNumber?: string): Promise<Consultation[]> => {
  const local = getLocalStore<Consultation>('consultations', INITIAL_CONSULTATIONS);
  if (patientNumber) {
    return local.filter(c => c.patientNumber === patientNumber);
  }
  return local;
};

export const createConsultationRecord = async (cData: Omit<Consultation, 'id' | 'createdAt'>): Promise<Consultation> => {
  const now = new Date().toISOString();
  const id = `c-${Date.now()}`;
  const newConsultation: Consultation = { ...cData, id, createdAt: now };

  const local = getLocalStore<Consultation>('consultations', INITIAL_CONSULTATIONS);
  setLocalStore('consultations', [newConsultation, ...local]);

  // Create Notification
  await addNotificationRecord({
    userId: 'patient@hospital.com',
    patientNumber: cData.patientNumber,
    title: 'Consultation Completed',
    message: `Dr. ${cData.doctorName} completed your consultation for ${cData.chiefComplaint}.`,
    type: 'new_consultation',
    read: false,
    createdAt: now
  });

  await addAuditLog({
    user: cData.doctorName,
    role: 'Doctor',
    action: 'Completed Consultation',
    module: 'Consultations',
    patientNumber: cData.patientNumber,
    description: `Doctor ${cData.doctorName} completed consultation for ${cData.patientName}`,
    timestamp: now
  });

  return newConsultation;
};

// ---------------- Prescriptions Firestore Service ----------------
export const getPrescriptions = async (patientNumber?: string): Promise<Prescription[]> => {
  const local = getLocalStore<Prescription>('prescriptions', INITIAL_PRESCRIPTIONS);
  if (patientNumber) {
    return local.filter(p => p.patientNumber === patientNumber);
  }
  return local;
};

export const createPrescriptionRecord = async (pData: Omit<Prescription, 'id' | 'createdAt'>): Promise<Prescription> => {
  const now = new Date().toISOString();
  const id = `rx-${Date.now()}`;
  const newRx: Prescription = { ...pData, id, createdAt: now };

  const local = getLocalStore<Prescription>('prescriptions', INITIAL_PRESCRIPTIONS);
  setLocalStore('prescriptions', [newRx, ...local]);

  await addNotificationRecord({
    userId: 'patient@hospital.com',
    patientNumber: pData.patientNumber,
    title: 'New Prescription Available',
    message: `Dr. ${pData.doctorName} issued prescription with ${pData.medications.length} medications.`,
    type: 'prescription_available',
    read: false,
    createdAt: now
  });

  await addAuditLog({
    user: pData.doctorName,
    role: 'Doctor',
    action: 'Issued Prescription',
    module: 'Prescriptions',
    patientNumber: pData.patientNumber,
    description: `Issued prescription for ${pData.patientName}`,
    timestamp: now
  });

  return newRx;
};

// ---------------- Lab Reports Firestore Service ----------------
export const getLabReports = async (patientNumber?: string): Promise<LabReport[]> => {
  const local = getLocalStore<LabReport>('labReports', INITIAL_LAB_REPORTS);
  if (patientNumber) {
    return local.filter(r => r.patientNumber === patientNumber);
  }
  return local;
};

export const createLabReportRecord = async (rData: Omit<LabReport, 'id' | 'createdAt'>): Promise<LabReport> => {
  const now = new Date().toISOString();
  const id = `lab-${Date.now()}`;
  const newReport: LabReport = { ...rData, id, createdAt: now };

  const local = getLocalStore<LabReport>('labReports', INITIAL_LAB_REPORTS);
  setLocalStore('labReports', [newReport, ...local]);

  await addNotificationRecord({
    userId: 'patient@hospital.com',
    patientNumber: rData.patientNumber,
    title: 'Lab Report Uploaded',
    message: `Your ${rData.testName} lab report is now ready and viewable in your profile.`,
    type: 'lab_report_available',
    read: false,
    createdAt: now
  });

  await addAuditLog({
    user: 'admin@hospital.com',
    role: 'Admin',
    action: 'Uploaded Lab Report',
    module: 'Lab Reports',
    patientNumber: rData.patientNumber,
    description: `Uploaded ${rData.testName} report for ${rData.patientName}`,
    timestamp: now
  });

  return newReport;
};

// ---------------- Vitals Firestore Service ----------------
export const getPatientVitals = async (patientNumber?: string): Promise<PatientVitals[]> => {
  const local = getLocalStore<PatientVitals>('vitals', INITIAL_VITALS);
  if (patientNumber) {
    return local.filter(v => v.patientNumber === patientNumber);
  }
  return local;
};

export const recordPatientVitals = async (vData: Omit<PatientVitals, 'id'>): Promise<PatientVitals> => {
  const id = `v-${Date.now()}`;
  const newVitals: PatientVitals = { ...vData, id };

  const local = getLocalStore<PatientVitals>('vitals', INITIAL_VITALS);
  setLocalStore('vitals', [newVitals, ...local]);

  await addAuditLog({
    user: vData.recordedBy,
    role: 'Nurse',
    action: 'Recorded Vitals',
    module: 'Nurse Dashboard',
    patientNumber: vData.patientNumber,
    description: `Recorded BP ${vData.bloodPressure}, HR ${vData.heartRate} bpm for ${vData.patientName}`,
    timestamp: vData.recordedAt
  });

  return newVitals;
};

// ---------------- Notifications Firestore Service ----------------
export const getNotifications = async (userId?: string): Promise<AppNotification[]> => {
  const local = getLocalStore<AppNotification>('notifications', INITIAL_NOTIFICATIONS);
  if (userId) {
    return local.filter(n => n.userId === userId || n.userId === 'all');
  }
  return local;
};

export const addNotificationRecord = async (nData: Omit<AppNotification, 'id'>): Promise<AppNotification> => {
  const id = `notif-${Date.now()}`;
  const newNotif: AppNotification = { ...nData, id, notificationId: id };

  const local = getLocalStore<AppNotification>('notifications', INITIAL_NOTIFICATIONS);
  setLocalStore('notifications', [newNotif, ...local]);
  return newNotif;
};

export const markNotificationAsRead = async (notifId: string): Promise<void> => {
  const local = getLocalStore<AppNotification>('notifications', INITIAL_NOTIFICATIONS);
  const updated = local.map(n => (n.id === notifId || n.notificationId === notifId ? { ...n, read: true } : n));
  setLocalStore('notifications', updated);
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const local = getLocalStore<AppNotification>('notifications', INITIAL_NOTIFICATIONS);
  const updated = local.map(n => (n.userId === userId || userId === 'all' ? { ...n, read: true } : n));
  setLocalStore('notifications', updated);
};

// ---------------- Audit Logs Firestore Service ----------------
export const getAuditLogs = async (): Promise<AuditLog[]> => {
  return getLocalStore<AuditLog>('auditLogs', INITIAL_AUDIT_LOGS);
};

export const addAuditLog = async (logData: Omit<AuditLog, 'id'>): Promise<AuditLog> => {
  const id = `audit-${Date.now()}`;
  const newLog: AuditLog = { ...logData, id };

  const local = getLocalStore<AuditLog>('auditLogs', INITIAL_AUDIT_LOGS);
  setLocalStore('auditLogs', [newLog, ...local]);
  return newLog;
};

// ---------------- Doctors & Nurses Service ----------------
export const getDoctorsList = async () => getLocalStore('doctors', INITIAL_DOCTORS);
export const getNursesList = async () => getLocalStore('nurses', INITIAL_NURSES);
export const getDepartmentsList = async () => getLocalStore('departments', INITIAL_DEPARTMENTS);

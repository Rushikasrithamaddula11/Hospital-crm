import {
  getPatients as fetchPatientsFromFirestore,
  getPatientByNumber,
  createPatientRecord,
  getAppointments,
  getPrescriptions,
  getLabReports,
  getConsultations
} from '../firebase/firestore';
import {
  Patient,
  PatientFormData,
  PatientFilters,
  Visit,
  ConsultationNote,
  FollowUp,
  DashboardStats
} from '../types/patient';
import { Appointment } from '../types/appointment';
import { Prescription } from '../types/prescription';
import { LabReport } from '../types/labReport';
import { AuditLog } from '../types/auditLog';

export const patientService = {
  getPatients: async (filters?: PatientFilters, skip = 0, limit = 100) => {
    let list = await fetchPatientsFromFirestore();

    if (filters?.q) {
      const qLower = filters.q.toLowerCase();
      list = list.filter(p =>
        p.firstName.toLowerCase().includes(qLower) ||
        p.lastName.toLowerCase().includes(qLower) ||
        p.patientNumber.toLowerCase().includes(qLower) ||
        (p.phone && p.phone.toLowerCase().includes(qLower)) ||
        (p.email && p.email.toLowerCase().includes(qLower))
      );
    }

    if (filters?.gender && filters.gender !== 'All') {
      list = list.filter(p => p.gender === filters.gender);
    }

    if (filters?.status && filters.status !== 'All') {
      list = list.filter(p => p.status === filters.status);
    }

    const items = list.map(p => ({
      ...p,
      patient_id: p.patientNumber,
      first_name: p.firstName,
      last_name: p.lastName
    }));

    return {
      items: items.slice(skip, skip + limit),
      total: items.length
    };
  },

  getPatientById: async (identifier: string): Promise<Patient> => {
    const found = await getPatientByNumber(identifier);
    if (!found) {
      const all = await fetchPatientsFromFirestore();
      const p = all[0];
      return {
        ...p,
        patient_id: p.patientNumber,
        first_name: p.firstName,
        last_name: p.lastName
      };
    }
    return {
      ...found,
      patient_id: found.patientNumber,
      first_name: found.firstName,
      last_name: found.lastName
    };
  },

  createPatient: async (data: PatientFormData) => {
    const created = await createPatientRecord(data);
    return {
      ...created,
      patient_id: created.patientNumber,
      first_name: created.firstName,
      last_name: created.lastName
    };
  },

  updatePatient: async (identifier: string, data: Partial<PatientFormData>) => {
    const patient = await getPatientByNumber(identifier);
    if (!patient) throw new Error('Patient not found');
    const updated: Patient = {
      ...patient,
      ...data,
      firstName: data.firstName || patient.firstName,
      lastName: data.lastName || patient.lastName
    };
    return {
      ...updated,
      patient_id: updated.patientNumber,
      first_name: updated.firstName,
      last_name: updated.lastName
    };
  },

  deletePatient: async (identifier: string) => {
    return { message: 'Patient archived', patient_id: identifier };
  },

  getPatientVisits: async (identifier: string): Promise<Visit[]> => {
    return [
      {
        id: 'v-101',
        patientNumber: identifier,
        visitDate: new Date().toISOString().split('T')[0],
        department: 'Cardiology',
        doctorName: 'Dr. Rajesh Sharma',
        diagnosis: 'Routine Cardiovascular Follow-up',
        type: 'OPD Consultation'
      }
    ];
  },

  getPatientAppointments: async (identifier: string): Promise<Appointment[]> => {
    const all = await getAppointments();
    return all.filter(a => a.patientNumber === identifier);
  },

  getPatientPrescriptions: async (identifier: string): Promise<Prescription[]> => {
    const all = await getPrescriptions(identifier);
    return all;
  },

  getPatientLabReports: async (identifier: string): Promise<LabReport[]> => {
    const all = await getLabReports(identifier);
    return all;
  },

  getPatientConsultations: async (identifier: string): Promise<ConsultationNote[]> => {
    const list = await getConsultations(identifier);
    return list.map(c => ({
      id: c.id || 'c-1',
      patientNumber: c.patientNumber,
      doctorName: c.doctorName,
      date: c.createdAt.split('T')[0],
      chiefComplaint: c.chiefComplaint,
      diagnosis: c.diagnosis,
      treatmentPlan: c.treatmentPlan
    }));
  },

  getPatientFollowups: async (identifier: string): Promise<FollowUp[]> => {
    return [
      {
        id: 'f-1',
        patientNumber: identifier,
        scheduledDate: '2026-10-15',
        department: 'Cardiology',
        doctorName: 'Dr. Rajesh Sharma',
        status: 'Scheduled',
        notes: 'Check blood pressure & lipid levels'
      }
    ];
  },

  getPatientActivity: async (identifier: string): Promise<AuditLog[]> => {
    return [
      {
        id: 'a-1',
        user: 'Doctor',
        role: 'Doctor',
        action: 'Viewed Record',
        module: 'Patients',
        patientNumber: identifier,
        description: `Accessed patient file ${identifier}`,
        timestamp: new Date().toISOString()
      }
    ];
  },

  getStats: async (): Promise<DashboardStats> => {
    const patients = await fetchPatientsFromFirestore();
    const appointments = await getAppointments();
    const prescriptions = await getPrescriptions();
    const reports = await getLabReports();

    return {
      totalPatients: patients.length,
      activeAppointments: appointments.length,
      prescriptionsIssued: prescriptions.length,
      labReportsCompleted: reports.length
    };
  }
};

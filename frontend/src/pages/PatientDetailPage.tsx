import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { patientService } from '../services/patientService';
import {
  Patient,
  PatientFormData,
  Visit,
  ConsultationNote,
  FollowUp,
} from '../types/patient';
import { Appointment } from '../types/appointment';
import { Prescription } from '../types/prescription';
import { LabReport } from '../types/labReport';
import { AuditLog } from '../types/auditLog';

import { PatientProfileHeader } from '../components/patient/PatientProfileHeader';
import { OverviewTab } from '../components/patient/tabs/OverviewTab';
import { VisitsTab } from '../components/patient/tabs/VisitsTab';
import { AppointmentsTab } from '../components/patient/tabs/AppointmentsTab';
import { PrescriptionsTab } from '../components/patient/tabs/PrescriptionsTab';
import { LabReportsTab } from '../components/patient/tabs/LabReportsTab';
import { DoctorNotesTab } from '../components/patient/tabs/DoctorNotesTab';
import { FollowUpsTab } from '../components/patient/tabs/FollowUpsTab';
import { AIHealthInsightsTab } from '../components/patient/tabs/AIHealthInsightsTab';
import { ActivityTab } from '../components/patient/tabs/ActivityTab';
import { RegisterPatientModal } from '../components/patient/RegisterPatientModal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/Toast';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-resource states
  const [visits, setVisits] = useState<Visit[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [consultations, setConsultations] = useState<ConsultationNote[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [activityLogs, setActivityLogs] = useState<AuditLog[]>([]);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPatientDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const p = await patientService.getPatientById(id);
      setPatient(p);

      // Fetch all sub-resource records in parallel
      const [vData, aData, rxData, lData, cData, fData, logData] = await Promise.all([
        patientService.getPatientVisits(id).catch(() => []),
        patientService.getPatientAppointments(id).catch(() => []),
        patientService.getPatientPrescriptions(id).catch(() => []),
        patientService.getPatientLabReports(id).catch(() => []),
        patientService.getPatientConsultations(id).catch(() => []),
        patientService.getPatientFollowups(id).catch(() => []),
        patientService.getPatientActivity(id).catch(() => []),
      ]);

      setVisits(vData);
      setAppointments(aData);
      setPrescriptions(rxData);
      setLabReports(lData);
      setConsultations(cData);
      setFollowups(fData);
      setActivityLogs(logData);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient record details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatientDetails();
  }, [fetchPatientDetails]);

  const handleEditSubmit = async (formData: PatientFormData) => {
    if (!patient) return;
    setIsSaving(true);
    try {
      const pId = patient.patientNumber || patient.id || id || '';
      const updated = await patientService.updatePatient(pId, formData);
      showToast('success', 'Profile Saved', `Updated patient details for ${updated.patientNumber}`);
      setIsEditOpen(false);
      setPatient(updated);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message={`Retrieving record for Patient ID ${id}...`} />;
  }

  if (error || !patient) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/patients')}>
          Back to Patients List
        </Button>
        <ErrorState
          title="Patient Record Not Found"
          message={error || `Could not find patient with ID '${id}'.`}
          onRetry={fetchPatientDetails}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation Back Action */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/patients')}>
          Back to Patient Management
        </Button>
        <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchPatientDetails}>
          Refresh Details
        </Button>
      </div>

      {/* Patient Profile Header Card */}
      <PatientProfileHeader
        patient={patient}
        onEdit={() => setIsEditOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Active Tab View Router */}
      <div className="pt-2">
        {activeTab === 'overview' && <OverviewTab patient={patient} />}
        {activeTab === 'visits' && <VisitsTab visits={visits} />}
        {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} />}
        {activeTab === 'prescriptions' && <PrescriptionsTab prescriptions={prescriptions} />}
        {activeTab === 'lab-reports' && <LabReportsTab labReports={labReports} />}
        {activeTab === 'doctor-notes' && <DoctorNotesTab consultations={consultations} />}
        {activeTab === 'follow-ups' && <FollowUpsTab followups={followups} />}
        {activeTab === 'ai-insights' && <AIHealthInsightsTab patient={patient} />}
        {activeTab === 'activity' && <ActivityTab activityLogs={activityLogs} />}
      </div>

      {/* Edit Patient Modal */}
      <RegisterPatientModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        patientToEdit={patient}
        isLoading={isSaving}
      />
    </div>
  );
};

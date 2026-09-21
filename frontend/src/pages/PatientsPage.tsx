import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, RefreshCw } from 'lucide-react';
import { patientService } from '../services/patientService';
import { Patient, PatientFormData, PatientFilters, DashboardStats } from '../types/patient';
import { FilterBar } from '../components/patient/FilterBar';
import { PatientTable } from '../components/patient/PatientTable';
import { RegisterPatientModal } from '../components/patient/RegisterPatientModal';
import { RegistrationSuccessModal } from '../components/patient/RegistrationSuccessModal';
import { DeletePatientModal } from '../components/patient/DeletePatientModal';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

export const PatientsPage: React.FC = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<PatientFilters>({
    q: '',
    gender: 'All',
    status: 'All',
  });

  // Modal controls
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch patient data from API
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientService.getPatients(filters);
      setPatients(data.items);
      setTotalPatients(data.total);

      // Fetch stats summary
      const statsData = await patientService.getStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient records.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Submit Handler for Registration / Edit
  const handleFormSubmit = async (formData: PatientFormData) => {
    setIsFormSubmitting(true);
    try {
      if (patientToEdit) {
        // Update existing patient
        const updated = await patientService.updatePatient(patientToEdit.patientNumber || patientToEdit.id || '', formData);
        showToast('success', 'Patient Updated Successfully', `Updated records for ${updated.firstName} ${updated.lastName} (${updated.patientNumber})`);
        setIsRegisterOpen(false);
        setPatientToEdit(null);
        fetchPatients();
      } else {
        // Create new patient
        const newPatient = await patientService.createPatient(formData);
        showToast('success', 'Patient Registered Successfully', `Assigned Patient ID ${newPatient.patientNumber}`);
        setIsRegisterOpen(false);
        setCreatedPatient(newPatient);
        setIsSuccessModalOpen(true);
        fetchPatients();
      }
    } catch (err: any) {
      showToast('error', patientToEdit ? 'Failed to Update Patient' : 'Failed to Register Patient', err.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Archive / Soft Delete Handler
  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    setIsDeleting(true);
    try {
      await patientService.deletePatient(patientToDelete.patientNumber || patientToDelete.id || '');
      showToast('info', 'Patient Archived', `Patient ${patientToDelete.patientNumber} soft deleted and set to inactive.`);
      setPatientToDelete(null);
      fetchPatients();
    } catch (err: any) {
      showToast('error', 'Archival Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Patients Management</h1>
            <span className="bg-medical-50 text-medical-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-medical-200">
              {totalPatients} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage hospital patient registrations, demographic profiles, medical history, and clinical timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatients}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            title="Refresh patient list"
          />
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setPatientToEdit(null);
              setIsRegisterOpen(true);
            }}
          >
            + Register Patient
          </Button>
        </div>
      </div>

      {/* Quick Status Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-medium text-slate-500">Total Patients</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.totalPatients}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-medium text-slate-500">Active Appointments</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">{stats.activeAppointments}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-medium text-slate-500">Prescriptions Issued</p>
            <p className="text-2xl font-bold text-medical-700 mt-0.5">{stats.prescriptionsIssued}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-medium text-slate-500">Lab Reports Completed</p>
            <p className="text-2xl font-bold text-sky-600 mt-0.5">{stats.labReportsCompleted}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters({ q: '', gender: 'All', status: 'All' })}
      />

      {/* Main Content Area: Loading / Error / Table / Empty */}
      {isLoading ? (
        <LoadingState message="Loading patient records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPatients} />
      ) : patients.length === 0 ? (
        <EmptyState
          title="No patients found"
          description="No patient records matched your search query or filter criteria."
          actionLabel="+ Register Patient"
          onAction={() => {
            setPatientToEdit(null);
            setIsRegisterOpen(true);
          }}
          icon={<Users className="w-6 h-6 text-slate-400" />}
        />
      ) : (
        <PatientTable
          patients={patients}
          onEdit={(patient) => {
            setPatientToEdit(patient);
            setIsRegisterOpen(true);
          }}
          onDelete={(patient) => setPatientToDelete(patient)}
        />
      )}

      {/* Modal Components */}
      <RegisterPatientModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setPatientToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        patientToEdit={patientToEdit}
        isLoading={isFormSubmitting}
      />

      <RegistrationSuccessModal
        isOpen={isSuccessModalOpen}
        patient={createdPatient}
        onClose={() => setIsSuccessModalOpen(false)}
        onRegisterAnother={() => {
          setIsSuccessModalOpen(false);
          setPatientToEdit(null);
          setIsRegisterOpen(true);
        }}
      />

      <DeletePatientModal
        isOpen={Boolean(patientToDelete)}
        patient={patientToDelete}
        onClose={() => setPatientToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
};

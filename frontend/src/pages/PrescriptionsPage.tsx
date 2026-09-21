import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Pill,
  Stethoscope,
  Eye,
  Trash2,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Prescription, Medication } from '../types/prescription';
import { getPrescriptions, createPrescriptionRecord } from '../firebase/firestore';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export const PrescriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (role === 'Admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [role, navigate]);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // View Modal State
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  // Issue Rx Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [patientNameInput, setPatientNameInput] = useState('John Doe');
  const [doctorInput, setDoctorInput] = useState('Dr. Rajesh Sharma');
  const [deptInput, setDeptInput] = useState('Cardiology');
  const [diagnosisInput, setDiagnosisInput] = useState('Essential Hypertension');
  const [medsList, setMedsList] = useState<Medication[]>([
    { medicine: 'Amlodipine 5mg', medicationName: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily in morning', duration: '30 days', durationDays: 30 }
  ]);
  const [isIssuing, setIsIssuing] = useState(false);

  const fetchPrescriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prescriptions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const filteredPrescriptions = prescriptions.filter(rx => {
    const qLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      rx.patientName.toLowerCase().includes(qLower) ||
      rx.patientNumber.toLowerCase().includes(qLower) ||
      rx.doctorName.toLowerCase().includes(qLower) ||
      (rx.diagnosis && rx.diagnosis.toLowerCase().includes(qLower))
    );
    return matchesSearch;
  });

  const handleAddMedRow = () => {
    setMedsList((prev) => [
      ...prev,
      { medicine: '', medicationName: '', dosage: '1 tablet', frequency: 'Once daily', duration: '7 days', durationDays: 7 }
    ]);
  };

  const handleRemoveMedRow = (idx: number) => {
    if (medsList.length <= 1) return;
    setMedsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMedChange = (idx: number, field: keyof Medication | 'medicationName' | 'durationDays', val: any) => {
    setMedsList((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: val };
        if (field === 'medicationName') updated.medicine = val;
        if (field === 'durationDays') updated.duration = `${val} days`;
        return updated;
      })
    );
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdInput.trim()) {
      showToast('error', 'Validation Error', 'Patient ID is required');
      return;
    }

    const validMeds = medsList.filter((m) => (m.medicationName || m.medicine || '').trim() !== '');
    if (validMeds.length === 0) {
      showToast('error', 'Validation Error', 'At least one valid medication is required');
      return;
    }

    setIsIssuing(true);
    try {
      const created = await createPrescriptionRecord({
        patientNumber: patientIdInput.trim(),
        patientName: patientNameInput,
        doctorId: 'doc-001',
        doctorName: doctorInput,
        diagnosis: diagnosisInput,
        medications: validMeds,
        notes: 'Take medications after meals.',
        status: 'Active'
      });

      showToast('success', 'Prescription Issued', `Issued RX for ${created.patientName} (${created.patientNumber})`);
      setIsIssueModalOpen(false);
      setPatientIdInput('');
      setMedsList([{ medicine: 'Amlodipine 5mg', medicationName: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily in morning', duration: '30 days', durationDays: 30 }]);
      fetchPrescriptions();
    } catch (err: any) {
      showToast('error', 'Fulfillment Failed', err.message);
    } finally {
      setIsIssuing(false);
    }
  };

  const totalMedsCount = filteredPrescriptions.reduce((acc, rx) => acc + (rx.medications?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pharmacy & Prescriptions</h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              {filteredPrescriptions.length} Prescriptions Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage electronic prescriptions, OPD medication schedules, dosage instructions, and pharmacy fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchPrescriptions} />
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsIssueModalOpen(true)}>
            + Issue Prescription
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total RX Issued</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{filteredPrescriptions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Prescribed Medications</p>
          <p className="text-2xl font-bold text-indigo-600 mt-0.5">{totalMedsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Pharmacy Status</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">Dispensing Active</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Departments</p>
          <p className="text-2xl font-bold text-medical-700 mt-0.5">6 Active</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name, Patient ID (PT-xxxxxx), Doctor Name, or Diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-medical-500"
          />
        </div>
      </div>

      {/* Prescriptions Grid */}
      {isLoading ? (
        <LoadingState message="Loading prescriptions directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPrescriptions} />
      ) : filteredPrescriptions.length === 0 ? (
        <EmptyState
          title="No prescriptions found"
          description="No prescriptions match your search criteria."
          actionLabel="+ Issue Prescription"
          onAction={() => setIsIssueModalOpen(true)}
          icon={<FileText className="w-6 h-6 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrescriptions.map((rx) => (
            <div key={rx.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-indigo-300 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <button
                      onClick={() => navigate(`/patients/${rx.patientNumber}`)}
                      className="font-bold text-slate-900 text-sm hover:text-medical-600 block text-left"
                    >
                      {rx.patientName}
                    </button>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-medical-700 bg-medical-50 px-1.5 py-0.2 rounded">
                        {rx.patientNumber}
                      </span>
                      <span>• Prescribed: {rx.createdAt.split('T')[0]}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedRx(rx)}
                  >
                    View RX
                  </Button>
                </div>

                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-medical-600" />
                    Dr. {rx.doctorName}
                  </span>
                  <span className="text-medical-700 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {rx.diagnosis || rx.notes || 'Clinical Care'}
                  </span>
                </div>

                {/* Medication Items List */}
                <div className="space-y-1.5 pt-1">
                  {rx.medications.map((m, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-900 block">{m.medicationName || m.medicine}</span>
                          <span className="text-[11px] text-slate-500">{m.dosage} • {m.frequency}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {m.duration || (m.durationDays ? `${m.durationDays} days` : '7 days')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Prescription Detail Modal */}
      {selectedRx && (
        <Modal
          isOpen={Boolean(selectedRx)}
          onClose={() => setSelectedRx(null)}
          title={`Prescription — ${selectedRx.patientName} (${selectedRx.patientNumber})`}
          subtitle={`Issued by Dr. ${selectedRx.doctorName} on ${selectedRx.createdAt.split('T')[0]}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-indigo-950">
              <div>
                <p className="font-bold text-sm">Dr. {selectedRx.doctorName}</p>
                <p className="text-[11px] text-indigo-700">Diagnosis: {selectedRx.diagnosis || selectedRx.notes || 'Clinical Care'}</p>
              </div>
              <span className="font-mono font-bold text-xs bg-white px-2 py-1 rounded text-slate-800 border border-indigo-200">
                Date: {selectedRx.createdAt.split('T')[0]}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Prescribed Medications Schedule ({selectedRx.medications.length})
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                {selectedRx.medications.map((m, idx) => (
                  <div key={idx} className="p-3 bg-white space-y-1">
                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-indigo-600" />
                        {m.medicationName || m.medicine}
                      </span>
                      <span className="text-xs font-normal text-slate-500">{m.duration || (m.durationDays ? `${m.durationDays} days` : '7 days')}</span>
                    </div>
                    <p className="text-slate-600">Dosage: <span className="font-semibold text-slate-800">{m.dosage}</span></p>
                    <p className="text-slate-600">Frequency: <span className="font-semibold text-slate-800">{m.frequency}</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedRx(null)}>
                Close RX
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Issue Prescription Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue New Prescription"
        subtitle="Add prescribed medications for a hospital patient"
        maxWidth="2xl"
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Patient ID (PT-xxxxxx) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PT-000001"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Patient Name</label>
              <input
                type="text"
                value={patientNameInput}
                onChange={(e) => setPatientNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Diagnosis</label>
              <input
                type="text"
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>
          </div>

          {/* Dynamic Medication Rows */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                Medication List ({medsList.length})
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMedRow}>
                + Add Medication
              </Button>
            </div>

            {medsList.map((med, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                  value={med.medicationName || med.medicine || ''}
                  onChange={(e) => handleMedChange(idx, 'medicationName', e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-medical-500 sm:col-span-1"
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage (1 tablet)"
                  value={med.dosage}
                  onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-medical-500"
                />
                <input
                  type="text"
                  placeholder="Frequency (Twice daily)"
                  value={med.frequency}
                  onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-medical-500"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Duration Days (30)"
                    value={med.durationDays || 7}
                    onChange={(e) => handleMedChange(idx, 'durationDays', parseInt(e.target.value, 10) || 7)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-medical-500"
                  />
                  {medsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedRow(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isIssuing} icon={<CheckCircle className="w-4 h-4" />}>
              Issue Prescription
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

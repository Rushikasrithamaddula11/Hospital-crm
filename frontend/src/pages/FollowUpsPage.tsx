import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Stethoscope,
  Calendar,
  AlertCircle
} from 'lucide-react';
import apiClient from '../services/api';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

export interface FollowUpRecord {
  id: number;
  patient_id: number;
  patient_id_str: string;
  patient_name: string;
  patient_age?: number;
  patient_gender?: string;
  patient_mobile?: string;
  followup_date: string;
  doctor_name: string;
  reason: string;
  status: 'Pending' | 'Completed' | 'Missed' | 'Cancelled';
  notes?: string;
}

export const FollowUpsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [followups, setFollowups] = useState<FollowUpRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [doctorInput, setDoctorInput] = useState('Dr. Raj Kumar');
  const [dateInput, setDateInput] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [reasonInput, setReasonInput] = useState('Post consultation review & lab report evaluation');
  const [notesInput, setNotesInput] = useState('Patient advised to bring recent blood test reports.');
  const [isScheduling, setIsScheduling] = useState(false);

  const fetchFollowups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (searchQuery.trim()) params.q = searchQuery;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await apiClient.get<{ items: FollowUpRecord[]; total: number }>('/followups', { params });
      setFollowups(res.data.items);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clinical follow-ups.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdInput.trim()) {
      showToast('error', 'Validation Error', 'Patient ID is required');
      return;
    }

    setIsScheduling(true);
    try {
      const payload = {
        patient_identifier: patientIdInput.trim(),
        doctor_name: doctorInput,
        followup_date: dateInput,
        reason: reasonInput,
        status: 'Pending',
        notes: notesInput
      };
      const res = await apiClient.post('/followups', payload);
      showToast('success', 'Follow-up Scheduled', `Scheduled follow-up for ${res.data.patient_name} (${res.data.patient_id_str})`);
      setIsScheduleModalOpen(false);
      setPatientIdInput('');
      fetchFollowups();
    } catch (err: any) {
      showToast('error', 'Scheduling Failed', err.message);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleStatusChange = async (fuId: number, newStatus: string) => {
    try {
      await apiClient.put(`/followups/${fuId}/status`, { status: newStatus });
      showToast('success', 'Status Updated', `Follow-up #${fuId} marked as ${newStatus}`);
      fetchFollowups();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  };

  const pendingCount = followups.filter((f) => f.status === 'Pending').length;
  const completedCount = followups.filter((f) => f.status === 'Completed').length;
  const missedCount = followups.filter((f) => f.status === 'Missed' || f.status === 'Cancelled').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Follow-up & Care Continuity</h1>
            <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              {total} Total Follow-ups
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track post-consultation care reviews, patient recall schedules, and clinical progress evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchFollowups} />
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsScheduleModalOpen(true)}>
            + Schedule Follow-up
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Scheduled</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600 mt-0.5">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Completed Reviews</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">{completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Missed / Cancelled</p>
          <p className="text-2xl font-bold text-rose-600 mt-0.5">{missedCount}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name, Patient ID (PT-xxxxxx), Doctor, or Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-medical-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Missed">Missed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Follow-ups Table */}
      {isLoading ? (
        <LoadingState message="Loading clinical follow-up schedules..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchFollowups} />
      ) : followups.length === 0 ? (
        <EmptyState
          title="No follow-ups found"
          description="No clinical care follow-up records match your search criteria."
          actionLabel="+ Schedule Follow-up"
          onAction={() => setIsScheduleModalOpen(true)}
          icon={<Clock className="w-6 h-6 text-slate-400" />}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Follow-up Date</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Attending Doctor</th>
                  <th className="py-3 px-4">Clinical Reason & Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followups.map((fu) => (
                  <tr key={fu.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{fu.followup_date}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/patients/${fu.patient_id_str}`)}
                        className="font-semibold text-slate-900 hover:text-medical-600 hover:underline block text-left"
                      >
                        {fu.patient_name}
                      </button>
                      <span className="font-mono text-[11px] font-medium text-medical-700 bg-medical-50 px-1.5 rounded">
                        {fu.patient_id_str}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{fu.doctor_name}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-semibold text-slate-900 block">{fu.reason}</span>
                      {fu.notes && <span className="text-[11px] text-slate-500 mt-0.5 block">{fu.notes}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={fu.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {fu.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(fu.id, 'Completed')}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-medium"
                              title="Mark Completed"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleStatusChange(fu.id, 'Missed')}
                              className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[11px] font-medium"
                              title="Mark Missed"
                            >
                              Missed
                            </button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/patients/${fu.patient_id_str}`)}
                        >
                          Profile
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Patient Follow-up"
        subtitle="Set up a clinical review or recall date for a patient"
        maxWidth="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Attending Doctor</label>
              <select
                value={doctorInput}
                onChange={(e) => setDoctorInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="Dr. Raj Kumar">Dr. Raj Kumar</option>
                <option value="Dr. Anil Sharma">Dr. Anil Sharma</option>
                <option value="Dr. Sneha Kulkarni">Dr. Sneha Kulkarni</option>
                <option value="Dr. Vivek Nambiar">Dr. Vivek Nambiar</option>
                <option value="Dr. Farida Khan">Dr. Farida Khan</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Follow-up Date</label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Clinical Reason</label>
            <input
              type="text"
              placeholder="Post consultation review & lab report evaluation"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Staff Notes / Instructions</label>
            <textarea
              rows={3}
              placeholder="Enter patient instructions or advice..."
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isScheduling} icon={<CheckCircle className="w-4 h-4" />}>
              Schedule Follow-up
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

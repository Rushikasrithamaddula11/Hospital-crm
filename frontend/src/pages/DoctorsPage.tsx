import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCog,
  Plus,
  Search,
  Building2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Award,
  Calendar,
  CheckCircle,
  RefreshCw,
  Stethoscope
} from 'lucide-react';
import apiClient from '../services/api';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

export interface DoctorItem {
  id: number;
  doctor_id: string;
  name: string;
  department: string;
  qualification: string;
  experience_years: number;
  opd_room: string;
  opd_timings: string;
  consultation_fee: number;
  mobile?: string;
  email?: string;
  photo?: string;
  total_visits: number;
  total_appointments: number;
  status: string;
}

export const DoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Register Doctor Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [deptInput, setDeptInput] = useState('Cardiology');
  const [qualInput, setQualInput] = useState('MBBS, MD');
  const [expInput, setExpInput] = useState(10);
  const [roomInput, setRoomInput] = useState('OPD Room 101');
  const [timingsInput, setTimingsInput] = useState('09:00 AM - 01:00 PM');
  const [feeInput, setFeeInput] = useState(600);
  const [mobileInput, setMobileInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (searchQuery.trim()) params.q = searchQuery;
      if (deptFilter !== 'All') params.department = deptFilter;

      const res = await apiClient.get<{ items: DoctorItem[]; total: number }>('/doctors', { params });
      setDoctors(res.data.items);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctor directory.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, deptFilter]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleRegisterDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      showToast('error', 'Validation Error', 'Doctor Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: nameInput.trim().startsWith('Dr.') ? nameInput.trim() : `Dr. ${nameInput.trim()}`,
        department: deptInput,
        qualification: qualInput,
        experience_years: Number(expInput),
        opd_room: roomInput,
        opd_timings: timingsInput,
        consultation_fee: Number(feeInput),
        mobile: mobileInput || undefined,
        email: emailInput || undefined
      };

      const res = await apiClient.post('/doctors', payload);
      showToast('success', 'Doctor Registered', `Added ${res.data.name} (${res.data.doctor_id}) to hospital directory`);
      setIsRegisterModalOpen(false);
      setNameInput('');
      fetchDoctors();
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const departmentsList = Array.from(new Set(doctors.map(d => d.department)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Doctor & Staff Directory</h1>
            <span className="bg-medical-50 text-medical-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-medical-200">
              {total} Specialists Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage hospital medical consultants, OPD room assignments, schedule timings, and consultation fees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchDoctors} />
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsRegisterModalOpen(true)}>
            + Add Doctor
          </Button>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Consultants</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Active Departments</p>
          <p className="text-2xl font-bold text-medical-700 mt-0.5">{departmentsList.length || 6}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">OPD Status</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">Online & OPD Active</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Avg. Experience</p>
          <p className="text-2xl font-bold text-indigo-600 mt-0.5">14+ Years</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name, qualification, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-medical-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent border-0 font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Neurology">Neurology</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <LoadingState message="Loading doctor directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDoctors} />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No doctors found"
          description="No clinical consultants match your search criteria."
          actionLabel="+ Add Doctor"
          onAction={() => setIsRegisterModalOpen(true)}
          icon={<UserCog className="w-6 h-6 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-medical-300 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-medical-50 border border-medical-200 text-medical-700 font-extrabold text-sm flex items-center justify-center shrink-0">
                    {doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                      <span className="font-mono text-[10px] font-semibold text-medical-700 bg-medical-50 px-1.5 py-0.2 rounded">
                        {doc.doctor_id}
                      </span>
                    </div>
                    <p className="text-xs text-medical-700 font-semibold mt-0.5">{doc.department}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{doc.qualification}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> OPD Location:</span>
                    <span className="font-medium text-slate-800">{doc.opd_room}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Timings:</span>
                    <span className="font-medium text-slate-800">{doc.opd_timings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Experience:</span>
                    <span className="font-semibold text-slate-900">{doc.experience_years} years</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Consultation Fee</span>
                  <span className="text-sm font-bold text-slate-900">₹{doc.consultation_fee}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/appointments')}
                >
                  Schedule OPD
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Add New Medical Doctor / Consultant"
        subtitle="Add a doctor to Sritha Hospitals Hospital CRM directory"
        maxWidth="md"
      >
        <form onSubmit={handleRegisterDoctor} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Doctor Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Harish Chandra"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Department</label>
              <select
                value={deptInput}
                onChange={(e) => setDeptInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Neurology">Neurology</option>
                <option value="Oncology">Oncology</option>
                <option value="ENT">ENT</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                placeholder="MBBS, MD, DM"
                value={qualInput}
                onChange={(e) => setQualInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">OPD Room</label>
              <input
                type="text"
                placeholder="OPD Room 102"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Consultation Fee (₹)</label>
              <input
                type="number"
                placeholder="800"
                value={feeInput}
                onChange={(e) => setFeeInput(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">OPD Timings</label>
              <input
                type="text"
                placeholder="09:00 AM - 01:00 PM"
                value={timingsInput}
                onChange={(e) => setTimingsInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={expInput}
                onChange={(e) => setExpInput(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} icon={<CheckCircle className="w-4 h-4" />}>
              Save Doctor Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

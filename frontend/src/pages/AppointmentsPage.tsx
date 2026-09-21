import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  CheckCircle,
  RefreshCw,
  CheckCircle2,
  Printer,
  Clock,
  ArrowRight,
  QrCode
} from 'lucide-react';
import { Appointment } from '../types/appointment';
import { getAppointments, createAppointmentRecord, updateAppointmentStatus, getNextOpSlotForDoctor } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Book Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState(user?.role === 'Patient' ? (user.patientId || 'PT-000001') : '');
  const [patientNameInput, setPatientNameInput] = useState(user?.role === 'Patient' ? (user.name || 'Rahul Kumar') : 'Rahul Kumar');
  const [doctorNameInput, setDoctorNameInput] = useState('Dr. Anil Sharma');
  const [deptInput, setDeptInput] = useState('General Medicine');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [timeInput, setTimeInput] = useState('09:20 AM');
  const [typeInput, setTypeInput] = useState('Outpatient (OP)');
  const [isBooking, setIsBooking] = useState(false);

  // Created Appointment QR Ticket Modal
  const [createdAppointmentForQr, setCreatedAppointmentForQr] = useState<Appointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data = await getAppointments();

      // Role-Based Filtering
      if (role === 'Patient') {
        const myPtId = user?.patientId || 'PT-000001';
        data = data.filter(a => a.patientNumber === myPtId || a.patientName.toLowerCase().includes('rahul'));
      } else if (role === 'Doctor') {
        data = data.filter(a => a.doctorName.toLowerCase().includes(user?.name.split(' ')[0].toLowerCase() || ''));
      }

      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hospital appointments.');
    } finally {
      setIsLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filteredAppointments = appointments.filter((app) => {
    const qLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      app.patientName.toLowerCase().includes(qLower) ||
      app.patientNumber.toLowerCase().includes(qLower) ||
      app.doctorName.toLowerCase().includes(qLower)
    );
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesDept = deptFilter === 'All' || app.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPtNumber = role === 'Patient' ? (user?.patientId || 'PT-000001') : (patientIdInput.trim() || 'PT-000001');
    const targetPtName = role === 'Patient' ? (user?.name || 'Rahul Kumar') : patientNameInput;

    setIsBooking(true);
    try {
      // Calculate 10-minute OP slot gap
      const docNameOnly = doctorNameInput.split(' (')[0];
      const computedSlot = await getNextOpSlotForDoctor(docNameOnly);

      const created = await createAppointmentRecord({
        patientNumber: targetPtNumber,
        patientName: targetPtName,
        doctorId: 'doc-001',
        doctorName: docNameOnly,
        department: deptInput,
        appointmentDate: dateInput,
        appointmentTime: computedSlot || timeInput,
        type: typeInput,
        status: 'Scheduled'
      });

      showToast('success', 'Appointment Booked', `Booked appointment for ${created.patientName} (${created.patientNumber})`);
      setIsBookModalOpen(false);
      
      // Trigger Immediate OP QR Pass Modal for the appointment
      setCreatedAppointmentForQr(created);

      fetchAppointments();
    } catch (err: any) {
      showToast('error', 'Booking Failed', err.message);
    } finally {
      setIsBooking(false);
    }
  };

  const handleStatusUpdate = async (appId: string, newStatus: Appointment['status']) => {
    try {
      await updateAppointmentStatus(appId, newStatus);
      showToast('success', 'Status Updated', `Appointment marked as ${newStatus}`);
      fetchAppointments();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  };

  const scheduledCount = filteredAppointments.filter((a) => a.status === 'Scheduled').length;
  const completedCount = filteredAppointments.filter((a) => a.status === 'Completed').length;
  const cancelledCount = filteredAppointments.filter((a) => a.status === 'Cancelled').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {role === 'Patient' ? 'My Scheduled Appointments' : 'Appointments Scheduling'}
            </h1>
            <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
              {filteredAppointments.length} Active Appointments
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'Patient'
              ? 'View and manage your upcoming doctor consultations & scannable OP QR tickets.'
              : 'Manage doctor consultations, OPD scheduling, and patient appointment statuses across departments.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchAppointments} />
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsBookModalOpen(true)}>
            + Book Appointment
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Bookings</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{filteredAppointments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Scheduled</p>
          <p className="text-2xl font-bold text-sky-600 mt-0.5">{scheduledCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">{completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Cancelled</p>
          <p className="text-2xl font-bold text-rose-600 mt-0.5">{cancelledCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name, ID, or Doctor Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-medical-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <LoadingState message="Loading hospital appointments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAppointments} />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="No appointments match your search term or status filters."
          actionLabel="+ Book Appointment"
          onAction={() => setIsBookModalOpen(true)}
          icon={<CalendarIcon className="w-6 h-6 text-slate-400" />}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor & Department</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{app.appointmentDate}</span>
                      <span className="text-[11px] font-mono text-slate-500">{app.appointmentTime}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/patients/${app.patientNumber}`)}
                        className="font-semibold text-slate-900 hover:text-medical-600 hover:underline block text-left"
                      >
                        {app.patientName}
                      </button>
                      <span className="font-mono text-[11px] font-medium text-medical-700 bg-medical-50 px-1.5 rounded">
                        {app.patientNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">Dr. {app.doctorName}</span>
                      <span className="text-slate-500 text-[11px]">{app.department}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{app.type || 'Consultation'}</td>
                    <td className="py-3 px-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setCreatedAppointmentForQr(app)}
                          className="px-2 py-1 bg-medical-50 text-medical-700 hover:bg-medical-100 rounded text-[11px] font-bold border border-medical-200 flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>View QR</span>
                        </button>
                        {app.status === 'Scheduled' && role !== 'Patient' && (
                          <>
                            <button
                              onClick={() => app.id && handleStatusUpdate(app.id, 'Completed')}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-medium"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => app.id && handleStatusUpdate(app.id, 'Cancelled')}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Book Doctor Appointment"
        subtitle="Schedule a consultation or review for a patient"
        maxWidth="md"
      >
        <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              readOnly={role === 'Patient'}
              value={role === 'Patient' ? (user?.name || 'Rahul Kumar') : patientNameInput}
              onChange={(e) => setPatientNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
              required
            />
          </div>

          {role !== 'Patient' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Patient ID (PT-xxxxxx) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PT-000001"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 font-mono"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Doctor</label>
              <select
                value={doctorNameInput}
                onChange={(e) => setDoctorNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 font-semibold text-medical-700"
              >
                <option value="Dr. Anil Sharma">Dr. Anil Sharma (General Medicine)</option>
                <option value="Dr. Raj Kumar">Dr. Raj Kumar (Cardiology)</option>
                <option value="Dr. Sneha Kulkarni">Dr. Sneha Kulkarni (Pediatrics)</option>
                <option value="Dr. Vivek Nambiar">Dr. Vivek Nambiar (Orthopedics)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Department</label>
              <select
                value={deptInput}
                onChange={(e) => setDeptInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Appointment Date</label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Preferred Time Slot (10-min interval)</label>
              <select
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 font-mono font-semibold"
              >
                <option value="09:20 AM">09:20 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isBooking} icon={<CheckCircle className="w-4 h-4" />}>
              Confirm Booking & Get OP QR
            </Button>
          </div>
        </form>
      </Modal>

      {/* APPOINTMENT OP QR TICKET PASS MODAL */}
      {createdAppointmentForQr && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 border border-slate-100">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-6 ring-emerald-50">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Appointment Booked Successfully!
              </h3>
              <p className="text-xs text-slate-500">
                Your Outpatient (OP) Digital Ticket & QR Pass generated below.
              </p>
            </div>

            {/* Ticket Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="bg-medical-600 text-white py-1 px-3 rounded-full text-xs font-mono font-bold inline-block shadow-xs">
                APPOINTMENT ID: {createdAppointmentForQr.id || 'APT-000123'}
              </div>

              <div>
                <p className="font-extrabold text-base text-slate-900">
                  {createdAppointmentForQr.patientName}
                </p>
                <p className="text-xs text-slate-500 font-mono font-medium mt-0.5">
                  Patient ID: {createdAppointmentForQr.patientNumber}
                </p>
              </div>

              {/* Doctor & Slot Details */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-950 text-xs">
                <p className="font-bold text-sm text-emerald-900">Dr. {createdAppointmentForQr.doctorName}</p>
                <p className="text-emerald-700 font-medium text-[11px]">{createdAppointmentForQr.department}</p>
                <div className="mt-1.5 flex items-center justify-center gap-1 font-bold text-emerald-900 bg-white/80 py-1 px-2 rounded-lg border border-emerald-200">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Slot Time: <strong className="font-mono underline">{createdAppointmentForQr.appointmentTime}</strong> ({createdAppointmentForQr.appointmentDate})</span>
                </div>
              </div>

              {/* Scannable Vector QR Code */}
              <div className="flex justify-center py-1">
                <QRCodeSVG
                  value={createdAppointmentForQr.id || createdAppointmentForQr.patientNumber}
                  size={150}
                  level="H"
                  className="bg-white p-2.5 border border-slate-200 rounded-xl shadow-xs"
                />
              </div>

              <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                STATUS: PENDING_VERIFICATION (Present QR at Reception)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedAppointmentForQr(null)}
                className="flex-1 py-2.5 px-3 bg-medical-600 hover:bg-medical-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Done</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Calendar,
  FileText,
  TestTube,
  QrCode,
  TrendingUp,
  Eye,
  HeartPulse
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  getPatients,
  getAppointments,
  getPrescriptions,
  getLabReports,
  getPatientVitals,
  recordPatientVitals
} from '../firebase/firestore';
import { Patient } from '../types/patient';
import { Appointment } from '../types/appointment';
import { Prescription } from '../types/prescription';
import { LabReport } from '../types/labReport';
import { PatientVitals } from '../types/vitals';
import { useToast } from '../components/common/Toast';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 45000, appointments: 320 },
  { month: 'Feb', revenue: 52000, appointments: 380 },
  { month: 'Mar', revenue: 61000, appointments: 420 },
  { month: 'Apr', revenue: 58000, appointments: 390 },
  { month: 'May', revenue: 69000, appointments: 460 },
  { month: 'Jun', revenue: 78000, appointments: 510 },
  { month: 'Jul', revenue: 84000, appointments: 580 }
];

const DEPT_DISTRIBUTION = [
  { name: 'Cardiology', value: 35, color: '#0284c7' },
  { name: 'Pediatrics', value: 25, color: '#10b981' },
  { name: 'Orthopedics', value: 20, color: '#f59e0b' },
  { name: 'Neurology', value: 12, color: '#8b5cf6' },
  { name: 'General', value: 8, color: '#ec4899' }
];

export const DashboardPage: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [vitals, setVitals] = useState<PatientVitals[]>([]);
  const [loading, setLoading] = useState(true);

  // Vitals Entry Modal state for Nurse
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<Patient | null>(null);
  const [vitalsForm, setVitalsForm] = useState({
    bp: '120/80',
    hr: 75,
    temp: 98.6,
    spo2: 99,
    weight: 70
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, a, rx, lab, v] = await Promise.all([
        getPatients(),
        getAppointments(),
        getPrescriptions(),
        getLabReports(),
        getPatientVitals()
      ]);
      setPatients(p);
      setAppointments(a);
      setPrescriptions(rx);
      setLabReports(lab);
      setVitals(v);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForVitals) return;

    try {
      await recordPatientVitals({
        patientNumber: selectedPatientForVitals.patientNumber,
        patientName: `${selectedPatientForVitals.firstName} ${selectedPatientForVitals.lastName}`,
        bloodPressure: vitalsForm.bp,
        heartRate: vitalsForm.hr,
        temperature: vitalsForm.temp,
        spO2: vitalsForm.spo2,
        weight: vitalsForm.weight,
        recordedBy: user?.name || 'Nurse Duty',
        recordedAt: new Date().toISOString()
      });
      showToast('success', 'Vitals Recorded', 'Vitals recorded successfully!');
      setSelectedPatientForVitals(null);
      loadData();
    } catch (err) {
      showToast('error', 'Recording Error', 'Failed to record vitals');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-medical-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading Hospital Portal Data...</p>
        </div>
      </div>
    );
  }

  const patientRecord = user?.role === 'Patient'
    ? patients.find(p => p.patientNumber === (user.patientId || 'PT-000001')) || patients[0]
    : null;

  const myAppointments = user?.role === 'Patient' && patientRecord
    ? appointments.filter(a => a.patientNumber === patientRecord.patientNumber)
    : appointments;

  const myPrescriptions = user?.role === 'Patient' && patientRecord
    ? prescriptions.filter(p => p.patientNumber === patientRecord.patientNumber)
    : prescriptions;

  const myLabReports = user?.role === 'Patient' && patientRecord
    ? labReports.filter(l => l.patientNumber === patientRecord.patientNumber)
    : labReports;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Role Greeting */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-medical-950 p-6 rounded-2xl border border-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-medical-500/20 text-medical-300 border border-medical-500/30">
              Role: {role} Portal
            </span>
            <span className="text-xs text-slate-400">| Sritha Hospitals Main Campus</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Healthcare Specialist'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {role === 'Admin' && 'Manage patients, doctors, nurses, OP registrations, and hospital analytics.'}
            {role === 'Doctor' && "Today's consultations, patient queues, and digital prescriptions."}
            {role === 'Nurse' && 'Assigned patient care, vitals monitoring, and nursing tasks.'}
            {role === 'Patient' && `Patient Record ID: ${patientRecord?.patientNumber || 'PT-000001'} • Active Care Plan`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">

          {role === 'Doctor' && (
            <button
              onClick={() => navigate('/prescriptions')}
              className="flex items-center gap-2 px-4 py-2 bg-medical-600 hover:bg-medical-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Issue Prescription</span>
            </button>
          )}

          {role === 'Patient' && patientRecord && (
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl backdrop-blur-xs border border-white/10">
              <QRCodeSVG value={patientRecord.patientNumber} size={40} className="rounded bg-white p-0.5" />
              <div className="text-left text-xs">
                <p className="font-bold font-mono">{patientRecord.patientNumber}</p>
                <p className="text-[10px] text-slate-300">Scan at Reception</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {role === 'Patient' ? 'My Appointments' : 'Total Patients'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-medical-50 flex items-center justify-center text-medical-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {role === 'Patient' ? myAppointments.length : patients.length}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.5% from last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {role === 'Patient' ? 'My Prescriptions' : 'Appointments Today'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {role === 'Patient' ? myPrescriptions.length : appointments.filter(a => a.status === 'Scheduled').length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Active Scheduled Queue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {role === 'Patient' ? 'My Lab Reports' : role === 'Admin' ? 'Medical Staff' : 'Prescriptions Issued'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {role === 'Patient' ? myLabReports.length : role === 'Admin' ? '32 Active Staff' : prescriptions.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {role === 'Admin' ? 'Doctors & Nursing Personnel' : 'Digital Fulfillment'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {role === 'Patient' ? 'Vitals Status' : role === 'Admin' ? 'Hospital Departments' : 'Lab Orders'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <TestTube className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {role === 'Patient' ? 'Normal (120/80)' : role === 'Admin' ? '8 Specializations' : labReports.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {role === 'Patient' ? 'Updated today' : role === 'Admin' ? 'Active Clinical Wings' : '100% Digital Processing'}
          </span>
        </div>
      </div>

      {/* ADMIN DASHBOARD VIEW */}
      {role === 'Admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Operational Revenue & Patients</h3>
                <p className="text-xs text-slate-500">Monthly patient visits & billing trends</p>
              </div>
              <span className="text-xs font-semibold text-medical-600 bg-medical-50 px-2.5 py-1 rounded-lg">
                Recharts Analytics
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Department Share</h3>
            <p className="text-xs text-slate-500 mb-4">Patient volume distribution</p>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DEPT_DISTRIBUTION} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                    {DEPT_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {DEPT_DISTRIBUTION.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600 font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR & NURSE DASHBOARD VIEW */}
      {(role === 'Doctor' || role === 'Nurse') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {role === 'Doctor' ? "Today's Clinical Appointment Queue" : 'Assigned Ward & OPD Patients'}
                </h3>
                <p className="text-xs text-slate-500">Real-time patient schedule</p>
              </div>
              <button
                onClick={() => navigate('/appointments')}
                className="text-xs font-semibold text-medical-600 hover:text-medical-700"
              >
                View All →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {appointments.slice(0, 5).map((app) => (
                <div key={app.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {app.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{app.patientName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {app.patientNumber} • {app.appointmentTime} • {app.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'Scheduled' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      app.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {app.status}
                    </span>

                    {role === 'Nurse' && (
                      <button
                        onClick={() => {
                          const matchedPatient = patients.find(p => p.patientNumber === app.patientNumber);
                          if (matchedPatient) setSelectedPatientForVitals(matchedPatient);
                        }}
                        className="px-2.5 py-1 text-[11px] bg-medical-50 hover:bg-medical-100 text-medical-700 rounded-md font-semibold transition-colors flex items-center gap-1"
                      >
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>Vitals</span>
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/patients/${app.patientNumber}`)}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Recorded Patient Vitals</h3>
            <div className="space-y-3">
              {vitals.slice(0, 4).map((v) => (
                <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>{v.patientName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{v.recordedAt.split('T')[0]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-600">
                    <div>BP: <strong className="text-slate-900">{v.bloodPressure}</strong></div>
                    <div>HR: <strong className="text-slate-900">{v.heartRate} bpm</strong></div>
                    <div>Temp: <strong className="text-slate-900">{v.temperature}°F</strong></div>
                    <div>SpO2: <strong className="text-slate-900">{v.spO2}%</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PATIENT DASHBOARD VIEW */}
      {role === 'Patient' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">My Upcoming Appointments & Prescriptions</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-medical-50/60 border border-medical-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-medical-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Next Doctor Consultation</p>
                      <p className="text-xs text-slate-600">Dr. Rajesh Sharma • Cardiology</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-medical-600 text-white rounded-md text-xs font-semibold">
                    Tomorrow, 10:30 AM
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">My Digital Prescriptions</h4>
              {myPrescriptions.slice(0, 3).map(rx => (
                <div key={rx.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{rx.diagnosis || rx.notes || 'Cardiovascular Rx'}</p>
                    <p className="text-[11px] text-slate-500">Dr. {rx.doctorName} • {rx.medications.length} Medications</p>
                  </div>
                  <button
                    onClick={() => navigate('/prescriptions')}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                  >
                    View RX
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-slate-900 mb-2">Digital Patient Card</h3>
            {patientRecord && (
              <>
                <QRCodeSVG value={patientRecord.patientNumber} size={150} level="H" className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs" />
                <p className="text-base font-extrabold font-mono text-slate-900 mt-3">{patientRecord.patientNumber}</p>
                <p className="text-xs text-slate-500 font-semibold">{patientRecord.firstName} {patientRecord.lastName}</p>
                <p className="text-[11px] text-slate-400 mt-1">Present this QR code at hospital entrance or pharmacy counter.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* NURSE VITALS RECORDING MODAL */}
      {selectedPatientForVitals && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-medical-600" />
                <h3 className="font-bold text-base text-slate-900">Record Patient Vitals</h3>
              </div>
              <button onClick={() => setSelectedPatientForVitals(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Recording vitals for <strong className="text-slate-900">{selectedPatientForVitals.firstName} {selectedPatientForVitals.lastName}</strong> ({selectedPatientForVitals.patientNumber})
            </p>

            <form onSubmit={handleSaveVitals} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    required
                    value={vitalsForm.bp}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })}
                    placeholder="120/80"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    required
                    value={vitalsForm.hr}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, hr: parseInt(e.target.value, 10) || 75 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={vitalsForm.temp}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, temp: parseFloat(e.target.value) || 98.6 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    required
                    value={vitalsForm.spo2}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: parseInt(e.target.value, 10) || 99 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (Kg)</label>
                <input
                  type="number"
                  required
                  value={vitalsForm.weight}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, weight: parseFloat(e.target.value) || 70 })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForVitals(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-medical-600 hover:bg-medical-500 rounded-lg shadow-sm"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

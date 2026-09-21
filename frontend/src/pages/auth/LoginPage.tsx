import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import { createPatientRecord, createAppointmentRecord, getNextOpSlotForDoctor } from '../../firebase/firestore';
import { Patient } from '../../types/patient';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  UserCheck,
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  Info,
  Phone,
  User,
  CheckCircle2,
  Printer,
  QrCode,
  Building2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickLogin, registerUser } = useAuth();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Role Selection Column State (Doctor, Nurse, Patient, Admin)
  const [selectedRole, setSelectedRole] = useState<UserRole>('Patient');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration Form State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regDoctor, setRegDoctor] = useState('Dr. Anil Sharma (General Medicine)');
  const [regDepartment, setRegDepartment] = useState('Cardiology');
  const [regPassword, setRegPassword] = useState('');

  // Immediate OP QR Modal State
  const [createdOpPatient, setCreatedOpPatient] = useState<Patient | null>(null);
  const [assignedOpSlot, setAssignedOpSlot] = useState<string>('09:00 AM');
  const [assignedDoctorName, setAssignedDoctorName] = useState<string>('Dr. Anil Sharma');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please check your email and password and try again.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fn = regFirstName.trim() || 'New';
      const ln = regLastName.trim() || 'User';
      const fullName = `${fn} ${ln}`;
      const mail = regEmail.trim() || `user_${Date.now()}@hospital.com`;

      if (selectedRole === 'Patient') {
        const docNameOnly = regDoctor.split(' (')[0];
        
        // Calculate 10-minute OP slot starting 9:00 AM - 10:30 PM (skipping 12:00-2:00 PM)
        const opSlot = await getNextOpSlotForDoctor(docNameOnly);
        setAssignedOpSlot(opSlot);
        setAssignedDoctorName(docNameOnly);

        // Register Patient & Create Immediate Outpatient (OP) Ticket + QR Code
        const opRecord = await createPatientRecord({
          firstName: fn,
          lastName: ln,
          email: mail,
          phone: regPhone || '+1 (555) 019-8822',
          gender: regGender as 'Male' | 'Female' | 'Other',
          dob: '1995-08-20',
          bloodGroup: 'O+',
          allergies: 'None',
          conditions: `OP Ticket for ${docNameOnly} at ${opSlot}`
        });

        // Create OP Appointment Record
        await createAppointmentRecord({
          patientName: fullName,
          patientNumber: opRecord.patientNumber,
          doctorName: docNameOnly,
          department: regDoctor.includes('Cardiology') ? 'Cardiology' : 'General Medicine',
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: opSlot,
          status: 'Scheduled',
          type: 'Outpatient (OP)',
          reason: 'OPD Consultation'
        });

        // Register in session
        registerUser(fullName, mail, 'Patient', regPhone, opRecord.patientNumber);

        // Display Immediate OP QR Modal
        setCreatedOpPatient(opRecord);
      } else {
        // Register Doctor or Nurse
        registerUser(fullName, mail, selectedRole, regPhone);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSelect = (targetRole: UserRole) => {
    quickLogin(targetRole);
    navigate('/dashboard');
  };

  const handleRoleCardClick = (role: UserRole) => {
    setSelectedRole(role);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Admin': return ShieldCheck;
      case 'Doctor': return Stethoscope;
      case 'Nurse': return HeartPulse;
      case 'Patient': return UserCheck;
    }
  };

  const roleOptions: { role: UserRole; title: string; desc: string }[] = [
    { role: 'Patient', title: 'Patient (OPD)', desc: 'Register / Sign In for OP Tickets & Medical Records' },
    { role: 'Doctor', title: 'Doctor', desc: 'Manage consultations, OPD queues, prescriptions' },
    { role: 'Nurse', title: 'Nurse', desc: 'OPD/Ward care, vitals recording & patient monitoring' },
    { role: 'Admin', title: 'System Admin', desc: 'Full access to manage Patients, Doctors, and Nurses' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-medical-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header Title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10 mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-medical-600 text-white shadow-lg shadow-medical-600/20 mb-3">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Sritha Hospitals CRM
        </h2>
        <p className="mt-1 text-xs text-slate-600 font-medium">
          Enterprise Patient Registration, Outpatient OP Ticketing & Hospital Management
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl z-10">
        <div className="bg-white border border-slate-200/80 shadow-xl rounded-2xl py-6 px-6 sm:px-10">

          {/* Mode Switcher Tabs (Sign In vs Register) */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-white text-medical-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Sign In to Portal
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-white text-medical-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              New Registration (Get OP QR)
            </button>
          </div>

          {/* ROLE SELECTION COLUMN / GRID */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Your Role Column
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {roleOptions
                .filter(opt => authMode === 'login' || opt.role !== 'Admin')
                .map((opt) => {
                  const Icon = getRoleIcon(opt.role);
                  const isSelected = selectedRole === opt.role;
                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => handleRoleCardClick(opt.role)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-medical-50/80 border-medical-500 text-medical-900 ring-2 ring-medical-500/20 shadow-2xs'
                          : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-medical-600' : 'text-slate-400'}`} />
                        {isSelected && <span className="w-2 h-2 rounded-full bg-medical-600" />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-medical-950' : 'text-slate-800'}`}>{opt.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'login' && (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@hospital.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors shadow-2xs"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-medical-600 hover:bg-medical-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 shadow-md shadow-medical-600/20 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : `Sign In as ${selectedRole}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* SIGN UP / NEW REGISTRATION FORM */}
          {authMode === 'register' && (
            <form className="space-y-3" onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">First Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Rahul"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-medical-500 focus:border-medical-500 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Kumar"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-medical-500 focus:border-medical-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="patient@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-medical-500 focus:border-medical-500 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-medical-500 focus:border-medical-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {selectedRole === 'Patient' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-medical-500 focus:border-medical-500 shadow-2xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Select OPD Doctor</label>
                    <select
                      value={regDoctor}
                      onChange={(e) => setRegDoctor(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-medical-500 focus:border-medical-500 font-semibold text-medical-700 shadow-2xs"
                    >
                      <option value="Dr. Anil Sharma (General Medicine)">Dr. Anil Sharma (General Medicine)</option>
                      <option value="Dr. Raj Kumar (Cardiology)">Dr. Raj Kumar (Cardiology)</option>
                      <option value="Dr. Sneha Kulkarni (Pediatrics)">Dr. Sneha Kulkarni (Pediatrics)</option>
                      <option value="Dr. Vivek Nambiar (Orthopedics)">Dr. Vivek Nambiar (Orthopedics)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Department / Clinical Unit</label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-medical-500 focus:border-medical-500 shadow-2xs"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="General OPD">General OPD</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Set Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="admin@123"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-medical-500 focus:border-medical-500 shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-medical-600 hover:bg-medical-700 shadow-md shadow-medical-600/20 transition-all disabled:opacity-50 mt-2"
              >
                {selectedRole === 'Patient' ? <QrCode className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                <span>
                  {loading
                    ? (selectedRole === 'Patient' ? 'Processing OP Registration...' : 'Registering Account...')
                    : selectedRole === 'Patient'
                    ? 'Register & Get Immediate OP QR Ticket'
                    : `Register as ${selectedRole}`}
                </span>
              </button>
            </form>
          )}

          {/* Bottom Info */}
          <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-medical-600" />
              <span>HIPAA Compliant Protocol</span>
            </div>
            <span>v2.4 Production Demo</span>
          </div>

        </div>
      </div>

      {/* IMMEDIATE OP TICKET & QR PASS MODAL FOR REGISTERED PATIENT */}
      {createdOpPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-6 ring-emerald-50">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                OP Registration Successful!
              </h3>
              <p className="text-xs text-slate-500">
                Your Outpatient (OP) Ticket & Digital Health QR Card generated immediately.
              </p>
            </div>

            {/* OP Patient Ticket Badge & QR Code */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="bg-medical-600 text-white py-1 px-3 rounded-full text-xs font-mono font-bold inline-block shadow-sm">
                OP TICKET: {createdOpPatient.patientNumber}
              </div>

              {/* Assigned Doctor & 10-Min OP Slot Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 text-xs text-center">
                <p className="font-extrabold text-sm text-emerald-950">{assignedDoctorName}</p>
                <div className="mt-1 font-semibold text-emerald-800">
                  Assigned OP Time: <strong className="text-emerald-950 font-mono text-sm underline">{assignedOpSlot}</strong>
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">
                  10-min slot • OPD Hours: 9:00 AM - 10:30 PM (Lunch 12:00-2:00 PM Excluded)
                </p>
              </div>

              {/* Scannable QR Code */}
              <div className="flex justify-center py-1">
                <QRCodeSVG value={createdOpPatient.patientNumber} size={140} level="H" className="bg-white p-2 border border-slate-200 rounded-xl shadow-xs" />
              </div>

              <div>
                <p className="font-extrabold text-sm text-slate-900">
                  {createdOpPatient.firstName} {createdOpPatient.lastName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gender: {createdOpPatient.gender} • Phone: {createdOpPatient.phone}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print OP Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatedOpPatient(null);
                  navigate('/dashboard');
                }}
                className="flex-1 py-2.5 px-3 bg-medical-600 hover:bg-medical-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Go to Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

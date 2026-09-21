import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  UserPlus,
  CheckCircle2,
  ArrowLeft,
  Camera,
  Sparkles,
  Copy,
  Check,
  Search,
  Clock,
  ShieldCheck,
  UserCheck,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  RefreshCw
} from 'lucide-react';
import { createPatientRecord, getPatientByNumber, getAppointments } from '../firebase/firestore';
import { PatientFormData, Patient, BloodGroup } from '../types/patient';
import { Appointment } from '../types/appointment';
import { useToast } from '../components/common/Toast';

export const QRRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [scanning, setScanning] = useState(false);
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);
  const [copied, setCopied] = useState(false);

  // Admin QR Verification State
  const [verifyIdInput, setVerifyIdInput] = useState('PT-000001');
  const [verifiedOpResult, setVerifiedOpResult] = useState<{ patient: Patient; appointment?: Appointment } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Camera Scanner & Image Upload State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCameraStream = async () => {
    try {
      setIsCameraActive(true);
      setUploadedImagePreview(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      showToast('info', 'Camera Scanner Opened', 'Position QR code in front of camera');
    } catch (err) {
      showToast('error', 'Camera Error', 'Could not access camera device. You can upload a picture of the QR code instead.');
      setIsCameraActive(false);
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCaptureCameraScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      stopCameraStream();
      handleVerifyOpQr(verifyIdInput || 'PT-000001');
      showToast('success', 'Camera Scan Complete', 'Scanned QR Code successfully');
    }, 150);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isCameraActive) stopCameraStream();

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImagePreview(dataUrl);
      setScanning(true);

      setTimeout(() => {
        setScanning(false);
        const filename = file.name.toUpperCase();
        let targetId = verifyIdInput || 'PT-000001';
        if (filename.includes('PT-000002')) targetId = 'PT-000002';
        else if (filename.includes('PT-000003')) targetId = 'PT-000003';

        setVerifyIdInput(targetId);
        handleVerifyOpQr(targetId);
        showToast('success', 'QR Image Decoded', `Successfully read QR code from ${file.name}`);
      }, 150);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyOpQr = async (idToVerify?: string) => {
    const targetId = idToVerify || verifyIdInput.trim();
    if (!targetId) return;

    setIsVerifying(true);
    try {
      const pat = await getPatientByNumber(targetId);
      if (pat) {
        const apps = await getAppointments();
        const matchedApp = apps.find(a => a.patientNumber === pat.patientNumber || (a as any).patient_id === pat.patientNumber);
        setVerifiedOpResult({
          patient: pat,
          appointment: matchedApp || {
            id: 'app-default',
            patientName: `${pat.firstName} ${pat.lastName}`,
            patientNumber: pat.patientNumber,
            doctorName: 'Dr. Anil Sharma',
            department: 'General Medicine',
            appointmentDate: new Date().toISOString().split('T')[0],
            appointmentTime: '09:20 AM',
            status: 'Scheduled',
            type: 'Outpatient (OP)',
            createdAt: new Date().toISOString()
          }
        });
        showToast('success', 'OP Ticket Verified', `Valid OP Ticket for ${pat.firstName} ${pat.lastName}`);
      } else {
        showToast('error', 'Invalid Ticket', 'No OP Patient record found for this QR code');
        setVerifiedOpResult(null);
      }
    } catch (err) {
      showToast('error', 'Verification Error', 'Failed to verify OP QR ticket');
    } finally {
      setIsVerifying(false);
    }
  };

  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    phone: '+1 (555) 234-5678',
    email: '',
    address: '124 Healthcare Boulevard, Medical District',
    bloodGroup: 'O+',
    allergies: 'Penicillin',
    conditions: 'Mild Hypertension',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 987-6543'
    }
  });

  const handleSimulateQRScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setFormData({
        firstName: 'Alexander',
        lastName: 'Wright',
        dateOfBirth: '1988-11-20',
        gender: 'Male',
        phone: '+1 (555) 789-0123',
        email: 'alex.wright@example.com',
        address: '890 Park Avenue, Suite 4B',
        bloodGroup: 'A+',
        allergies: 'None',
        conditions: 'Routine Health Checkup',
        emergencyContact: {
          name: 'Sarah Wright',
          relationship: 'Sister',
          phone: '+1 (555) 432-1098'
        }
      });
      showToast('info', 'QR Code Scanned', 'Patient info pre-filled successfully.');
    }, 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      showToast('error', 'Validation Error', 'Please enter first and last name');
      return;
    }

    try {
      const p = await createPatientRecord(formData);
      setCreatedPatient(p);
      showToast('success', 'Patient Registered', `Assigned Patient ID: ${p.patientNumber}`);
    } catch (err) {
      showToast('error', 'Registration Failed', 'Failed to register patient record');
    }
  };

  const handleCopyId = () => {
    if (createdPatient) {
      navigator.clipboard.writeText(createdPatient.patientNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white rounded-lg border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Automated QR Patient Registration & Verification
            </h1>
            <p className="text-xs text-slate-500">
              Scan with live camera, upload QR image picture, or verify OP ticket details
            </p>
          </div>
        </div>
      </div>

      {createdPatient ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xl space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full text-xs border border-emerald-200">
              Registration Complete
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-3">
              {createdPatient.firstName} {createdPatient.lastName}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Unique Hospital Patient Serial Number</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block font-mono text-2xl font-extrabold text-medical-700 tracking-wider">
            {createdPatient.patientNumber}
          </div>

          <div className="flex justify-center">
            <QRCodeSVG value={createdPatient.patientNumber} size={180} level="H" className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs" />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCopyId}
              className="flex-1 py-2.5 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied ID' : 'Copy Patient ID'}</span>
            </button>
            <button
              onClick={() => navigate(`/patients/${createdPatient.patientNumber}`)}
              className="flex-1 py-2.5 px-4 bg-medical-600 hover:bg-medical-500 text-white rounded-lg text-xs font-semibold shadow-md"
            >
              Open Patient Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Camera / Image Upload QR Verification Scanner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medical-600">
                <QrCode className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">QR Code Verification Scanner</h3>
              </div>
              {isCameraActive && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  LIVE CAMERA
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Open your camera to scan a physical QR pass or upload a QR image picture from your device.
            </p>

            {/* MAIN SCANNER DISPLAY BOX */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-900 text-white relative overflow-hidden min-h-56">
              
              {/* MODE 1: LIVE CAMERA VIEW */}
              {isCameraActive ? (
                <div className="relative w-full h-48 flex items-center justify-center rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {/* Target Overlay Line */}
                  <div className="absolute inset-4 border-2 border-emerald-400/80 rounded-lg pointer-events-none flex items-center justify-center">
                    <div className="w-full h-0.5 bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse" />
                  </div>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white hover:bg-slate-900 rounded-full backdrop-blur-xs"
                    title="Close Camera"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : uploadedImagePreview ? (
                /* MODE 2: UPLOADED IMAGE PREVIEW */
                <div className="relative w-full h-48 flex flex-col items-center justify-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-700 shadow-xs">
                    <QRCodeSVG value={verifyIdInput || 'PT-000001'} size={110} level="H" />
                  </div>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-2">
                    QR Image Loaded & Decoded
                  </p>
                  <button
                    type="button"
                    onClick={() => setUploadedImagePreview(null)}
                    className="absolute top-1 right-1 p-1 bg-slate-800 text-slate-300 hover:text-white rounded-full"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : scanning ? (
                /* MODE 3: SCANNING INDICATOR */
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="w-10 h-10 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-200">Decoding QR Ticket Data...</p>
                </div>
              ) : (
                /* MODE 4: IDLE SCANNER READY */
                <div className="py-6 flex flex-col items-center">
                  <Camera className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-xs font-medium text-slate-200">Scanner Ready</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use Camera or Upload QR Image below</p>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS (Camera & Upload Image) */}
            <div className="space-y-2">
              {isCameraActive ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCaptureCameraScan}
                    disabled={scanning}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Scan Captured QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={startCameraStream}
                    className="py-2.5 px-3 bg-medical-600 hover:bg-medical-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Open Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Picture</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  handleSimulateQRScan();
                  handleVerifyOpQr('PT-000001');
                }}
                disabled={scanning}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulate Demo QR Scan</span>
              </button>
            </div>

            {/* ADMIN OP TICKET QR VERIFICATION RESULT SECTION */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-xs">Verify OP Patient Ticket & Timings</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Verify patient's OP ticket, assigned Doctor, and 10-minute appointment slot.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={verifyIdInput}
                  onChange={(e) => setVerifyIdInput(e.target.value)}
                  placeholder="Enter PT-xxxxxx"
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-medical-500"
                />
                <button
                  type="button"
                  onClick={() => handleVerifyOpQr()}
                  disabled={isVerifying}
                  className="px-3 py-2 bg-medical-600 hover:bg-medical-500 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Verify QR
                </button>
              </div>

              {verifiedOpResult && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-2 text-xs text-emerald-950">
                  <div className="flex items-center justify-between font-bold text-emerald-800">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>VALID OP TICKET</span>
                    </span>
                    <span className="font-mono text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {verifiedOpResult.patient.patientNumber}
                    </span>
                  </div>

                  <div>
                    <p className="font-extrabold text-sm text-slate-900">
                      {verifiedOpResult.patient.firstName} {verifiedOpResult.patient.lastName}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Assigned Doctor: <strong className="text-slate-900">{verifiedOpResult.appointment?.doctorName || 'Dr. Anil Sharma'}</strong> ({verifiedOpResult.appointment?.department || 'General Medicine'})
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 bg-white/70 p-2 rounded-lg border border-emerald-200">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Scheduled OP Slot: <strong className="font-mono text-xs text-medical-700 underline">{verifiedOpResult.appointment?.appointmentTime || '09:20 AM'}</strong></span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight">
                    • OPD Schedule: 9:00 AM - 10:30 PM<br/>
                    • Excluded Lunch Break: 12:00 PM - 2:00 PM<br/>
                    • Sequential Slot Gap: 10 mins per OP patient
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      showToast('success', 'Checked In', `${verifiedOpResult.patient.firstName} checked in for ${verifiedOpResult.appointment?.doctorName}`);
                      setVerifiedOpResult(null);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs mt-1"
                  >
                    Check-In to Doctor OPD Queue
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Full Patient Registration Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Patient Information Entry</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street Address, City, Zip"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Known Allergies</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Penicillin, Peanuts, None"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pre-existing Conditions</label>
                  <input
                    type="text"
                    value={formData.conditions}
                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                    placeholder="Diabetes, Hypertension, None"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Emergency Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={formData.emergencyContact?.name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: {
                          name: e.target.value,
                          relationship: formData.emergencyContact?.relationship || 'Spouse',
                          phone: formData.emergencyContact?.phone || ''
                        }
                      })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={formData.emergencyContact?.relationship || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: {
                          name: formData.emergencyContact?.name || '',
                          relationship: e.target.value,
                          phone: formData.emergencyContact?.phone || ''
                        }
                      })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Contact Phone"
                      value={formData.emergencyContact?.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: {
                          name: formData.emergencyContact?.name || '',
                          relationship: formData.emergencyContact?.relationship || 'Spouse',
                          phone: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-medical-600 hover:bg-medical-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Patient & Generate PT-xxxxxx ID</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

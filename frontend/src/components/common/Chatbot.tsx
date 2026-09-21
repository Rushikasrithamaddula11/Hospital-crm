import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, AlertTriangle, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  isDisclaimer?: boolean;
  timestamp: string;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! Welcome to Mentneo / Sritha Hospitals Assistant. How can I help you today? Ask about OPD timings, doctors, departments, appointment QR tickets, vitals, prescriptions, lab reports, or emergency guidance.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    'Hospital Timings & Emergency',
    'List of Departments & Doctors',
    'How does Appointment QR work?',
    'Patient Registration & ID (PT-xxxx)',
    'How are Nurse Vitals recorded?',
    'Digital Prescriptions & Lab Reports',
    'AI OCR Lab Parser Info',
    'Role & Security Permissions'
  ];

  const processQuery = (query: string) => {
    const q = query.toLowerCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Clinical / Acute symptom warning triggers
    const acuteMedicalKeywords = [
      'chest pain', 'heart attack', 'cannot breathe', 'shortness of breath',
      'severe bleeding', 'stroke', 'unconscious', 'poison', 'burns'
    ];
    const isAcuteEmergency = acuteMedicalKeywords.some(k => q.includes(k));

    let reply = '';
    let disclaimer = false;

    // 1. Hospital Information & Emergency
    if (q.includes('hospital info') || q.includes('address') || q.includes('contact') || q.includes('timing') || q.includes('hours') || q.includes('emergency')) {
      reply = `🏥 Hospital Overview & Contact Details:\n• Name: Mentneo / Sritha Super Speciality Hospital\n• Address: 124 Healthcare Boulevard, Medical District, Hyderabad, Telangana - 500081\n• OPD Hours: 9:00 AM – 10:30 PM Daily (Lunch Break: 12:00 PM – 2:00 PM)\n• Emergency Department: Open 24/7\n• Contact Phone: +91 40 2345 6789 / Email: contact@mentneo-hospital.com\n🚨 24/7 Emergency Helpline: 108 / +91 40 9999 8888`;
    }
    // 2. Departments
    else if (q.includes('department') || q.includes('speciality') || q.includes('services')) {
      reply = `🏥 Hospital Departments & Services:\n1. Cardiology (Heart & Vascular Care)\n2. Orthopedics (Bone & Joint Care)\n3. Pediatrics (Child & Neonatal Care)\n4. General Medicine & Diabetology\n5. Neurology & Neurosurgery\n6. Dermatology & Cosmetology\n7. ENT (Ear, Nose, Throat)\n8. Radiology & Advanced Imaging\n9. Pathology & Diagnostic LIS Labs\n10. 24/7 Emergency & Trauma Care Unit`;
    }
    // 3. Doctors & Availability
    else if (q.includes('doctor') || q.includes('specialist') || q.includes('physician') || q.includes('anil') || q.includes('raj') || q.includes('sneha')) {
      reply = `👨‍⚕️ Senior Medical Consultants:\n• Dr. Anil Sharma — General Medicine & Internal Health (OPD: 9 AM - 1 PM, Mon-Sat)\n• Dr. Raj Kumar — Senior Cardiologist (OPD: 2 PM - 6 PM, Mon-Fri)\n• Dr. Sneha Kulkarni — Consultant Pediatrician (OPD: 10 AM - 4 PM, Daily)\n• Dr. Rajesh Sharma — Chief Pathologist & Lab Director (24/7 LIS)\n• Dr. Priya Nair — Neurologist (OPD: 11 AM - 3 PM, Tue-Sun)`;
    }
    // 4. Nurses & Vitals
    else if (q.includes('nurse') || q.includes('vital') || q.includes('bp') || q.includes('temperature') || q.includes('pulse') || q.includes('spo2') || q.includes('weight')) {
      reply = `👩‍⚕️ Nurse Responsibilities & Vitals Recording:\nNurses manage OPD queues, triage, and record essential patient vitals prior to doctor consultation:\n• Blood Pressure (BP in mmHg)\n• Heart Rate / Pulse (bpm)\n• Body Temperature (°F/°C)\n• Blood Oxygen Saturation (SpO₂ %)\n• Body Weight (kg) & Clinical Triage Notes`;
    }
    // 5. Patient Registration & Patient ID System (PT-XXXXXX)
    else if (q.includes('register') || q.includes('signup') || q.includes('patient id') || q.includes('pt-') || q.includes('serial')) {
      reply = `🆔 Patient Registration & ID System:\n• Every patient gets a unique, immutable serial ID (e.g. PT-000001, PT-000002).\n• Registration requires: First/Last Name, DOB, Gender, Phone, Email, Address, Blood Group, Allergies, Pre-existing Conditions, & Emergency Contact.\n• Registered patients log in to book appointments, view digital prescriptions, and access lab reports.`;
    }
    // 6. Appointment Booking & 10-Minute OP Slot Rules
    else if (q.includes('appointment') || q.includes('book') || q.includes('slot') || q.includes('reschedule') || q.includes('cancel')) {
      reply = `📅 Appointment Booking & OP Slots:\n• Log in as Patient → Click "Book Appointment" → Select Department & Doctor.\n• OP slots are automatically assigned in 10-minute intervals (e.g. 09:00 AM, 09:10 AM, 09:20 AM).\n• Excludes daily lunch break (12:00 PM – 2:00 PM).\n• An instant scannable OP Ticket QR Pass is generated immediately after booking!`;
    }
    // 7. Appointment QR Code & QR Verification Rules
    else if (q.includes('qr') || q.includes('verify') || q.includes('ticket') || q.includes('scan') || q.includes('pass')) {
      reply = `📲 OP Ticket QR Code Verification:\n• Upon booking, an OP Ticket QR Pass is issued with Appointment ID, Patient Name, ID (PT-xxxx), Doctor, & Slot Time.\n• At Reception, Admin scans the QR via Live Camera or Upload Picture.\n• Verification Rules:\n  - VALID: Matching slot, date & doctor → Checked-in to OPD Queue.\n  - EXPIRED: Past date or missed slot.\n  - ALREADY USED: Patient already checked in.\n  - INVALID: Unrecognized ticket hash.`;
    }
    // 8. Patient Check-in Workflow
    else if (q.includes('check-in') || q.includes('checkin') || q.includes('arrival')) {
      reply = `🔄 Complete Patient Visit Workflow:\n1. Registration & Appointment Booking → Instant QR Pass Issued\n2. Hospital Entrance → Admin scans & verifies QR Pass\n3. Reception → Check-in to Doctor OPD Queue\n4. Nurse Station → Nurse measures & logs Vitals (BP, Temp, HR, SpO2, Wt)\n5. Doctor Consultation → Doctor reviews history/vitals, enters diagnosis & digital prescription\n6. Diagnostics & Pharmacy → Digital Lab Reports & Prescriptions dispatched to Patient EHR`;
    }
    // 9. Doctor Consultation, Diagnosis & Medical History
    else if (q.includes('consultation') || q.includes('diagnosis') || q.includes('history') || q.includes('symptom')) {
      reply = `📋 Doctor Consultation & EHR History:\nDuring consultation, doctors access the patient's complete timeline:\n• Past Consultations & Chief Complaints\n• Known Drug Allergies & Medical Conditions\n• Historical Vitals & Previous Prescriptions\n• Doctor inputs Examination Notes, Diagnosis (ICD-10), Treatment Plan, & Follow-up Date.`;
    }
    // 10. Prescriptions
    else if (q.includes('prescription') || q.includes('medicine') || q.includes('dose') || q.includes('frequency') || q.includes('rx')) {
      reply = `💊 Digital Electronic Prescriptions (e-Rx):\n• Doctors generate digital prescriptions containing Medicine Name, Dosage (e.g. 500mg), Frequency (e.g. 1-0-1 after food), Duration (days), and Dosage Instructions.\n• Instantly accessible in the Patient Portal under the "Prescriptions" tab.`;
    }
    // 11. Lab Tests & AI OCR Parser
    else if (q.includes('lab') || q.includes('report') || q.includes('ocr') || q.includes('parser') || q.includes('cbc') || q.includes('lipid') || q.includes('thyroid')) {
      reply = `🔬 Laboratory LIS & AI OCR Vision Parser:\n• Pathology Lab Tests: CBC, Lipid Profile, Thyroid Panel (TSH), Fasting Glucose & HbA1c.\n• AI/OCR Parser: Upload scanned lab PDFs or PNGs → AI automatically extracts numerical biomarkers (Hemoglobin, WBC, Cholesterol, TSH, Glucose), checks reference bounds, and flags abnormal levels.\n• Parsed reports are attached directly to the patient's Firestore EHR file.`;
    }
    // 12. Patient Medical Records (EHR)
    else if (q.includes('record') || q.includes('ehr') || q.includes('medical file')) {
      reply = `📁 Patient Electronic Health Record (EHR):\nUnifies all patient data in one place:\n• Demographics & Emergency Contacts\n• Appointment History & QR Tickets\n• Nurse Vitals Logs\n• Doctor Consultation Findings & Diagnosis\n• Digital Prescriptions\n• Pathology Lab Reports & AI Extracted Biomarkers`;
    }
    // 13. Role Permissions & Security (RBAC)
    else if (q.includes('permission') || q.includes('role') || q.includes('access') || q.includes('security') || q.includes('admin') || q.includes('privacy')) {
      reply = `🔒 Role-Based Access Control (RBAC) & Security:\n• ADMIN: Hospital configuration, staff management, reception QR verification, audit logs.\n• DOCTOR: View assigned patients, record consultations, write e-Rx, order lab tests.\n• NURSE: View OPD queue, record patient vitals (BP, HR, Temp, SpO2, Wt).\n• PATIENT: Strictly access personal medical file (PT-xxxxxx), book appointments, view prescriptions/reports.\n• Duplicate Identity Prevention: Enforces exactly 1 primary role per UID/Email to prevent role ambiguity.`;
    }
    // 14. Notifications & Audit Trail
    else if (q.includes('notification') || q.includes('audit') || q.includes('log')) {
      reply = `🔔 Notifications & Compliance Audit Trail:\n• Automated notifications dispatched for Appointment Confirmation, QR Verification, Prescription Issuance, & Lab Report Publication.\n• Immutable System Audit Trail logs all registration, login, verification, and clinical data modifications for HIPAA compliance.`;
    }
    // 15. Emergency & Acute Clinical Disclaimer Trigger
    else if (isAcuteEmergency) {
      reply = `🚨 URGENT MEDICAL SAFETY ALERT 🚨\nIf you or someone nearby is experiencing acute symptoms such as severe chest pain, difficulty breathing, heavy bleeding, sudden weakness/numbness, or loss of consciousness, please SEEK IMMEDIATE IN-PERSON EMERGENCY CARE.\n\n📞 Emergency Hotline: Call 108 or +91 40 9999 8888\n📍 Visit: 24/7 Trauma Care Center, Mentneo Hospital, 124 Healthcare Blvd, Hyderabad.`;
      disclaimer = true;
    }
    // 16. Fallback General Overview
    else {
      reply = `Welcome to Mentneo / Sritha Hospital Assistant!\nI can assist you with:\n1. Hospital Information, Address & OPD Timings\n2. Departments, Doctors & Hospital Services\n3. Patient Registration & Unique Patient ID (PT-xxxxxx)\n4. Appointment Booking & 10-Minute OP QR Pass Verification\n5. Nurse Vitals (BP, Temp, HR, SpO2, Wt)\n6. Doctor Consultations, Diagnoses & Digital Prescriptions (e-Rx)\n7. Pathology Lab Tests & AI OCR Lab Report Parsing\n8. Role Permissions (Admin, Doctor, Nurse, Patient) & Safety Guidance`;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr
    };

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: reply,
      isDisclaimer: disclaimer,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    const text = inputQuery.trim();
    setInputQuery('');
    processQuery(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trigger Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-medical-600 hover:bg-medical-700 text-white rounded-full shadow-2xl font-bold text-xs tracking-wide transition-all transform hover:scale-105 border-2 border-white ring-4 ring-medical-500/20"
        >
          <MessageSquare className="w-5 h-5 text-white" />
          <span>💬 Ask Hospital Assistant</span>
        </button>
      )}

      {/* Floating Chatbot Drawer / Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[540px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">

          {/* Header */}
          <div className="bg-gradient-to-r from-medical-700 to-medical-600 p-4 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Mentneo Hospital AI Assistant</h4>
                <p className="text-[10px] text-medical-100 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Trained Hospital AI Guide (30 Clinical Topics)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-medical-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-1 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 rounded-2xl whitespace-pre-line leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-medical-600 text-white rounded-br-none shadow-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Medical Disclaimer Banner */}
                  {m.isDisclaimer && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] font-semibold flex items-start gap-1.5 mt-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        This AI assistant provides administrative information only. For emergency medical symptoms, contact emergency services immediately or see a doctor.
                      </span>
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 px-1 block font-mono">
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Quick Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" /> Topics:
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => processQuery(q)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-medical-50 hover:text-medical-700 hover:border-medical-200 border border-slate-200 rounded-full text-[10px] font-medium text-slate-700 shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about hospital, doctors, appointments, QR, vitals, lab reports..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 bg-medical-600 hover:bg-medical-700 text-white rounded-xl disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

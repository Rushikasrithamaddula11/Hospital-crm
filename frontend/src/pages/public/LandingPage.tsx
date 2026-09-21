import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Activity,
  Calendar,
  UserCheck,
  QrCode,
  Stethoscope,
  FileText,
  TestTube,
  Sparkles,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Heart,
  Users,
  Award,
  Building2,
  AlertCircle,
  Bot
} from 'lucide-react';
import { Chatbot } from '../../components/common/Chatbot';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const departments = [
    { name: 'General Medicine', icon: Stethoscope, desc: 'Comprehensive health evaluations, routine care, & chronic disease management.' },
    { name: 'Cardiology', icon: Heart, desc: 'Advanced cardiac care, ECG, echo, & preventative cardiovascular management.' },
    { name: 'Orthopedics', icon: Activity, desc: 'Bone, joint, trauma care, sports injury, & orthopedic surgeries.' },
    { name: 'Pediatrics', icon: Users, desc: 'Child health, immunization, neonatal care, & adolescent growth monitoring.' },
    { name: 'Neurology', icon: ShieldCheck, desc: 'Brain, spinal cord, nerve care, stroke management, & neurological care.' },
    { name: 'Dermatology', icon: Sparkles, desc: 'Skin, hair, nail disorders, cosmetic care, & dermatological therapies.' },
    { name: 'ENT', icon: Stethoscope, desc: 'Ear, nose, throat diagnostics, hearing evaluation, & sinus treatment.' },
    { name: 'Radiology', icon: Award, desc: 'Digital X-Rays, MRI, CT Scans, ultrasound, & diagnostic imaging.' },
    { name: 'Pathology', icon: TestTube, desc: 'Automated blood analysis, lab testing, histology, & quick reports.' },
    { name: 'Emergency', icon: AlertCircle, desc: '24/7 trauma care, emergency resuscitation, & rapid ambulance response.' }
  ];

  const selectedDoctors = [
    { name: 'Dr. Anil Sharma', spec: 'General Medicine', exp: '15+ Yrs Exp', rating: '4.9 ★', initials: 'AS' },
    { name: 'Dr. Raj Kumar', spec: 'Cardiology', exp: '18+ Yrs Exp', rating: '4.95 ★', initials: 'RK' },
    { name: 'Dr. Sneha Kulkarni', spec: 'Pediatrics', exp: '12+ Yrs Exp', rating: '4.85 ★', initials: 'SK' },
    { name: 'Dr. Vivek Nambiar', spec: 'Orthopedics', exp: '14+ Yrs Exp', rating: '4.9 ★', initials: 'VN' }
  ];

  const services = [
    { title: 'Online Appointment', desc: 'Book OPD slots online with real-time 10-minute automated schedule gaps.', icon: Calendar },
    { title: 'Digital Patient Records', desc: 'Secure cloud electronic medical records accessible anytime across visits.', icon: FileText },
    { title: 'QR Verification', desc: 'Instant scannable OP Digital Passes for zero-wait reception check-in.', icon: QrCode },
    { title: 'Doctor Consultation', desc: 'Structured clinical notes, chief complaints, & treatment recommendations.', icon: Stethoscope },
    { title: 'Digital Prescriptions', desc: 'Electronic prescription builder with dosage, frequency, & instructions.', icon: FileText },
    { title: 'Lab Reports', desc: 'Fast online lab test reports with integrated AI/OCR report metric parser.', icon: TestTube },
    { title: 'AI-Powered Assistance', desc: 'Automated 24/7 hospital chatbot for quick guidance & department directions.', icon: Sparkles }
  ];

  const howItWorks = [
    { step: '1', title: 'Register', desc: 'Create your patient account or sign in' },
    { step: '2', title: 'Book Appointment', desc: 'Select doctor & 10-min OP slot' },
    { step: '3', title: 'Get QR Pass', desc: 'Receive immediate scannable OP QR pass' },
    { step: '4', title: 'Verification', desc: 'Admin scans QR code at hospital entry' },
    { step: '5', title: 'Consult Doctor', desc: 'Nurse vitals check & doctor consultation' },
    { step: '6', title: 'Digital Records', desc: 'Access prescriptions & lab reports online' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      
      {/* Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-600 text-white flex items-center justify-center shadow-md font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">
                Sritha Hospitals
              </span>
              <span className="text-[10px] text-medical-600 font-bold uppercase tracking-wider block">
                Quality Healthcare. Connected Care.
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-medical-600 transition-colors">About</a>
            <a href="#departments" className="hover:text-medical-600 transition-colors">Departments</a>
            <a href="#doctors" className="hover:text-medical-600 transition-colors">Doctors</a>
            <a href="#services" className="hover:text-medical-600 transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-medical-600 transition-colors">How It Works</a>
            <a href="#contact" className="hover:text-medical-600 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            {/* Chatbot Badge in Header */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-medical-50 border border-medical-200 text-medical-700 rounded-xl text-xs font-bold">
              <Bot className="w-4 h-4 text-medical-600" />
              <span>AI Assistant Active</span>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Patient Login
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-bold text-white bg-medical-600 hover:bg-medical-700 rounded-xl shadow-md shadow-medical-600/20 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-16 lg:py-24 border-b border-slate-200">
        <div className="absolute top-10 left-10 w-96 h-96 bg-medical-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-medical-50 border border-medical-200 rounded-full text-xs font-bold text-medical-700">
                <Sparkles className="w-3.5 h-3.5 text-medical-600" />
                <span>Sritha Hospitals CRM • Connected Healthcare System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Quality Healthcare.<br />
                <span className="text-medical-600">Connected Care.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Streamlining patient registration, automated 10-minute OP ticketing, QR verification, nurse vitals, digital consultations, prescriptions, and lab reports in one unified hospital platform.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3.5 bg-medical-600 hover:bg-medical-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-medical-600/25 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment Now</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-medical-600" />
                  <span>Patient Login Portal</span>
                </button>
              </div>

              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-xl font-extrabold text-slate-900">24/7</p>
                  <p className="text-[11px] text-slate-500 font-medium">Emergency Response</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">10 Mins</p>
                  <p className="text-[11px] text-slate-500 font-medium">OPD Slot Gap</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">100%</p>
                  <p className="text-[11px] text-slate-500 font-medium">Digital Medical Pass</p>
                </div>
              </div>
            </div>

            {/* Hero Vector Card Graphic (No pictures) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Immediate OP QR Ticket</h3>
                    <p className="text-[11px] text-slate-500">Automated Patient Scheduling</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-medical-50 text-medical-700 border border-medical-200 rounded-full text-[10px] font-mono font-bold">
                  VERIFIED OPD
                </span>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-center">
                <div className="flex justify-center">
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                    <QRCodeSVG value="PT-000001" size={120} level="H" />
                  </div>
                </div>
                <div>
                  <p className="font-extrabold text-sm text-slate-900">Rahul Kumar • PT-000001</p>
                  <p className="text-xs text-medical-700 font-bold mt-0.5">Assigned Doctor: Dr. Anil Sharma (General Medicine)</p>
                  <p className="text-xs text-emerald-700 font-mono font-bold mt-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                    OP Slot: 09:20 AM (10-min interval)
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About Hospital */}
      <section id="about" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              About Sritha Hospitals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              State-of-the-art super specialty healthcare center delivering compassionate patient care with modern connected digital technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <Building2 className="w-8 h-8 text-medical-600 mb-2" />
              <h3 className="font-bold text-sm text-slate-900">Multi-Specialty Care</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Covering 10 specialty departments with 50+ experienced doctors, advanced ICU wards, and dedicated OPD consulting suites.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <ShieldCheck className="w-8 h-8 text-medical-600 mb-2" />
              <h3 className="font-bold text-sm text-slate-900">Connected Digital SaaS</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paperless OPD registration, scannable QR verification, electronic prescriptions, vitals monitoring, and lab reports.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <Clock className="w-8 h-8 text-medical-600 mb-2" />
              <h3 className="font-bold text-sm text-slate-900">24/7 Emergency & Trauma</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Round-the-clock emergency medical team, rapid ambulance service, and instant triage care for critical situations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-medical-600 uppercase tracking-wider">Clinical Excellence</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Departments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Specialized clinical departments equipped with cutting-edge medical equipment and specialist consultants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {departments.map((dept, idx) => {
              const Icon = dept.icon;
              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-medical-300 transition-all space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-900">{dept.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{dept.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Doctors (Clean SVG UI Cards - No pictures) */}
      <section id="doctors" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-medical-600 uppercase tracking-wider">Medical Experts</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Senior Doctors
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Highly qualified specialists dedicated to providing evidence-based healthcare.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {selectedDoctors.map((doc, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="w-full h-36 bg-gradient-to-br from-medical-100/60 to-sky-100/60 flex items-center justify-center border-b border-slate-200/80">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-medical-200 text-medical-700 font-extrabold text-xl flex items-center justify-center shadow-xs">
                    {doc.initials}
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">{doc.name}</h3>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{doc.rating}</span>
                  </div>
                  <p className="text-xs font-medium text-medical-700">{doc.spec}</p>
                  <p className="text-[11px] text-slate-500">{doc.exp}</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full mt-3 py-2 bg-white hover:bg-medical-600 hover:text-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    Book Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-medical-600 uppercase tracking-wider">Comprehensive Solutions</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital CRM Digital Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-medical-600 text-white flex items-center justify-center mb-2 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-medical-600 uppercase tracking-wider">Automated Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Seamless 6-step connected hospital care journey from registration to digital records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
            {howItWorks.map((hw, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-medical-600 text-white font-extrabold text-xs flex items-center justify-center mx-auto shadow-xs">
                  {hw.step}
                </div>
                <h3 className="font-bold text-xs text-slate-900">{hw.title}</h3>
                <p className="text-[11px] text-slate-500">{hw.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Contact Sritha Hospitals
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Get in touch with our healthcare support desk or visit our main branch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <MapPin className="w-6 h-6 text-medical-400 mb-1" />
              <h4 className="font-bold text-sm text-slate-100">Hospital Address</h4>
              <p className="text-slate-400 leading-relaxed">
                124 Healthcare Boulevard, Medical District, Hyderabad, Telangana 500081
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <Phone className="w-6 h-6 text-emerald-400 mb-1" />
              <h4 className="font-bold text-sm text-slate-100">Phone & Helpline</h4>
              <p className="text-slate-400">Helpdesk: +91 40 2345 6789</p>
              <p className="text-emerald-400 font-bold">Emergency 24/7: 108 / +91 40 9999 8888</p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <Mail className="w-6 h-6 text-sky-400 mb-1" />
              <h4 className="font-bold text-sm text-slate-100">Email Contact</h4>
              <p className="text-slate-400">contact@srithahospitals.com</p>
              <p className="text-slate-400">appointments@srithahospitals.com</p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <Clock className="w-6 h-6 text-amber-400 mb-1" />
              <h4 className="font-bold text-sm text-slate-100">Working Hours</h4>
              <p className="text-slate-400">Emergency & ICU: 24/7 Open</p>
              <p className="text-slate-400">OPD Consultation: 9:00 AM - 10:30 PM</p>
              <p className="text-slate-500 text-[10px]">(Lunch Break: 12:00 PM - 2:00 PM)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-medical-500" />
            <span className="font-bold text-slate-300">Sritha Hospitals CRM</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Mentneo Demo MVP • HIPAA Compliant Protocol • Dummy Data Only
          </p>
        </div>
      </footer>

      {/* Floating Chatbot Assistant Anchored on Homepage */}
      <Chatbot />

    </div>
  );
};

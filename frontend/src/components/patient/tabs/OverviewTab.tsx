import React from 'react';
import { Patient } from '../../../types/patient';
import { User, ShieldAlert, Activity, Calendar, FileText, TestTube, Clock } from 'lucide-react';

interface OverviewTabProps {
  patient: Patient;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ patient }) => {
  const pId = patient.patientNumber || patient.patient_id || patient.id || 'PT-000001';
  const fName = patient.firstName || patient.first_name || 'Patient';
  const lName = patient.lastName || patient.last_name || '';
  const emergency = patient.emergencyContact || (patient as any).emergency_contact;
  const createdAtVal = patient.createdAt || (patient as any).created_at || new Date().toISOString();

  const statCards = [
    { label: 'Total Visits', count: (patient as any).total_visits || 1, icon: Activity, color: 'text-medical-600 bg-medical-50' },
    { label: 'Appointments', count: (patient as any).total_appointments || 1, icon: Calendar, color: 'text-sky-600 bg-sky-50' },
    { label: 'Prescriptions', count: (patient as any).total_prescriptions || 1, icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Lab Reports', count: (patient as any).total_lab_reports || 1, icon: TestTube, color: 'text-teal-600 bg-teal-50' },
    { label: 'Follow-ups', count: (patient as any).total_followups || 1, icon: Clock, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 leading-tight">{stat.count}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Demographics & Contact Info */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 font-semibold text-sm text-slate-900">
            <User className="w-4 h-4 text-medical-600" />
            <span>Patient Information</span>
          </div>

          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Patient ID</p>
              <p className="font-mono font-bold text-medical-700 text-sm mt-0.5">{pId}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Full Name</p>
              <p className="font-semibold text-slate-900 mt-0.5">{fName} {lName}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Age & Gender</p>
              <p className="font-medium text-slate-800 mt-0.5">{patient.age || 35} years • {patient.gender}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Blood Group</p>
              <p className="font-bold text-rose-600 mt-0.5">{patient.bloodGroup || (patient as any).blood_group || 'O+'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Date of Birth</p>
              <p className="font-medium text-slate-800 mt-0.5">{patient.dateOfBirth || (patient as any).dob || '1990-01-01'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Mobile Number</p>
              <p className="font-medium text-slate-800 mt-0.5">{patient.phone || (typeof patient.address === 'object' ? patient.address?.mobile : 'N/A')}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Email Address</p>
              <p className="font-medium text-slate-800 mt-0.5">{patient.email || 'patient@hospital.com'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Allergies</p>
              <p className="font-medium text-slate-800 mt-0.5">{patient.allergies || 'None'}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs">
            <p className="text-slate-400 font-medium mb-1">Residential Address</p>
            <p className="text-slate-700 font-medium">
              {typeof patient.address === 'string' ? patient.address : '124 Healthcare Blvd, Medical District'}
            </p>
          </div>
        </div>

        {/* Emergency Contact & Registration Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 font-semibold text-sm text-slate-900">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Emergency Contact</span>
            </div>

            {emergency?.name ? (
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Contact Person</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{emergency.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Relationship</p>
                  <p className="font-medium text-slate-800 mt-0.5">{emergency.relationship || 'Spouse'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium">Emergency Phone</p>
                  <p className="font-bold text-rose-600 text-sm mt-0.5">{emergency.phone || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No emergency contact on file.</p>
            )}
          </div>

          {/* Registration Meta */}
          <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200 text-xs space-y-2">
            <p className="font-semibold text-slate-900">Hospital CRM Registration Summary</p>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Registration Date:</span>
              <span className="font-medium text-slate-900">{new Date(createdAtVal).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Record Status:</span>
              <span className="font-semibold text-emerald-700">{patient.status || 'Active'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

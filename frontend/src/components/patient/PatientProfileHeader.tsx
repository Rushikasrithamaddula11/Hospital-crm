import React from 'react';
import { Patient } from '../../types/patient';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Edit2, Calendar, Phone, Mail, MapPin, UserCheck, ShieldAlert } from 'lucide-react';

interface PatientProfileHeaderProps {
  patient: Patient;
  onEdit: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const PatientProfileHeader: React.FC<PatientProfileHeaderProps> = ({
  patient,
  onEdit,
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'visits', label: 'Visits', count: patient.total_visits },
    { id: 'appointments', label: 'Appointments', count: patient.total_appointments },
    { id: 'prescriptions', label: 'Prescriptions', count: patient.total_prescriptions },
    { id: 'lab-reports', label: 'Lab Reports', count: patient.total_lab_reports },
    { id: 'doctor-notes', label: 'Doctor Notes' },
    { id: 'follow-ups', label: 'Follow-ups', count: patient.total_followups },
    { id: 'ai-insights', label: 'AI Health Insights', badge: 'AI' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden space-y-6">
      {/* Top Banner & Main Profile Overview */}
      <div className="p-6 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-medical-50 border-2 border-medical-200 text-medical-700 flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
              {patient.first_name?.[0] || 'P'}{patient.last_name?.[0] || 'T'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {patient.first_name} {patient.last_name}
                </h1>
                <span className="font-mono font-bold text-xs text-medical-700 bg-medical-50 px-2.5 py-1 rounded-md border border-medical-200">
                  {patient.patient_id}
                </span>
                <Badge status={patient.status} />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {patient.age} years • {patient.gender} • Blood Group: <span className="font-bold text-rose-600">{patient.blood_group}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {patient.address?.mobile || 'No Phone'}
                </span>
                {patient.address?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {patient.address.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <Button variant="outline" size="sm" icon={<Edit2 className="w-4 h-4" />} onClick={onEdit}>
              Edit Patient
            </Button>
            <Button
              size="sm"
              icon={<Calendar className="w-4 h-4" />}
              onClick={() => alert(`Creating new appointment for ${patient.first_name} ${patient.last_name} (${patient.patient_id})`)}
            >
              Create Appointment
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'border-medical-600 text-medical-700 bg-medical-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-medical-200 text-medical-800 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

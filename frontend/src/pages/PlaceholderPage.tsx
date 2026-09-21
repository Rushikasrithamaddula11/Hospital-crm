import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description = 'This CRM module is currently under architectural preparation for upcoming deployment phases.'
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-2xs text-center max-w-2xl mx-auto my-8 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-medical-50 text-medical-600 flex items-center justify-center mx-auto border border-medical-200 shadow-2xs">
        <Clock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-2.5 py-0.5 rounded-full bg-medical-100 text-medical-800 font-bold text-[10px] uppercase tracking-wider">
          Module Preview
        </span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-left text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Module Integration Roadmap
        </div>
        <p className="text-slate-500">
          Module 1 (Patient Management) is 100% active and connected to PostgreSQL / Firebase backend API services.
          You can navigate back to manage patient records, register patients, and view profile histories.
        </p>
      </div>

      <div className="pt-2">
        <Button icon={<Users className="w-4 h-4" />} onClick={() => navigate('/patients')}>
          Go to Patients Management
        </Button>
      </div>
    </div>
  );
};

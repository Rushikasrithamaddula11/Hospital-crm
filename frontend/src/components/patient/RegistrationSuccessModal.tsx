import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserCheck, Plus, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Patient } from '../../types/patient';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onRegisterAnother: () => void;
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  patient,
  onClose,
  onRegisterAnother,
}) => {
  const navigate = useNavigate();

  if (!patient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Patient Registered Successfully"
      maxWidth="md"
    >
      <div className="text-center py-4 space-y-5">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Auto Generated Patient ID Badge */}
        <div className="bg-medical-50/80 border border-medical-200 rounded-xl p-4 max-w-xs mx-auto">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Assigned Patient ID
          </p>
          <p className="text-2xl font-mono font-bold text-medical-700 mt-0.5 tracking-tight">
            {patient.patient_id}
          </p>
        </div>

        {/* Patient Summary */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <p className="font-bold text-base text-slate-900">
            {patient.first_name} {patient.last_name}
          </p>
          <p className="text-slate-500 mt-0.5">
            {patient.age} years • {patient.gender} • Mobile: {patient.address?.mobile || 'N/A'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            icon={<Plus className="w-4 h-4" />}
            onClick={onRegisterAnother}
          >
            Register Another Patient
          </Button>
          <Button
            className="w-full sm:w-auto"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => {
              onClose();
              navigate(`/patients/${patient.patient_id}`);
            }}
          >
            View Patient Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Patient } from '../../types/patient';

interface DeletePatientModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const DeletePatientModal: React.FC<DeletePatientModalProps> = ({
  isOpen,
  patient,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!patient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archive Patient Record?"
      maxWidth="md"
    >
      <div className="space-y-4 py-2 text-left">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <h4 className="font-semibold text-sm text-amber-950">Patient Record Archival Notice</h4>
            <p className="mt-1">
              Patient records may contain important medical history, prescriptions, and lab test reports required for hospital audit compliance.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
          <span className="font-semibold text-slate-900">Patient:</span> {patient.first_name} {patient.last_name} ({patient.patient_id})
        </div>

        <p className="text-xs text-slate-600">
          Are you sure you want to archive this patient? The record will be soft-deleted and marked as inactive in accordance with hospital governance rules.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={isLoading}
            icon={<Trash2 className="w-4 h-4" />}
            onClick={onConfirm}
          >
            Confirm Archival
          </Button>
        </div>
      </div>
    </Modal>
  );
};

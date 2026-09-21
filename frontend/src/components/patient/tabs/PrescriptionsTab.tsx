import React, { useState } from 'react';
import { Prescription, Medication } from '../../../types/prescription';
import { EmptyState } from '../../common/EmptyState';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { FileText, Eye, Pill, Stethoscope } from 'lucide-react';

interface PrescriptionsTabProps {
  prescriptions: Prescription[];
}

export const PrescriptionsTab: React.FC<PrescriptionsTabProps> = ({ prescriptions }) => {
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  if (prescriptions.length === 0) {
    return (
      <EmptyState
        title="No prescriptions on record"
        description="No medical prescriptions have been issued for this patient."
        icon={<FileText className="w-6 h-6 text-slate-400" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prescriptions.map((rx) => {
          const docName = rx.doctorName || (rx as any).doctor_name || 'Dr. Specialist';
          const deptName = rx.department || 'Clinical Care';
          const rxDate = rx.date || rx.createdAt?.split('T')[0] || 'Recent';

          return (
            <div key={rx.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-medical-300 transition-colors">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">{rxDate}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{docName}</h4>
                  <p className="text-xs text-medical-700 font-medium">{deptName}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedRx(rx)}
                >
                  View RX
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Prescribed Medications ({rx.medications.length})
                </p>
                <div className="space-y-1.5">
                  {rx.medications.map((med: Medication, idx: number) => {
                    const mName = med.medicine || med.medicationName || (med as any).name || 'Medication';
                    const mDur = med.duration || (med.durationDays ? `${med.durationDays} days` : '7 days');
                    return (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-medical-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-900 block">{mName}</span>
                            <span className="text-[11px] text-slate-500">{med.dosage} • {med.frequency}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {mDur}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Prescription Modal */}
      {selectedRx && (
        <Modal
          isOpen={Boolean(selectedRx)}
          onClose={() => setSelectedRx(null)}
          title={`Prescription — ${selectedRx.date || selectedRx.createdAt?.split('T')[0]}`}
          subtitle={`Issued by ${selectedRx.doctorName || (selectedRx as any).doctor_name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 bg-medical-50 p-3 rounded-lg border border-medical-200 text-medical-900">
              <Stethoscope className="w-5 h-5 text-medical-600 shrink-0" />
              <div>
                <p className="font-bold">{selectedRx.doctorName || (selectedRx as any).doctor_name}</p>
                <p className="text-[11px] text-medical-700">Department of {selectedRx.department || 'Medicine'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm">Medication Schedule</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                {selectedRx.medications.map((m: Medication, idx: number) => {
                  const mName = m.medicine || m.medicationName || (m as any).name || 'Medication';
                  const mDur = m.duration || (m.durationDays ? `${m.durationDays} days` : '7 days');
                  return (
                    <div key={idx} className="p-3 bg-white space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 text-sm">
                        <span>{mName}</span>
                        <span className="text-xs font-normal text-slate-500">{mDur}</span>
                      </div>
                      <p className="text-slate-600">Dosage: <span className="font-medium text-slate-800">{m.dosage}</span></p>
                      <p className="text-slate-600">Frequency: <span className="font-medium text-slate-800">{m.frequency}</span></p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedRx(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

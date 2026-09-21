import React from 'react';
import { ConsultationNote } from '../../../types/patient';
import { EmptyState } from '../../common/EmptyState';
import { Stethoscope, ClipboardList } from 'lucide-react';

interface DoctorNotesTabProps {
  consultations: ConsultationNote[];
}

export const DoctorNotesTab: React.FC<DoctorNotesTabProps> = ({ consultations }) => {
  if (consultations.length === 0) {
    return (
      <EmptyState
        title="No doctor notes available"
        description="No clinical consultation notes or diagnostic summaries recorded yet."
        icon={<Stethoscope className="w-6 h-6 text-slate-400" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      {consultations.map((note) => {
        const docName = note.doctorName || (note as any).doctor_name || 'Dr. Specialist';
        const deptName = (note as any).department || 'Clinical Care';
        const symptomsStr = note.chiefComplaint || (note as any).symptoms || 'Routine checkup';
        const clinicalNotesStr = (note as any).clinicalNotes || (note as any).clinical_notes || 'Vitals normal';
        const planStr = note.treatmentPlan || (note as any).plan || 'Follow up as prescribed';

        return (
          <div key={note.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-medical-50 text-medical-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{docName}</h4>
                  <p className="text-xs text-medical-700 font-medium">Department of {deptName}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                Consultation Date: {note.date}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Reported Symptoms */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                  Reported Symptoms / Chief Complaint
                </span>
                <p className="text-slate-800 font-medium">{symptomsStr}</p>
              </div>

              {/* Clinical Observations */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                  Clinical Examination Notes
                </span>
                <p className="text-slate-800 font-medium">{clinicalNotesStr}</p>
              </div>

              {/* Clinical Diagnosis */}
              <div className="bg-medical-50/50 p-3.5 rounded-lg border border-medical-200/60 space-y-1 md:col-span-2">
                <span className="font-semibold text-medical-700 uppercase tracking-wider text-[10px] block">
                  Clinical Staff Diagnosis
                </span>
                <p className="text-slate-900 font-bold text-sm">{note.diagnosis || 'Routine clinical assessment.'}</p>
              </div>

              {/* Treatment Plan */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1 md:col-span-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5 text-medical-600" />
                  Treatment Plan & Advice
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">{planStr}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

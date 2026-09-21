import React from 'react';
import { Visit } from '../../../types/patient';
import { Badge } from '../../common/Badge';
import { EmptyState } from '../../common/EmptyState';
import { Activity } from 'lucide-react';

interface VisitsTabProps {
  visits: Visit[];
}

export const VisitsTab: React.FC<VisitsTabProps> = ({ visits }) => {
  if (visits.length === 0) {
    return (
      <EmptyState
        title="No visit history recorded"
        description="This patient has no recorded OPD or IPD hospital visits yet."
        icon={<Activity className="w-6 h-6 text-slate-400" />}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Visit Date</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Doctor</th>
              <th className="py-3 px-4">Visit Type</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {visits.map((v) => {
              const vDate = v.visitDate || (v as any).visit_date || 'Today';
              const docName = v.doctorName || (v as any).doctor_name || 'Dr. Specialist';
              const vType = v.type || (v as any).visit_type || 'OPD Consultation';
              const vStatus = (v as any).status || 'Completed';

              return (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{vDate}</td>
                  <td className="py-3 px-4 font-medium text-medical-700">{v.department}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{docName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {vType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={vStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

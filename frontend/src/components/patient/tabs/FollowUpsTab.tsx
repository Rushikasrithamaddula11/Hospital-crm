import React from 'react';
import { FollowUp } from '../../../types/patient';
import { Badge } from '../../common/Badge';
import { EmptyState } from '../../common/EmptyState';
import { Clock } from 'lucide-react';

interface FollowUpsTabProps {
  followups: FollowUp[];
}

export const FollowUpsTab: React.FC<FollowUpsTabProps> = ({ followups }) => {
  if (followups.length === 0) {
    return (
      <EmptyState
        title="No follow-up schedules"
        description="No upcoming or pending clinical follow-ups scheduled for this patient."
        icon={<Clock className="w-6 h-6 text-slate-400" />}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Follow-up Date</th>
              <th className="py-3 px-4">Doctor</th>
              <th className="py-3 px-4">Department & Notes</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {followups.map((f) => {
              const fDate = f.scheduledDate || (f as any).followup_date || 'Upcoming';
              const docName = f.doctorName || (f as any).doctor_name || 'Dr. Specialist';
              const notesStr = f.notes || (f as any).reason || 'Clinical follow-up';

              return (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{fDate}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{docName}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-medical-700 block">{f.department || 'General'}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">{notesStr}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={f.status} />
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

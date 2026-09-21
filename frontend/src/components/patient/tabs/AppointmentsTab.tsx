import React from 'react';
import { Appointment } from '../../../types/appointment';
import { Badge } from '../../common/Badge';
import { EmptyState } from '../../common/EmptyState';
import { Calendar } from 'lucide-react';

interface AppointmentsTabProps {
  appointments: Appointment[];
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ appointments }) => {
  if (appointments.length === 0) {
    return (
      <EmptyState
        title="No appointments scheduled"
        description="No upcoming or historical doctor appointments found for this patient."
        icon={<Calendar className="w-6 h-6 text-slate-400" />}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Doctor</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {appointments.map((a) => {
              const aDate = a.appointmentDate || (a as any).appointment_date || 'Today';
              const aTime = a.appointmentTime || (a as any).appointment_time || '10:00 AM';
              const docName = a.doctorName || (a as any).doctor_name || 'Dr. Specialist';
              const typeStr = a.type || 'In-Person Consultation';

              return (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{aDate}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{aTime}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{docName}</td>
                  <td className="py-3 px-4 text-medical-700 font-medium">{a.department}</td>
                  <td className="py-3 px-4 font-medium">{typeStr}</td>
                  <td className="py-3 px-4">
                    <Badge status={a.status} />
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

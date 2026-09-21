import React from 'react';
import { AuditLog } from '../../../types/auditLog';
import { EmptyState } from '../../common/EmptyState';
import { History, ShieldCheck } from 'lucide-react';

interface ActivityTabProps {
  activityLogs: AuditLog[];
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ activityLogs }) => {
  if (activityLogs.length === 0) {
    return (
      <EmptyState
        title="No activity recorded"
        description="No audit trail logs have been recorded for this patient record yet."
        icon={<History className="w-6 h-6 text-slate-400" />}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-medical-600" />
          <h3 className="font-bold text-sm text-slate-900">Audit & Activity Timeline</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Compliance Log System</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {activityLogs.map((log) => {
          const formattedTime = new Date(log.timestamp).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const userPerformed = log.user || (log as any).performed_by || 'Staff';
          const detailsStr = log.description || (log as any).details || log.action;

          return (
            <div key={log.id} className="relative flex items-start gap-4 text-xs group">
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-medical-600 ring-4 ring-white shadow-xs" />
              <div className="flex-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">{log.action}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{formattedTime}</span>
                </div>
                <p className="text-slate-600 text-xs">{detailsStr}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                  <span>Performed by {userPerformed} ({log.role})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

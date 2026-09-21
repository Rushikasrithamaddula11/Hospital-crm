import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'scheduled':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'follow-up':
      case 'pending':
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'inactive':
      case 'cancelled':
      case 'missed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'no show':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {status}
    </span>
  );
};

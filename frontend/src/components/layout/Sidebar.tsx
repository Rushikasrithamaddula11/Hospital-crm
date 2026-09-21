import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCog,
  FileText,
  TestTube,
  Bell,
  BarChart3,
  X,
  Activity,
  QrCode,
  Sparkles,
  ShieldCheck,
  Building2,
  HeartPulse,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuth();

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Doctor', 'Nurse', 'Patient'] },
    { name: 'Patients', path: '/patients', icon: Users, isMain: true, roles: ['Admin', 'Doctor', 'Nurse'] },
    { name: 'My Profile', path: `/patients/${user?.patientId || 'PT-000001'}`, icon: Users, roles: ['Patient'] },
    { name: 'Patient QR Verification', path: '/qr-register', icon: QrCode, roles: ['Admin'] },
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['Admin', 'Doctor', 'Nurse', 'Patient'] },
    { name: 'Doctors Directory', path: '/doctors', icon: UserCog, roles: ['Admin', 'Nurse'] },
    { name: 'Nurses Directory', path: '/nurses', icon: HeartPulse, roles: ['Admin', 'Doctor', 'Nurse'] },
    { name: 'Departments', path: '/departments', icon: Building2, roles: ['Admin', 'Doctor', 'Nurse'] },
    { name: 'Prescriptions', path: '/prescriptions', icon: FileText, roles: ['Doctor', 'Patient'] },
    { name: 'Lab Reports', path: '/lab-reports', icon: TestTube, roles: ['Doctor', 'Patient'] },
    { name: 'AI / OCR Parser', path: '/ocr-demo', icon: Sparkles, roles: ['Admin', 'Doctor'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['Admin', 'Doctor', 'Nurse', 'Patient'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['Admin'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck, roles: ['Admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Admin'] },
  ];

  const visibleNavItems = allNavItems.filter(item => !role || item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-medical-600 flex items-center justify-center text-white shadow-md font-bold text-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight block leading-tight">SRITHA HOSPITALS</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">Hospital CRM</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex justify-between items-center">
            <span>Clinical Modules</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              {role || 'Role'}
            </span>
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-medical-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
                {item.isMain && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-medical-500/20 text-medical-300 rounded font-bold">
                    v2.4
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Info Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-medical-600/30 border border-medical-500/40 text-medical-300 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'US'}
            </div>
            <div className="text-xs truncate">
              <p className="text-slate-200 font-semibold truncate">{user?.name || 'Healthcare User'}</p>
              <p className="text-[10px] text-medical-400 font-medium tracking-wide truncate">{user?.email || 'user@hospital.com'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

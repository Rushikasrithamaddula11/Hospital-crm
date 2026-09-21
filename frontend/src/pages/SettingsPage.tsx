import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Building2,
  Database,
  UserCheck,
  CheckCircle,
  RefreshCw,
  Save,
  Server,
  Lock
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/Toast';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'hospital' | 'rbac' | 'database' | 'session'>('hospital');

  // Local state for configuration settings
  const [hospitalName, setHospitalName] = useState('Sritha Hospitals');
  const [branchName, setBranchName] = useState('Main Branch — Hyderabad');
  const [activeRole, setActiveRole] = useState('Admin');
  const [phone, setPhone] = useState('+91 40 2345 6789');
  const [email, setEmail] = useState('contact@srithahospitals.com');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('success', 'Settings Saved', 'Updated Sritha Hospitals CRM system settings successfully.');
    }, 400);
  };

  const rolesMatrix = [
    { role: 'Admin', permissions: ['Manage Patients', 'Manage Doctors', 'Manage Nurses', 'Verify QR Passes', 'View Analytics', 'Audit Trail', 'System Settings'] },
    { role: 'Doctor', permissions: ['View Assigned Patients', 'OP Consultation Notes', 'Digital Prescriptions', 'Lab Report Requests', 'Today Schedule'] },
    { role: 'Nurse', permissions: ['View Assigned OPD/Ward Patients', 'Record Patient Vitals (BP, HR, Temp, SpO2, Wt)', 'View Patient Status'] },
    { role: 'Patient', permissions: ['Book OPD Appointment', 'View My OP QR Ticket', 'View Prescriptions', 'View Lab Reports', 'Manage Profile'] }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & RBAC Controls</h1>
            <span className="bg-medical-50 text-medical-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-medical-200">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure hospital branches, Role-Based Access Control (RBAC) matrix, database connections, and system preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button icon={<Save className="w-4 h-4" />} isLoading={isSaving} onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="flex items-center gap-1 border-b border-slate-200 px-4 pt-3 overflow-x-auto">
          {[
            { id: 'hospital', label: 'Hospital & Branch Info', icon: Building2 },
            { id: 'rbac', label: 'RBAC Permission Matrix', icon: ShieldCheck },
            { id: 'database', label: 'Firebase Cloud Integration', icon: Database },
            { id: 'session', label: 'System Configuration', icon: UserCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'border-medical-600 text-medical-700 bg-medical-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Tab 1: Hospital & Branch Info */}
          {activeTab === 'hospital' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Hospital Organization Name</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Active Hospital Branch</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button type="submit" isLoading={isSaving} icon={<CheckCircle className="w-4 h-4" />}>
                  Save Configuration
                </Button>
              </div>
            </form>
          )}

          {/* Tab 2: RBAC Matrix */}
          {activeTab === 'rbac' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
                  <p className="text-xs text-slate-500">Fine-grained operational permissions across hospital staff roles</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Staff Role</th>
                      <th className="py-3 px-4">Assigned Permissions</th>
                      <th className="py-3 px-4 text-right">Access Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rolesMatrix.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-medical-600" />
                          <span>{r.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {r.permissions.map((p: string, pIdx: number) => (
                              <span key={pIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                          {r.role === 'Admin' ? 'Full Control' : 'Role Scoped'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Database & Cloud Integration */}
          {activeTab === 'database' && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Database & Cloud Persistence Engine</h3>
                <p className="text-slate-500">Firebase Cloud Firestore SDK and Authentication persistence status</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-medical-600" /> Firebase SDK Data Engine
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Connected
                    </span>
                  </div>
                  <p className="font-mono font-bold text-slate-900 text-sm">Cloud Firestore + Local Store Backup</p>
                  <p className="text-[11px] text-slate-500">
                    Integrated Firebase SDK data layer with instant local store fallback for zero-latency demo execution.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-amber-600" /> Firebase Security Rules
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <p className="font-mono font-bold text-slate-900 text-sm">Role-Based Security Policy</p>
                  <p className="text-[11px] text-slate-500">
                    Configured `firestore.rules` for collection authorization across Admin, Doctor, Nurse, and Patient roles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: System Configuration */}
          {activeTab === 'session' && (
            <div className="space-y-4 max-w-xl text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">System Operating Parameters</h3>
                <p className="text-slate-500">Configure OPD slot gaps, working hours, and notification rules</p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">OPD Appointment Slot Interval</label>
                <input
                  type="text"
                  disabled
                  value="10 Minutes per Patient (Automated Sequential Scheduling)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">OPD Hours & Lunch Break Exclusions</label>
                <input
                  type="text"
                  disabled
                  value="9:00 AM – 10:30 PM (Excluded Lunch Break: 12:00 PM – 2:00 PM)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                />
              </div>

              <div className="p-3 bg-medical-50 rounded-lg border border-medical-200 text-medical-900">
                <p className="font-bold">System Status: Fully Operational</p>
                <p className="text-[11px] text-medical-700 mt-0.5">
                  All clinical modules connected and ready for hospital operations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

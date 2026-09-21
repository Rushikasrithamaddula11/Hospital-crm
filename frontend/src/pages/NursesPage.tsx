import React, { useState, useEffect } from 'react';
import { HeartPulse, Search, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { getNursesList } from '../firebase/firestore';

export const NursesPage: React.FC = () => {
  const [nurses, setNurses] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getNursesList().then(setNurses);
  }, []);

  const filtered = nurses.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.department.toLowerCase().includes(search.toLowerCase()) ||
    n.shift.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nursing Staff Directory</h1>
        <p className="text-xs text-slate-500">Registered nurses, ward managers, and OPD nursing staff</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search nurses by name, department, or shift..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((nurse) => (
          <div key={nurse.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                {nurse.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{nurse.name}</h3>
                <p className="text-xs text-medical-600 font-medium">{nurse.department}</p>
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Qualification: <strong className="text-slate-800">{nurse.qualification}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="w-3.5 h-3.5 text-slate-400" />
                <span>Shift: <strong className="text-slate-800">{nurse.shift}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{nurse.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{nurse.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

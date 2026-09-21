import React, { useState, useEffect } from 'react';
import { Building2, Users, Stethoscope, UserCheck, ChevronRight } from 'lucide-react';
import { getDepartmentsList } from '../firebase/firestore';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    getDepartmentsList().then(setDepartments);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hospital Clinical Departments</h1>
        <p className="text-xs text-slate-500">Specialized clinical centers, bed counts, and department heads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                {dept.status || 'Active'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{dept.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Head of Dept</p>
                <p className="font-bold text-slate-800">{dept.headDoctor}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Beds Capacity</p>
                <p className="font-bold text-slate-800">{dept.bedCapacity} Beds</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Active Doctors</p>
                <p className="font-bold text-medical-600">{dept.doctorCount} Specialists</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Floor / Block</p>
                <p className="font-bold text-slate-800">Block {dept.block || 'A'}, Fl {dept.floor || '2'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Trash2, Phone, Calendar, User } from 'lucide-react';
import { Patient } from '../../types/patient';
import { Badge } from '../common/Badge';

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({ patients, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Patient ID</th>
              <th className="py-3 px-4">Patient Name</th>
              <th className="py-3 px-4">Age / Gender</th>
              <th className="py-3 px-4">Phone Number</th>
              <th className="py-3 px-4">Last Visit</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-medical-50/40 transition-colors group"
              >
                {/* Patient ID */}
                <td className="py-3 px-4 font-mono font-semibold text-medical-700">
                  <button
                    onClick={() => navigate(`/patients/${patient.patient_id}`)}
                    className="hover:underline text-left"
                  >
                    {patient.patient_id}
                  </button>
                </td>

                {/* Patient Name & Avatar */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-medical-100 text-medical-700 border border-medical-200 flex items-center justify-center font-extrabold text-xs shrink-0">
                      {patient.first_name?.[0] || 'P'}{patient.last_name?.[0] || 'T'}
                    </div>
                    <div>
                      <button
                        onClick={() => navigate(`/patients/${patient.patient_id}`)}
                        className="font-semibold text-slate-900 hover:text-medical-600 transition-colors text-xs"
                      >
                        {patient.first_name} {patient.last_name}
                      </button>
                      {patient.address?.email && (
                        <p className="text-[11px] text-slate-400 font-normal">{patient.address.email}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Age / Gender */}
                <td className="py-3 px-4">
                  <span className="font-medium text-slate-900">{patient.age} yrs</span>
                  <span className="text-slate-400 font-normal ml-1">• {patient.gender}</span>
                </td>

                {/* Phone */}
                <td className="py-3 px-4 font-medium text-slate-700">
                  {patient.address?.mobile ? (
                    <span>{patient.address.mobile}</span>
                  ) : (
                    <span className="text-slate-400 italic">No mobile</span>
                  )}
                </td>

                {/* Last Visit */}
                <td className="py-3 px-4 text-slate-600">
                  {patient.last_visit_date || 'New Patient'}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <Badge status={patient.status} />
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/patients/${patient.patient_id}`)}
                      className="p-1.5 text-slate-500 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(patient)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Patient"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(patient)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Archive Patient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden divide-y divide-slate-100">
        {patients.map((patient) => (
          <div key={patient.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-medical-100 text-medical-700 border border-medical-200 flex items-center justify-center font-extrabold text-xs shrink-0">
                  {patient.first_name?.[0] || 'P'}{patient.last_name?.[0] || 'T'}
                </div>
                <div>
                  <button
                    onClick={() => navigate(`/patients/${patient.patient_id}`)}
                    className="font-bold text-slate-900 hover:text-medical-600 text-sm text-left block"
                  >
                    {patient.first_name} {patient.last_name}
                  </button>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-semibold text-medical-700 bg-medical-50 px-1.5 py-0.2 rounded">
                      {patient.patient_id}
                    </span>
                    <span className="text-xs text-slate-500">{patient.age} yrs • {patient.gender}</span>
                  </div>
                </div>
              </div>
              <Badge status={patient.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-50">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{patient.address?.mobile || 'No Phone'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{patient.last_visit_date || 'New Patient'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => navigate(`/patients/${patient.patient_id}`)}
                className="px-3 py-1.5 text-xs font-medium bg-medical-50 text-medical-700 rounded-lg hover:bg-medical-100 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> View Profile
              </button>
              <button
                onClick={() => onEdit(patient)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(patient)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

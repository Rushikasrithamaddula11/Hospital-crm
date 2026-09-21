import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { PatientFilters } from '../../types/patient';
import { Button } from '../common/Button';

interface FilterBarProps {
  filters: PatientFilters;
  onChange: (filters: PatientFilters) => void;
  onClear: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onClear }) => {
  const handleChange = (key: keyof PatientFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Boolean(
    filters.q ||
      (filters.gender && filters.gender !== 'All') ||
      (filters.status && filters.status !== 'All') ||
      filters.age_min ||
      filters.age_max ||
      filters.date_from ||
      filters.date_to
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient ID, Name, Mobile, or Email..."
            value={filters.q || ''}
            onChange={(e) => handleChange('q', e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters Dropdown Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <span className="text-slate-400 font-medium">Gender:</span>
            <select
              value={filters.gender || 'All'}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="bg-transparent border-0 font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={filters.status || 'All'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="bg-transparent border-0 font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Age Min/Max Quick Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <span className="text-slate-400 font-medium">Age:</span>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val === '0-18') onChange({ ...filters, age_min: 0, age_max: 18 });
                else if (val === '19-45') onChange({ ...filters, age_min: 19, age_max: 45 });
                else if (val === '46-60') onChange({ ...filters, age_min: 46, age_max: 60 });
                else if (val === '60+') onChange({ ...filters, age_min: 60, age_max: 130 });
                else onChange({ ...filters, age_min: undefined, age_max: undefined });
              }}
              className="bg-transparent border-0 font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Ages</option>
              <option value="0-18">0 - 18 yrs</option>
              <option value="19-45">19 - 45 yrs</option>
              <option value="46-60">46 - 60 yrs</option>
              <option value="60+">60+ yrs</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-rose-600 hover:bg-rose-50"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

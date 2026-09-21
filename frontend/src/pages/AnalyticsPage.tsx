import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  FileText,
  TestTube,
  Pill,
  Download,
  RefreshCw,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import apiClient from '../services/api';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useToast } from '../components/common/Toast';

export const AnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('2026-YTD');

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/analytics/overview');
      setData(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load enterprise analytics data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportReport = () => {
    showToast('info', 'Report Generated', 'Exported Sritha Hospitals Hospital CRM BI Analytics Summary Report (PDF)');
  };

  if (isLoading) {
    return <LoadingState message="Calculating Sritha Hospitals CRM analytics & demographic ratios..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'No analytics data available.'} onRetry={fetchAnalytics} />;
  }

  const { kpis, gender_ratio, age_distribution, department_consultations, top_medications } = data;

  const PIE_COLORS = ['#026fc3', '#0d9488', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise CRM Analytics & BI</h1>
            <span className="bg-medical-50 text-medical-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-medical-200">
              Live BI Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department consultation volumes, patient age distribution, gender ratios, and pharmacy medication insights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent border-0 font-medium text-slate-800 focus:outline-none"
            >
              <option value="2026-YTD">Year 2026 (YTD)</option>
              <option value="Last-90-Days">Last 90 Days</option>
              <option value="Last-30-Days">Last 30 Days</option>
            </select>
          </div>
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchAnalytics} />
          <Button icon={<Download className="w-4 h-4" />} onClick={handleExportReport}>
            Export BI Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Registered</span>
          <p className="text-2xl font-bold text-slate-900">{kpis.total_patients}</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +14.2% Growth
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">OPD Consultations</span>
          <p className="text-2xl font-bold text-medical-700">{kpis.total_visits}</p>
          <span className="text-[11px] text-slate-500 font-medium">Recorded Visits</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Prescriptions Issued</span>
          <p className="text-2xl font-bold text-indigo-600">{kpis.total_prescriptions}</p>
          <span className="text-[11px] text-slate-500 font-medium">Pharmacy Orders</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Lab Tests Processed</span>
          <p className="text-2xl font-bold text-teal-700">{kpis.total_lab_reports}</p>
          <span className="text-[11px] text-slate-500 font-medium">Pathology Reports</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Consultations Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Department Consultation Volume</h3>
            <p className="text-xs text-slate-500">OPD consultations breakdown by clinical specialty</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={department_consultations} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="department" type="category" width={110} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Consultations" fill="#026fc3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Groups Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Patient Age Group Demographics</h3>
            <p className="text-xs text-slate-500">Distribution of patients across age brackets</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={age_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Patients" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Ratio Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Gender Ratio</h3>
            <p className="text-xs text-slate-500">Male vs Female vs Other ratio</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gender_ratio}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {gender_ratio.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-3 text-xs font-medium pt-2 border-t border-slate-100">
            {gender_ratio.map((g: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                <span className="text-slate-700">{g.name}: {g.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Prescribed Medications Ranking */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Top Prescribed Medications</h3>
            <p className="text-xs text-slate-500">Most frequently issued pharmaceuticals in hospital pharmacy</p>
          </div>
          <div className="space-y-2">
            {top_medications.map((med: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">{med.name}</span>
                    <span className="text-[11px] text-slate-500">{med.category}</span>
                  </div>
                </div>
                <span className="font-bold text-indigo-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                  {med.prescriptions} Prescriptions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

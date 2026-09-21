import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TestTube,
  Plus,
  Search,
  Eye,
  FileCheck2,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { LabReport } from '../types/labReport';
import { getLabReports, createLabReportRecord } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

export const LabReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (role === 'Admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [role, navigate]);

  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // View Modal State
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  // Order Lab Test Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [patientNameInput, setPatientNameInput] = useState('Rahul Kumar');
  const [testNameInput, setTestNameInput] = useState('CBC (Complete Blood Count)');
  const [doctorInput, setDoctorInput] = useState('Dr. Rajesh Sharma');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [statusInput, setStatusInput] = useState<'Completed' | 'Pending' | 'Processing'>('Completed');
  const [summaryInput, setSummaryInput] = useState('Hemoglobin 14.2 g/dL, WBC 7,200 /mcL, Platelets 250,000 /mcL. All values within physiological limits.');
  const [isOrdering, setIsOrdering] = useState(false);

  const fetchLabReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data = await getLabReports();

      // Role-Based Filtering
      if (role === 'Patient') {
        const myPtId = user?.patientId || 'PT-000001';
        data = data.filter(r => r.patientNumber === myPtId);
      }

      setLabReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pathology lab reports.');
    } finally {
      setIsLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    fetchLabReports();
  }, [fetchLabReports]);

  const filteredLabReports = labReports.filter(report => {
    const qLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      report.patientName.toLowerCase().includes(qLower) ||
      report.patientNumber.toLowerCase().includes(qLower) ||
      report.testName.toLowerCase().includes(qLower) ||
      report.doctorName.toLowerCase().includes(qLower)
    );
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdInput.trim()) {
      showToast('error', 'Validation Error', 'Patient ID is required');
      return;
    }

    setIsOrdering(true);
    try {
      const created = await createLabReportRecord({
        patientNumber: patientIdInput.trim(),
        patientName: patientNameInput,
        testName: testNameInput,
        category: 'Pathology',
        doctorName: doctorInput,
        testDate: dateInput,
        status: statusInput,
        resultSummary: summaryInput,
        ocrProcessed: false
      });

      showToast('success', 'Lab Test Ordered', `Added lab report for ${created.patientName} (${created.patientNumber})`);
      setIsOrderModalOpen(false);
      setPatientIdInput('');
      fetchLabReports();
    } catch (err: any) {
      showToast('error', 'Order Failed', err.message);
    } finally {
      setIsOrdering(false);
    }
  };

  const completedCount = filteredLabReports.filter((r) => r.status === 'Completed').length;
  const processingCount = filteredLabReports.filter((r) => r.status === 'Processing' || r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {role === 'Patient' ? 'My Laboratory Reports' : 'Pathology & Laboratory System (LIS)'}
            </h1>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              {filteredLabReports.length} Reports Available
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'Patient'
              ? 'View diagnostic lab results, blood test summaries, and pathology reports.'
              : 'Manage pathology diagnostic tests, blood analysis panels, lab findings, and LIS reporting archives.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchLabReports} />
          {role !== 'Patient' && (
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsOrderModalOpen(true)}>
              + Order Lab Test
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Lab Tests</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{filteredLabReports.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Completed Reports</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">{completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">In Processing</p>
          <p className="text-2xl font-bold text-amber-600 mt-0.5">{processingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Pathology Labs</p>
          <p className="text-2xl font-bold text-teal-700 mt-0.5">Central LIS Active</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name, ID (PT-xxxxxx), Test Name, or Doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-medical-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lab Reports Table */}
      {isLoading ? (
        <LoadingState message="Loading laboratory reports..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLabReports} />
      ) : filteredLabReports.length === 0 ? (
        <EmptyState
          title="No lab reports found"
          description="No pathology lab test records match your search criteria."
          actionLabel={role !== 'Patient' ? '+ Order Lab Test' : undefined}
          onAction={role !== 'Patient' ? () => setIsOrderModalOpen(true) : undefined}
          icon={<TestTube className="w-6 h-6 text-slate-400" />}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Test Name</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Test Date</th>
                  <th className="py-3 px-4">Ordering Doctor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLabReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <TestTube className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{report.testName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/patients/${report.patientNumber}`)}
                        className="font-semibold text-slate-900 hover:text-medical-600 hover:underline block text-left"
                      >
                        {report.patientName}
                      </button>
                      <span className="font-mono text-[11px] font-medium text-medical-700 bg-medical-50 px-1.5 rounded">
                        {report.patientNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{report.testDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">Dr. {report.doctorName}</td>
                    <td className="py-3 px-4">
                      <Badge status={report.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedReport(report)}
                      >
                        View Findings
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Findings Modal */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={`Pathology Report — ${selectedReport.testName}`}
          subtitle={`Patient: ${selectedReport.patientName} (${selectedReport.patientNumber})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p className="font-bold text-slate-900 text-sm">{selectedReport.testName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Ordered by Dr. {selectedReport.doctorName} on {selectedReport.testDate}</p>
              </div>
              <Badge status={selectedReport.status} />
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Laboratory Findings & Results
              </h4>
              <p className="text-slate-800 font-mono leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                {selectedReport.resultSummary || 'Analysis evaluated within physiological reference limits.'}
              </p>
            </div>

            {selectedReport.extractedMetrics && selectedReport.extractedMetrics.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Value</th>
                      <th className="p-2.5">Normal Range</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReport.extractedMetrics.map((m, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium">{m.metricName || m.parameter}</td>
                        <td className="p-2.5 font-bold font-mono">{m.value} {m.unit}</td>
                        <td className="p-2.5 text-slate-500">{m.normalRange || m.referenceRange}</td>
                        <td className="p-2.5 font-semibold text-emerald-600">{m.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
              Note: Signed lab report documents are archived under secure HIPAA/NDHM healthcare compliance storage.
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Close Report
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Order Lab Test Modal */}
      {role !== 'Patient' && (
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          title="Order Pathology Lab Test"
          subtitle="Order diagnostic lab test for a hospital patient"
          maxWidth="md"
        >
          <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Patient ID (PT-xxxxxx) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PT-000001"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Test Name Panel</label>
                <select
                  value={testNameInput}
                  onChange={(e) => setTestNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                >
                  <option value="CBC (Complete Blood Count)">CBC (Complete Blood Count)</option>
                  <option value="Lipid Profile">Lipid Profile</option>
                  <option value="Fast Blood Sugar & HbA1c">Fast Blood Sugar & HbA1c</option>
                  <option value="Thyroid Panel (T3, T4, TSH)">Thyroid Panel (T3, T4, TSH)</option>
                  <option value="Renal Function Test (KFT)">Renal Function Test (KFT)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ordering Doctor</label>
                <select
                  value={doctorInput}
                  onChange={(e) => setDoctorInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                >
                  <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma</option>
                  <option value="Dr. Anil Sharma">Dr. Anil Sharma</option>
                  <option value="Dr. Sneha Kulkarni">Dr. Sneha Kulkarni</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                >
                  <option value="Completed">Completed</option>
                  <option value="Processing">Processing</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Lab Findings Summary</label>
              <textarea
                rows={3}
                placeholder="Enter pathology laboratory analysis findings..."
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isOrdering} icon={<CheckCircle className="w-4 h-4" />}>
                Save Lab Report
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

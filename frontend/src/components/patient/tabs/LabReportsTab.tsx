import React, { useState } from 'react';
import { LabReport } from '../../../types/labReport';
import { Badge } from '../../common/Badge';
import { EmptyState } from '../../common/EmptyState';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { TestTube, Eye, FileCheck2 } from 'lucide-react';

interface LabReportsTabProps {
  labReports: LabReport[];
}

export const LabReportsTab: React.FC<LabReportsTabProps> = ({ labReports }) => {
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  if (labReports.length === 0) {
    return (
      <EmptyState
        title="No laboratory reports available"
        description="No blood test, pathology, or radiology lab reports found for this patient."
        icon={<TestTube className="w-6 h-6 text-slate-400" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Test Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Ordering Doctor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {labReports.map((report) => {
                const tName = report.testName || (report as any).test_name || 'Lab Test';
                const tDate = report.testDate || (report as any).date || 'Recent';
                const docName = report.doctorName || (report as any).doctor_name || 'Dr. Specialist';

                return (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <TestTube className="w-4 h-4 text-medical-600 shrink-0" />
                      <span>{tName}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{tDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{docName}</td>
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
                        View Report
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Report Detail Modal */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={`Lab Test Report — ${selectedReport.testName || (selectedReport as any).test_name}`}
          subtitle={`Ordered by ${selectedReport.doctorName || (selectedReport as any).doctor_name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p className="font-bold text-slate-900 text-sm">{selectedReport.testName || (selectedReport as any).test_name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Date: {selectedReport.testDate || (selectedReport as any).date}</p>
              </div>
              <Badge status={selectedReport.status} />
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Laboratory Summary & Findings
              </h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded border border-slate-100 font-mono text-xs">
                {selectedReport.resultSummary || (selectedReport as any).report_summary || 'Detailed lab analysis summary within physiological boundaries.'}
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
    </div>
  );
};

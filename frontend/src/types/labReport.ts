export interface OCRExtractedMetric {
  metricName?: string;
  parameter?: string;
  value: string;
  unit: string;
  normalRange?: string;
  referenceRange?: string;
  status: 'Normal' | 'High' | 'Low' | 'Elevated';
  confidence?: number;
}

export interface LabReport {
  id?: string;
  patientId?: string;
  patientNumber: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  testName: string;
  category?: string;
  testDate: string;
  resultSummary?: string;
  fileUrl?: string;
  reportFileUrl?: string;
  fileName?: string;
  status: 'Completed' | 'Pending' | 'Processing';
  extractedMetrics?: OCRExtractedMetric[];
  ocrProcessed?: boolean;
  ocrData?: {
    rawText: string;
    metrics: OCRExtractedMetric[];
    isMock?: boolean;
  };
  createdAt: string;
}

import { OCRExtractedMetric } from '../types/labReport';

export interface OCRScanResult {
  fileName: string;
  scanTimestamp: string;
  confidenceScore: number;
  extractedPatientName?: string;
  extractedPatientId?: string;
  extractedDoctorName?: string;
  metrics: OCRExtractedMetric[];
  rawExtractedText: string;
  isMismatched?: boolean;
  documentClassification?: 'Pathology Lab Report' | 'Vitals / BP Record' | 'Medical Prescription' | 'Unrecognized Document';
  validationMessage?: string;
}

/**
 * Extracts text from an uploaded File if it's text-readable (e.g. txt, csv, html)
 * or reads filename keywords for PDF classification.
 */
const readTextFromFileIfPossible = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (!file || !(file instanceof File)) {
      resolve('');
      return;
    }
    // If it's a text-like file, read raw content
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    } else {
      // Return filename for inspection
      resolve(file.name);
    }
  });
};

export const simulateOCRReportExtraction = async (
  fileObj: File | { name: string; type?: string },
  testCategory: string = 'Complete Blood Count (CBC)'
): Promise<OCRScanResult> => {
  await new Promise((res) => setTimeout(res, 200));

  const fileName = fileObj.name || 'uploaded_document.pdf';
  const fileNameLower = fileName.toLowerCase();
  const categoryLower = testCategory.toLowerCase();

  let fileTextContent = '';
  if (fileObj instanceof File) {
    fileTextContent = (await readTextFromFileIfPossible(fileObj)).toLowerCase();
  } else {
    fileTextContent = fileNameLower;
  }

  const combinedContent = `${fileNameLower} ${fileTextContent}`;

  const now = new Date().toISOString();

  // 1. Check if uploaded document is Vitals / Blood Pressure (BP) / Non-Pathology document
  const isVitalsDoc = combinedContent.includes('bp') || 
                      combinedContent.includes('pressure') || 
                      combinedContent.includes('vitals') || 
                      combinedContent.includes('hypertension') ||
                      combinedContent.includes('systolic') ||
                      combinedContent.includes('diastolic') ||
                      combinedContent.includes('pulse');

  const isPrescriptionDoc = combinedContent.includes('prescription') || combinedContent.includes('pharmacy') || combinedContent.includes('rx');
  const isInvoiceDoc = combinedContent.includes('invoice') || combinedContent.includes('bill') || combinedContent.includes('receipt');

  // 2. Check for explicit wrong/invalid file patterns
  const isExplicitWrongFile = fileNameLower.includes('wrong') || 
                              fileNameLower.includes('random') || 
                              fileNameLower.includes('invoice') || 
                              fileNameLower.includes('dummy') ||
                              fileNameLower.includes('vitals') ||
                              fileNameLower.includes('bp');

  // If the user uploaded a Vitals or BP document in the Lab Report OCR Parser
  if (isVitalsDoc || isExplicitWrongFile || isPrescriptionDoc || isInvoiceDoc) {
    let docType: 'Vitals / BP Record' | 'Medical Prescription' | 'Unrecognized Document' = 'Unrecognized Document';
    let valMsg = 'The uploaded PDF does not appear to be a Pathology Laboratory Report.';

    if (isVitalsDoc) {
      docType = 'Vitals / BP Record';
      valMsg = 'Document Warning: Uploaded PDF contains Blood Pressure (BP) / Patient Vitals readings (e.g., 120/80 mmHg). This OCR parser is specifically for Pathology Lab Tests (CBC, Lipid, Thyroid, Glucose).';
    } else if (isPrescriptionDoc) {
      docType = 'Medical Prescription';
      valMsg = 'Document Warning: Uploaded PDF contains Doctor Prescription / Rx Medication orders instead of a Pathology Lab Test panel.';
    } else if (isInvoiceDoc) {
      valMsg = 'Document Warning: Uploaded PDF appears to be a Billing Invoice / Financial Receipt.';
    }

    return {
      fileName,
      scanTimestamp: now,
      confidenceScore: 0.22,
      extractedPatientName: 'Rahul Kumar (Detected)',
      extractedPatientId: 'PT-000001',
      extractedDoctorName: 'Unassigned',
      isMismatched: true,
      documentClassification: docType,
      validationMessage: valMsg,
      metrics: [
        { metricName: 'Systolic Blood Pressure', value: '135', unit: 'mmHg', normalRange: '90 - 120', status: 'High', confidence: 0.40 },
        { metricName: 'Diastolic Blood Pressure', value: '88', unit: 'mmHg', normalRange: '60 - 80', status: 'High', confidence: 0.40 },
        { metricName: 'Heart Rate (Pulse)', value: '78', unit: 'bpm', normalRange: '60 - 100', status: 'Normal', confidence: 0.50 }
      ],
      rawExtractedText: `[DOCUMENT CONTENT MISMATCH DETECTED]\n----------------------------------------\nFILE: ${fileName}\nCLASSIFICATION: ${docType}\nWARNING: ${valMsg}\n\nRAW EXTRACTED TEXT STREAM:\n"PATIENT VITALS MONITORING SHEET - ROOM 302\nBP Reading: 135/88 mmHg (Mildly Elevated)\nPulse Rate: 78 bpm | SpO2: 98% | Temp: 98.6 F\nNOTE: This is a Vitals Log sheet, NOT a Blood/Pathology Lab Report."`
    };
  }

  // 3. Valid Lab Report Extraction based on selected category or content
  let metrics: OCRExtractedMetric[] = [];
  let rawText = '';

  if (categoryLower.includes('blood') || categoryLower.includes('cbc') || combinedContent.includes('cbc')) {
    metrics = [
      { metricName: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRange: '13.5 - 17.5', status: 'Normal', confidence: 0.98 },
      { metricName: 'White Blood Cells (WBC)', value: '11.8', unit: 'x10^3/µL', normalRange: '4.5 - 11.0', status: 'High', confidence: 0.95 },
      { metricName: 'Red Blood Cells (RBC)', value: '4.85', unit: 'x10^6/µL', normalRange: '4.3 - 5.9', status: 'Normal', confidence: 0.99 },
      { metricName: 'Platelet Count', value: '265', unit: 'x10^3/µL', normalRange: '150 - 450', status: 'Normal', confidence: 0.97 },
      { metricName: 'Hematocrit', value: '43.5', unit: '%', normalRange: '41.0 - 50.0', status: 'Normal', confidence: 0.96 }
    ];
    rawText = `METROPOLIS DIAGNOSTICS & LABS\nPATIENT: PT-000001 | RAHUL KUMAR\nTEST: COMPLETE BLOOD COUNT (CBC)\n----------------------------------------\nHemoglobin: 14.2 g/dL (Ref: 13.5 - 17.5) [NORMAL]\nWBC Count: 11.8 x10^3/uL (Ref: 4.5 - 11.0) [ELEVATED]\nRBC Count: 4.85 x10^6/uL (Ref: 4.3 - 5.9) [NORMAL]\nPlatelets: 265 x10^3/uL (Ref: 150 - 450) [NORMAL]\nHematocrit: 43.5 % (Ref: 41.0 - 50.0) [NORMAL]`;
  } else if (categoryLower.includes('lipid') || categoryLower.includes('cholesterol') || combinedContent.includes('lipid')) {
    metrics = [
      { metricName: 'Total Cholesterol', value: '215', unit: 'mg/dL', normalRange: '< 200', status: 'High', confidence: 0.97 },
      { metricName: 'HDL (Good Cholesterol)', value: '48', unit: 'mg/dL', normalRange: '> 40', status: 'Normal', confidence: 0.96 },
      { metricName: 'LDL (Bad Cholesterol)', value: '138', unit: 'mg/dL', normalRange: '< 100', status: 'High', confidence: 0.94 },
      { metricName: 'Triglycerides', value: '175', unit: 'mg/dL', normalRange: '< 150', status: 'High', confidence: 0.98 }
    ];
    rawText = `MENTNEO CENTRAL PATHOLOGY\nPATIENT: PT-000001 | RAHUL KUMAR\nTEST: LIPID PROFILE (FASTING)\n----------------------------------------\nTotal Cholesterol: 215 mg/dL (Ref: < 200) [HIGH]\nHDL Cholesterol: 48 mg/dL (Ref: > 40) [NORMAL]\nLDL Cholesterol: 138 mg/dL (Ref: < 100) [HIGH]\nTriglycerides: 175 mg/dL (Ref: < 150) [HIGH]`;
  } else if (categoryLower.includes('thyroid') || categoryLower.includes('tsh') || combinedContent.includes('thyroid')) {
    metrics = [
      { metricName: 'TSH (Thyroid Stimulating Hormone)', value: '2.45', unit: 'mIU/L', normalRange: '0.4 - 4.2', status: 'Normal', confidence: 0.99 },
      { metricName: 'Free T3', value: '3.1', unit: 'pg/mL', normalRange: '2.0 - 4.4', status: 'Normal', confidence: 0.95 },
      { metricName: 'Free T4', value: '1.25', unit: 'ng/dL', normalRange: '0.8 - 1.8', status: 'Normal', confidence: 0.96 }
    ];
    rawText = `DIAGNOSTIC LAB RESULT SUMMARY\nTEST: THYROID FUNCTION PANEL\n----------------------------------------\nTSH: 2.45 mIU/L (Ref: 0.4 - 4.2) [NORMAL]\nFree T3: 3.1 pg/mL (Ref: 2.0 - 4.4) [NORMAL]\nFree T4: 1.25 ng/dL (Ref: 0.8 - 1.8) [NORMAL]`;
  } else {
    metrics = [
      { metricName: 'Fasting Blood Glucose', value: '104', unit: 'mg/dL', normalRange: '70 - 99', status: 'High', confidence: 0.96 },
      { metricName: 'HbA1c', value: '5.8', unit: '%', normalRange: '< 5.7', status: 'High', confidence: 0.98 },
      { metricName: 'Serum Creatinine', value: '0.95', unit: 'mg/dL', normalRange: '0.74 - 1.35', status: 'Normal', confidence: 0.97 },
      { metricName: 'Blood Urea Nitrogen (BUN)', value: '16.2', unit: 'mg/dL', normalRange: '7 - 20', status: 'Normal', confidence: 0.94 }
    ];
    rawText = `GENERAL METABOLIC PANEL\n----------------------------------------\nFasting Glucose: 104 mg/dL (Ref: 70 - 99) [ELEVATED]\nHbA1c: 5.8 % (Ref: < 5.7) [PREDIABETIC ELEVATED]\nSerum Creatinine: 0.95 mg/dL (Ref: 0.74 - 1.35) [NORMAL]\nBUN: 16.2 mg/dL (Ref: 7 - 20) [NORMAL]`;
  }

  return {
    fileName,
    scanTimestamp: now,
    confidenceScore: 0.96,
    extractedPatientName: 'Rahul Kumar',
    extractedPatientId: 'PT-000001',
    extractedDoctorName: 'Dr. Rajesh Sharma',
    isMismatched: false,
    documentClassification: 'Pathology Lab Report',
    metrics,
    rawExtractedText: rawText
  };
};

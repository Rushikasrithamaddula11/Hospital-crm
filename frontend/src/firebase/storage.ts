import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export const uploadLabReportFile = async (
  file: File,
  patientNumber: string
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `labReports/${patientNumber}/${timestamp}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.warn("Firebase Storage upload fallback to Data URL for local demo:", error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
};

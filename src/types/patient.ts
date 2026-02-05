// Patient type definitions for NABH Patient Management Module

export type PatientStatus = 'Active' | 'Discharged' | 'Transferred';

export interface Patient {
  id?: string;
  srNo?: number;
  visitId: string;
  patientName: string;
  diagnosis?: string;
  admissionDate?: string;
  dischargeDate?: string;
  status?: PatientStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Type for Excel import - allows any column names from Excel
export interface PatientImportRow {
  [key: string]: string | number | Date | undefined;
}

// Type for the database record
export interface PatientRecord {
  id: string;
  sr_no: number | null;
  visit_id: string;
  patient_name: string;
  diagnosis: string | null;
  admission_date: string | null;
  discharge_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

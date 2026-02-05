// Patient Storage Service for Supabase
// Handles CRUD operations for patient records

import type { Patient, PatientRecord } from '../types/patient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Convert database record to Patient type
 */
function recordToPatient(record: PatientRecord): Patient {
  return {
    id: record.id,
    srNo: record.sr_no ?? undefined,
    visitId: record.visit_id,
    patientName: record.patient_name,
    diagnosis: record.diagnosis ?? undefined,
    admissionDate: record.admission_date ?? undefined,
    dischargeDate: record.discharge_date ?? undefined,
    status: (record.status as Patient['status']) ?? 'Active',
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

/**
 * Validate and sanitize date for database (must be valid ISO format YYYY-MM-DD)
 */
function sanitizeDate(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;
  // Must match YYYY-MM-DD with valid numeric values
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    console.warn('Invalid date format rejected:', dateStr);
    return null;
  }
  const [, year, month, day] = match;
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
    console.warn('Invalid date values rejected:', dateStr);
    return null;
  }
  return dateStr;
}

/**
 * Convert Patient type to database record format
 */
function patientToRecord(patient: Patient): Partial<PatientRecord> {
  return {
    sr_no: patient.srNo ?? null,
    visit_id: patient.visitId,
    patient_name: patient.patientName,
    diagnosis: patient.diagnosis ?? null,
    admission_date: sanitizeDate(patient.admissionDate),
    discharge_date: sanitizeDate(patient.dischargeDate),
    status: patient.status ?? 'Active',
  };
}

/**
 * Load all patients from database
 */
export async function loadAllPatients(): Promise<{
  success: boolean;
  data?: Patient[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_patients?order=sr_no.asc.nullslast,created_at.desc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading patients:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const patients = (data as PatientRecord[]).map(recordToPatient);
    return { success: true, data: patients };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading patients:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load a single patient by ID
 */
export async function loadPatientById(id: string): Promise<{
  success: boolean;
  data?: Patient;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_patients?id=eq.${id}&limit=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading patient:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return { success: false, error: 'Patient not found' };
    }

    return { success: true, data: recordToPatient(data[0]) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading patient:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Save a patient (insert or update)
 */
export async function savePatient(patient: Patient): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    const record = patientToRecord(patient);

    if (patient.id) {
      // Update existing patient
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/nabh_patients?id=eq.${patient.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ ...record, updated_at: new Date().toISOString() }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating patient:', response.status, errorText);
        return { success: false, error: `${response.status}: ${errorText}` };
      }

      return { success: true, id: patient.id };
    } else {
      // Insert new patient
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/nabh_patients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(record),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error creating patient:', response.status, errorText);
        return { success: false, error: `${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { success: true, id: data[0]?.id };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving patient:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a patient by ID
 */
export async function deletePatient(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_patients?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting patient:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting patient:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Bulk import patients from Excel data
 */
export async function bulkImportPatients(patients: Patient[]): Promise<{
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}> {
  const errors: string[] = [];
  let imported = 0;
  let failed = 0;

  // Convert all patients to records
  const records = patients.map(patientToRecord);

  // Use batch insert with upsert on visit_id
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/nabh_patients?on_conflict=visit_id`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify(batch),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Batch insert error:', response.status, errorText);
        errors.push(`Batch ${i / batchSize + 1}: ${errorText}`);
        failed += batch.length;
      } else {
        imported += batch.length;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Batch ${i / batchSize + 1}: ${errorMessage}`);
      failed += batch.length;
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Search patients by name or visit ID
 */
export async function searchPatients(query: string): Promise<{
  success: boolean;
  data?: Patient[];
  error?: string;
}> {
  try {
    // Search in patient_name or visit_id using ilike
    const encodedQuery = encodeURIComponent(`%${query}%`);
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_patients?or=(patient_name.ilike.${encodedQuery},visit_id.ilike.${encodedQuery},diagnosis.ilike.${encodedQuery})&order=sr_no.asc.nullslast,created_at.desc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error searching patients:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const patients = (data as PatientRecord[]).map(recordToPatient);
    return { success: true, data: patients };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error searching patients:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get patients by status
 */
export async function getPatientsByStatus(status: string): Promise<{
  success: boolean;
  data?: Patient[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_patients?status=eq.${status}&order=sr_no.asc.nullslast,created_at.desc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error getting patients by status:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const patients = (data as PatientRecord[]).map(recordToPatient);
    return { success: true, data: patients };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting patients by status:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get patient count
 */
export async function getPatientCount(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_patients?select=id`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error getting patient count:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const count = parseInt(response.headers.get('content-range')?.split('/')[1] || '0', 10);
    return { success: true, count };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting patient count:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete all patients (for reimport)
 */
export async function deleteAllPatients(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_patients?id=neq.00000000-0000-0000-0000-000000000000`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting all patients:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting all patients:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

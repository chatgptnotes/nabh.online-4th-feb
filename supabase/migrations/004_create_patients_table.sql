-- Create patients table for NABH Patient Management
-- Run this SQL in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS nabh_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sr_no INTEGER,
  visit_id VARCHAR(50) UNIQUE NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  diagnosis VARCHAR(500),
  admission_date DATE,
  discharge_date DATE,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE nabh_patients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations" ON nabh_patients FOR ALL USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_nabh_patients_visit_id ON nabh_patients(visit_id);
CREATE INDEX IF NOT EXISTS idx_nabh_patients_status ON nabh_patients(status);
CREATE INDEX IF NOT EXISTS idx_nabh_patients_patient_name ON nabh_patients(patient_name);
CREATE INDEX IF NOT EXISTS idx_nabh_patients_admission_date ON nabh_patients(admission_date);

-- Add comments for documentation
COMMENT ON TABLE nabh_patients IS 'Patient records for NABH compliance tracking';
COMMENT ON COLUMN nabh_patients.sr_no IS 'Serial number from import';
COMMENT ON COLUMN nabh_patients.visit_id IS 'Unique visit/registration ID';
COMMENT ON COLUMN nabh_patients.patient_name IS 'Full name of the patient';
COMMENT ON COLUMN nabh_patients.diagnosis IS 'Diagnosis or reason for visit';
COMMENT ON COLUMN nabh_patients.admission_date IS 'Date of admission';
COMMENT ON COLUMN nabh_patients.discharge_date IS 'Date of discharge (null if still admitted)';
COMMENT ON COLUMN nabh_patients.status IS 'Current status: Active, Discharged, or Transferred';

-- Migration: Add missing fields to nabh_ai_generated_evidence table
-- Date: 2025-02-01
-- Description: Add objective_code, evidence_title, html_content, hospital_config, and is_auditor_ready fields

-- Add new columns to nabh_ai_generated_evidence table
ALTER TABLE nabh_ai_generated_evidence
  ADD COLUMN IF NOT EXISTS objective_code TEXT,
  ADD COLUMN IF NOT EXISTS evidence_title TEXT,
  ADD COLUMN IF NOT EXISTS html_content TEXT,
  ADD COLUMN IF NOT EXISTS hospital_config JSONB,
  ADD COLUMN IF NOT EXISTS is_auditor_ready BOOLEAN DEFAULT FALSE;

-- Update evidence_type to allow more types
ALTER TABLE nabh_ai_generated_evidence
  DROP CONSTRAINT IF EXISTS nabh_ai_generated_evidence_evidence_type_check;

ALTER TABLE nabh_ai_generated_evidence
  ADD CONSTRAINT nabh_ai_generated_evidence_evidence_type_check
  CHECK (evidence_type IN ('document', 'visual', 'custom', 'register'));

-- Create index on objective_code for faster queries
CREATE INDEX IF NOT EXISTS idx_nabh_ai_generated_evidence_objective_code
  ON nabh_ai_generated_evidence(objective_code);

-- Add comment to document the new fields
COMMENT ON COLUMN nabh_ai_generated_evidence.objective_code IS 'NABH objective code (e.g., ACC.1.1)';
COMMENT ON COLUMN nabh_ai_generated_evidence.evidence_title IS 'Title/name of the generated evidence document';
COMMENT ON COLUMN nabh_ai_generated_evidence.html_content IS 'Full HTML content of the generated evidence';
COMMENT ON COLUMN nabh_ai_generated_evidence.hospital_config IS 'Hospital configuration (name, address, contact details, etc.)';
COMMENT ON COLUMN nabh_ai_generated_evidence.is_auditor_ready IS 'Flag indicating if evidence is ready for auditor review';

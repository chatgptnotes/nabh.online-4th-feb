-- Update the evidence_type constraint to allow 'custom' and 'register' types
-- This enables storing custom prompt-based evidence and NABH registers

-- Drop the existing constraint
ALTER TABLE nabh_ai_generated_evidence DROP CONSTRAINT IF EXISTS nabh_ai_generated_evidence_evidence_type_check;

-- Add new constraint with all evidence types
ALTER TABLE nabh_ai_generated_evidence ADD CONSTRAINT nabh_ai_generated_evidence_evidence_type_check
  CHECK (evidence_type IN ('document', 'visual', 'custom', 'register'));

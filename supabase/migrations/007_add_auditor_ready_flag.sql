-- Add is_auditor_ready flag to mark evidences as ready for auditors
-- This allows quality coordinators to select which evidences should be shown to auditors

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'nabh_ai_generated_evidence' AND column_name = 'is_auditor_ready') THEN
        ALTER TABLE nabh_ai_generated_evidence ADD COLUMN is_auditor_ready BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create index for quick filtering of auditor-ready evidences
CREATE INDEX IF NOT EXISTS idx_ai_evidence_auditor_ready ON nabh_ai_generated_evidence(is_auditor_ready);

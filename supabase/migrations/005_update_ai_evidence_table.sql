-- Add objective_code column to nabh_ai_generated_evidence for linking to objectives
-- This allows generated evidence to be associated with specific NABH objective elements

-- Add objective_code column (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'nabh_ai_generated_evidence' AND column_name = 'objective_code') THEN
        ALTER TABLE nabh_ai_generated_evidence ADD COLUMN objective_code TEXT;
    END IF;
END $$;

-- Add evidence_title column for display purposes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'nabh_ai_generated_evidence' AND column_name = 'evidence_title') THEN
        ALTER TABLE nabh_ai_generated_evidence ADD COLUMN evidence_title TEXT;
    END IF;
END $$;

-- Add html_content column for storing the full HTML document
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'nabh_ai_generated_evidence' AND column_name = 'html_content') THEN
        ALTER TABLE nabh_ai_generated_evidence ADD COLUMN html_content TEXT;
    END IF;
END $$;

-- Add hospital_config column for storing hospital branding info used
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'nabh_ai_generated_evidence' AND column_name = 'hospital_config') THEN
        ALTER TABLE nabh_ai_generated_evidence ADD COLUMN hospital_config JSONB;
    END IF;
END $$;

-- Create index on objective_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_evidence_objective_code ON nabh_ai_generated_evidence(objective_code);

-- RLS policy for public read access is already set in migration 001

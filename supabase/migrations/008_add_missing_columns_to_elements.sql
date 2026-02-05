-- Migration: Add missing columns to nabh_objective_elements table
-- These columns are needed for storing training materials, SOPs, and user interpretations

-- Add missing columns to nabh_objective_elements
ALTER TABLE nabh_objective_elements
ADD COLUMN IF NOT EXISTS training_materials JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sop_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS interpretations2 TEXT;

-- Add comments for documentation
COMMENT ON COLUMN nabh_objective_elements.training_materials IS 'Array of training material documents and links';
COMMENT ON COLUMN nabh_objective_elements.sop_documents IS 'Array of Standard Operating Procedure documents';
COMMENT ON COLUMN nabh_objective_elements.interpretations2 IS 'User-edited interpretation of the objective element';

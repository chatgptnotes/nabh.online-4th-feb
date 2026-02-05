-- Add auditor_priority_items column to nabh_objective_edits table
-- This column stores an array of evidence item IDs marked as priority for auditors

ALTER TABLE nabh_objective_edits
ADD COLUMN IF NOT EXISTS auditor_priority_items JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN nabh_objective_edits.auditor_priority_items IS 'Array of evidence item IDs marked as priority for auditors by the quality coordinator';

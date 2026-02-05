-- Fix the status check constraint to allow 'draft'
ALTER TABLE nabh_sop_documents DROP CONSTRAINT IF EXISTS nabh_sop_documents_status_check;

ALTER TABLE nabh_sop_documents ADD CONSTRAINT nabh_sop_documents_status_check 
CHECK (status IN ('draft', 'published', 'archived', 'pending_review', 'active', 'inactive'));

-- Ensure columns exist for documentation storage
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nabh_sop_documents' AND column_name='extracted_content') THEN
        ALTER TABLE nabh_sop_documents ADD COLUMN extracted_content TEXT;
    END IF;
END $$;

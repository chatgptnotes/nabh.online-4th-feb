-- Create table to store generated document evidence (one per objective)
CREATE TABLE IF NOT EXISTS nabh_document_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_code TEXT NOT NULL UNIQUE,  -- e.g., "AAC.1.1"
  html_content TEXT NOT NULL,
  title TEXT,
  hospital_id TEXT,  -- "hope" or "ayushman"
  source_filename TEXT,  -- tracks which uploaded file generated this evidence
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add source_filename column if table already exists (for existing deployments)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nabh_document_evidence' AND column_name = 'source_filename'
  ) THEN
    ALTER TABLE nabh_document_evidence ADD COLUMN source_filename TEXT;
  END IF;
END $$;

-- Create index for faster lookups by objective_code
CREATE INDEX IF NOT EXISTS idx_nabh_document_evidence_objective_code
  ON nabh_document_evidence(objective_code);

-- Enable RLS
ALTER TABLE nabh_document_evidence ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for anonymous users (same pattern as other tables)
CREATE POLICY "Allow all operations for anon users" ON nabh_document_evidence
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create nabh_sop_documents table for storing SOPs
-- This table stores Standard Operating Procedures linked to NABH chapters

CREATE TABLE IF NOT EXISTS nabh_sop_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_code TEXT NOT NULL,
  chapter_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  google_drive_url TEXT,
  google_drive_file_id TEXT,
  extracted_content TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  effective_date DATE,
  review_date DATE,
  category TEXT,
  department TEXT,
  author TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Under Review', 'Archived')),
  tags TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sop_chapter_code ON nabh_sop_documents(chapter_code);
CREATE INDEX IF NOT EXISTS idx_sop_status ON nabh_sop_documents(status);
CREATE INDEX IF NOT EXISTS idx_sop_is_public ON nabh_sop_documents(is_public);
CREATE INDEX IF NOT EXISTS idx_sop_created_at ON nabh_sop_documents(created_at DESC);

-- Create full-text search index on title, description, and content
CREATE INDEX IF NOT EXISTS idx_sop_search ON nabh_sop_documents
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(extracted_content, '')));

-- Enable Row Level Security
ALTER TABLE nabh_sop_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Public SOPs can be read by anyone
CREATE POLICY "Public SOPs are readable by all" ON nabh_sop_documents
  FOR SELECT
  USING (is_public = true);

-- Policy: All authenticated users can read all SOPs
CREATE POLICY "Authenticated users can read all SOPs" ON nabh_sop_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert SOPs
CREATE POLICY "Authenticated users can insert SOPs" ON nabh_sop_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update SOPs
CREATE POLICY "Authenticated users can update SOPs" ON nabh_sop_documents
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Authenticated users can delete SOPs
CREATE POLICY "Authenticated users can delete SOPs" ON nabh_sop_documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sop_updated_at
  BEFORE UPDATE ON nabh_sop_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE nabh_sop_documents IS 'Standard Operating Procedures linked to NABH chapters with full-text search capability';

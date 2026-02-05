-- Create nabh_chapter_data table for storing generated SOP content
-- This table stores documentation (PDF extracted content), interpretation, and final SOPs
-- linked to nabh_chapters by chapter_id

CREATE TABLE IF NOT EXISTS nabh_chapter_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES nabh_chapters(id) ON DELETE CASCADE,
  objective_code TEXT,
  data_type TEXT NOT NULL CHECK (data_type IN ('documentation', 'interpretation', 'final_sop')),
  content TEXT NOT NULL,
  title TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_nabh_chapter_data_chapter_id ON nabh_chapter_data(chapter_id);
CREATE INDEX IF NOT EXISTS idx_nabh_chapter_data_data_type ON nabh_chapter_data(data_type);
CREATE INDEX IF NOT EXISTS idx_nabh_chapter_data_objective_code ON nabh_chapter_data(objective_code);

-- Enable RLS (Row Level Security)
ALTER TABLE nabh_chapter_data ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust based on your auth requirements)
CREATE POLICY "Allow all access to nabh_chapter_data" ON nabh_chapter_data
  FOR ALL USING (true) WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_nabh_chapter_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nabh_chapter_data_updated_at
  BEFORE UPDATE ON nabh_chapter_data
  FOR EACH ROW
  EXECUTE FUNCTION update_nabh_chapter_data_updated_at();

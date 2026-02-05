-- Migration: Create Presentations and Slides Tables
-- Purpose: Migrate presentations from localStorage to Supabase database
-- Date: 2026-02-03

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create presentations table
CREATE TABLE IF NOT EXISTS nabh_presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'ready', 'presented')) DEFAULT 'draft',
  hospital_id TEXT DEFAULT 'hope',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  presented_at TIMESTAMPTZ
);

-- Create slides table
CREATE TABLE IF NOT EXISTS nabh_presentation_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID NOT NULL REFERENCES nabh_presentations(id) ON DELETE CASCADE,
  slide_order INTEGER NOT NULL,
  slide_type TEXT CHECK (slide_type IN ('title', 'content', 'summary')) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_slide_order UNIQUE(presentation_id, slide_order)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_presentation_slides_presentation_id
  ON nabh_presentation_slides(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentations_hospital_id
  ON nabh_presentations(hospital_id);
CREATE INDEX IF NOT EXISTS idx_presentations_status
  ON nabh_presentations(status);
CREATE INDEX IF NOT EXISTS idx_presentations_updated_at
  ON nabh_presentations(updated_at DESC);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_presentations_updated_at ON nabh_presentations;
CREATE TRIGGER update_presentations_updated_at
  BEFORE UPDATE ON nabh_presentations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_presentation_slides_updated_at ON nabh_presentation_slides;
CREATE TRIGGER update_presentation_slides_updated_at
  BEFORE UPDATE ON nabh_presentation_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE nabh_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabh_presentation_slides ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all access to presentations" ON nabh_presentations;
DROP POLICY IF EXISTS "Allow all access to slides" ON nabh_presentation_slides;

-- Create RLS policies - Allow all operations for now (can be restricted later)
CREATE POLICY "Allow all access to presentations"
  ON nabh_presentations FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to slides"
  ON nabh_presentation_slides FOR ALL
  USING (true) WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE nabh_presentations IS 'Stores NABH assessment presentations for hospitals';
COMMENT ON TABLE nabh_presentation_slides IS 'Stores individual slides for NABH presentations in order';
COMMENT ON COLUMN nabh_presentations.status IS 'Presentation status: draft, ready, or presented';
COMMENT ON COLUMN nabh_presentation_slides.slide_order IS 'Order of slide in presentation (0-based index)';
COMMENT ON COLUMN nabh_presentation_slides.slide_type IS 'Type of slide: title, content, or summary';

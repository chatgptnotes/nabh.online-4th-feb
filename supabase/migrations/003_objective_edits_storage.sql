-- Migration: Create table for storing user edits to objective elements
-- This ensures interpretations and other edits persist in the database

-- Create table for storing objective edits
CREATE TABLE IF NOT EXISTS nabh_objective_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objective_code TEXT NOT NULL UNIQUE,  -- e.g., "COP.1.a", "AAC.1.b"
    chapter_id TEXT NOT NULL,             -- e.g., "cop", "aac"

    -- Editable content fields
    title TEXT,
    description TEXT,                     -- This is the "interpretation"
    hindi_explanation TEXT,
    evidences_list TEXT,
    evidence_links TEXT,

    -- Status and assignment
    status TEXT,
    priority TEXT,
    assignee TEXT,
    start_date TEXT,
    end_date TEXT,
    deliverable TEXT,
    notes TEXT,

    -- Infographic data
    infographic_svg TEXT,
    infographic_data_url TEXT,

    -- Arrays stored as JSONB
    evidence_files JSONB DEFAULT '[]'::jsonb,
    youtube_videos JSONB DEFAULT '[]'::jsonb,
    training_materials JSONB DEFAULT '[]'::jsonb,
    sop_documents JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_objective_edits_code ON nabh_objective_edits(objective_code);
CREATE INDEX IF NOT EXISTS idx_objective_edits_chapter ON nabh_objective_edits(chapter_id);

-- Enable RLS
ALTER TABLE nabh_objective_edits ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to objective edits" ON nabh_objective_edits
    FOR SELECT USING (true);

-- Allow all operations (for now, since no auth)
CREATE POLICY "Allow all operations on objective edits" ON nabh_objective_edits
    FOR ALL USING (true) WITH CHECK (true);

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_nabh_objective_edits_updated_at ON nabh_objective_edits;
CREATE TRIGGER update_nabh_objective_edits_updated_at
    BEFORE UPDATE ON nabh_objective_edits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE nabh_objective_edits IS 'Stores user edits to NABH objective elements for persistence';
COMMENT ON COLUMN nabh_objective_edits.objective_code IS 'Unique code like COP.1.a, AAC.2.b';
COMMENT ON COLUMN nabh_objective_edits.description IS 'The interpretation text edited by user';

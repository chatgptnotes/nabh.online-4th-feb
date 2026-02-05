-- Create a table to store documentation and SOPs linked to chapter IDs
CREATE TABLE IF NOT EXISTS nabh_chapter_data (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES public.nabh_chapters(id) ON DELETE CASCADE,
    objective_code TEXT,                  -- e.g., 'AAC.1'
    data_type TEXT NOT NULL,              -- 'documentation', 'interpretation', OR 'final_sop'
    content TEXT NOT NULL,                -- The text/HTML content
    title TEXT,                           -- Optional title for the entry
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,                      -- User email/ID

    CONSTRAINT nabh_chapter_data_type_check CHECK (data_type IN ('documentation', 'interpretation', 'final_sop'))
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nabh_chapter_data_chapter_id ON nabh_chapter_data(chapter_id);

-- Trigger for updated_at
CREATE TRIGGER update_nabh_chapter_data_modtime
    BEFORE UPDATE ON nabh_chapter_data
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE nabh_chapter_data ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage data
CREATE POLICY "Allow authenticated access" ON nabh_chapter_data
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

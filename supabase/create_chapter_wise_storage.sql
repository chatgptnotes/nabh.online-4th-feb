-- 1. Create a clean new table for Chapter-wise Documentation & SOPs
CREATE TABLE IF NOT EXISTS nabh_chapter_storage (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    chapter_code TEXT NOT NULL,           -- e.g., 'AAC', 'COP'
    chapter_name TEXT NOT NULL,           -- Full name
    objective_code TEXT,                  -- e.g., 'AAC.1'
    data_type TEXT NOT NULL,              -- 'documentation' OR 'final_sop'
    content TEXT NOT NULL,                -- The actual text/HTML
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT                       -- Email or User ID
);

-- 2. Add an index for fast searching by chapter
CREATE INDEX IF NOT EXISTS idx_nabh_chapter_code ON nabh_chapter_storage(chapter_code);

-- 3. Enable RLS (Row Level Security) so data is protected
ALTER TABLE nabh_chapter_storage ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow all actions for authenticated users (Adjust if needed)
CREATE POLICY "Allow all for authenticated users" 
ON nabh_chapter_storage FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nabh_chapter_storage_modtime
    BEFORE UPDATE ON nabh_chapter_storage
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

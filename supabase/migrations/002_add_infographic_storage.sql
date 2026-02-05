-- Migration: Add infographic storage columns to nabh_objective_elements
-- This allows storing bilingual infographics (English + Hindi) for each objective element

-- Add infographic columns to nabh_objective_elements
ALTER TABLE nabh_objective_elements
ADD COLUMN IF NOT EXISTS infographic_svg TEXT,
ADD COLUMN IF NOT EXISTS infographic_data_url TEXT,
ADD COLUMN IF NOT EXISTS infographic_created_at TIMESTAMPTZ;

-- Create infographics storage table for versioning and history
CREATE TABLE IF NOT EXISTS nabh_infographics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    element_id UUID NOT NULL REFERENCES nabh_objective_elements(id) ON DELETE CASCADE,
    svg_content TEXT NOT NULL,
    data_url TEXT,
    language TEXT DEFAULT 'bilingual' CHECK (language IN ('english', 'hindi', 'bilingual')),
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_infographics_element ON nabh_infographics(element_id);
CREATE INDEX IF NOT EXISTS idx_infographics_current ON nabh_infographics(element_id, is_current) WHERE is_current = TRUE;

-- Enable RLS
ALTER TABLE nabh_infographics ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access to infographics" ON nabh_infographics
    FOR SELECT USING (true);

-- Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated" ON nabh_infographics
    FOR ALL USING (true) WITH CHECK (true);

-- Comment on columns
COMMENT ON COLUMN nabh_objective_elements.infographic_svg IS 'SVG content for the bilingual infographic';
COMMENT ON COLUMN nabh_objective_elements.infographic_data_url IS 'Base64 data URL for quick rendering';
COMMENT ON TABLE nabh_infographics IS 'Stores infographic versions and history for objective elements';

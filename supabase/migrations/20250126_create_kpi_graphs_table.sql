-- Create table for storing KPI graphs and their history
-- NABH Evidence Creator - KPI Graph Storage

CREATE TABLE IF NOT EXISTS nabh_kpi_graphs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id VARCHAR(50) NOT NULL,
    kpi_number INTEGER NOT NULL,
    kpi_name TEXT NOT NULL,
    graph_url TEXT NOT NULL,
    graph_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    prompt_used TEXT,
    ai_modifications TEXT,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_kpi_graphs_kpi_id ON nabh_kpi_graphs(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_graphs_is_current ON nabh_kpi_graphs(is_current);
CREATE INDEX IF NOT EXISTS idx_kpi_graphs_created_at ON nabh_kpi_graphs(created_at DESC);

-- Enable RLS
ALTER TABLE nabh_kpi_graphs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access to KPI graphs"
    ON nabh_kpi_graphs FOR SELECT
    TO public
    USING (true);

-- Policy: Allow public insert access
CREATE POLICY "Allow public insert access to KPI graphs"
    ON nabh_kpi_graphs FOR INSERT
    TO public
    WITH CHECK (true);

-- Policy: Allow public update access
CREATE POLICY "Allow public update access to KPI graphs"
    ON nabh_kpi_graphs FOR UPDATE
    TO public
    USING (true);

-- Policy: Allow public delete access
CREATE POLICY "Allow public delete access to KPI graphs"
    ON nabh_kpi_graphs FOR DELETE
    TO public
    USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kpi_graphs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_kpi_graphs_updated_at
    BEFORE UPDATE ON nabh_kpi_graphs
    FOR EACH ROW
    EXECUTE FUNCTION update_kpi_graphs_updated_at();

-- Comment on table
COMMENT ON TABLE nabh_kpi_graphs IS 'Stores KPI graph images and their data history for NABH evidence creator';
COMMENT ON COLUMN nabh_kpi_graphs.kpi_id IS 'Unique identifier for the KPI (e.g., kpi-1, kpi-2)';
COMMENT ON COLUMN nabh_kpi_graphs.graph_url IS 'Public URL to the stored graph image in Supabase Storage';
COMMENT ON COLUMN nabh_kpi_graphs.graph_data IS 'JSON array of data points used to generate the graph';
COMMENT ON COLUMN nabh_kpi_graphs.prompt_used IS 'AI prompt used to modify the graph data, if any';
COMMENT ON COLUMN nabh_kpi_graphs.is_current IS 'Whether this is the current/active version of the graph';

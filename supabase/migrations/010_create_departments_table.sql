-- Create nabh_departments table for managing hospital departments
CREATE TABLE IF NOT EXISTS nabh_departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nabh_departments_name ON nabh_departments(name);
CREATE INDEX IF NOT EXISTS idx_nabh_departments_is_active ON nabh_departments(is_active);

-- Enable Row Level Security
ALTER TABLE nabh_departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (matching existing tables)
CREATE POLICY "Allow public read access on nabh_departments"
    ON nabh_departments FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on nabh_departments"
    ON nabh_departments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on nabh_departments"
    ON nabh_departments FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete on nabh_departments"
    ON nabh_departments FOR DELETE
    USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_nabh_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_nabh_departments_updated_at
    BEFORE UPDATE ON nabh_departments
    FOR EACH ROW
    EXECUTE FUNCTION update_nabh_departments_updated_at();

-- Insert some default departments
INSERT INTO nabh_departments (name, description) VALUES
    ('Operations', 'Hospital operations and administration'),
    ('Nursing', 'Nursing department'),
    ('Laboratory', 'Pathology and laboratory services'),
    ('Radiology', 'Imaging and radiology services'),
    ('Pharmacy', 'Pharmacy and medication management'),
    ('Emergency', 'Emergency and trauma care'),
    ('OT', 'Operation theatre'),
    ('ICU', 'Intensive care unit'),
    ('OPD', 'Outpatient department'),
    ('IPD', 'Inpatient department'),
    ('Quality', 'Quality assurance and NABH compliance'),
    ('HR', 'Human resources'),
    ('Finance', 'Finance and accounts'),
    ('IT', 'Information technology'),
    ('Housekeeping', 'Housekeeping and sanitation'),
    ('Security', 'Security services'),
    ('Maintenance', 'Biomedical and facility maintenance'),
    ('CSSD', 'Central sterile supply department'),
    ('Dietary', 'Dietary and nutrition services'),
    ('Medical Records', 'Medical records department')
ON CONFLICT (name) DO NOTHING;

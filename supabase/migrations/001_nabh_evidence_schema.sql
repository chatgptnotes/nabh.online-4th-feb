-- NABH Evidence Creator Database Schema
-- Dr. Murali's Hope Hospital - NABH SHCO 3rd Edition

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- NABH Chapters Table
-- ============================================
CREATE TABLE IF NOT EXISTS nabh_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NABH Standards Table
-- ============================================
CREATE TABLE IF NOT EXISTS nabh_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES nabh_chapters(id) ON DELETE CASCADE,
    standard_number TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chapter_id, standard_number)
);

-- ============================================
-- NABH Objective Elements Table
-- ============================================
CREATE TABLE IF NOT EXISTS nabh_objective_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_id UUID NOT NULL REFERENCES nabh_standards(id) ON DELETE CASCADE,
    element_number TEXT NOT NULL,
    description TEXT NOT NULL,
    hindi_explanation TEXT,
    interpretation TEXT,
    is_core BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Not Applicable')),
    assignee TEXT,
    evidence_links TEXT,
    youtube_videos JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(standard_id, element_number)
);

-- ============================================
-- NABH Evidence Files Table
-- ============================================
CREATE TABLE IF NOT EXISTS nabh_evidence_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    element_id UUID NOT NULL REFERENCES nabh_objective_elements(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf')),
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NABH AI Generated Evidence Table
-- ============================================
CREATE TABLE IF NOT EXISTS nabh_ai_generated_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    element_id UUID REFERENCES nabh_objective_elements(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('document', 'visual')),
    visual_type TEXT,
    image_url TEXT,
    language TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NABH Team Members Table
-- ============================================
CREATE TABLE IF NOT EXISTS nabh_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    designation TEXT NOT NULL,
    department TEXT NOT NULL,
    responsibilities TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NABH Audit Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS nabh_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_standards_chapter ON nabh_standards(chapter_id);
CREATE INDEX IF NOT EXISTS idx_elements_standard ON nabh_objective_elements(standard_id);
CREATE INDEX IF NOT EXISTS idx_elements_status ON nabh_objective_elements(status);
CREATE INDEX IF NOT EXISTS idx_elements_assignee ON nabh_objective_elements(assignee);
CREATE INDEX IF NOT EXISTS idx_evidence_files_element ON nabh_evidence_files(element_id);
CREATE INDEX IF NOT EXISTS idx_ai_evidence_element ON nabh_ai_generated_evidence(element_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON nabh_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON nabh_audit_log(record_id);

-- ============================================
-- Updated At Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_nabh_chapters_updated_at ON nabh_chapters;
CREATE TRIGGER update_nabh_chapters_updated_at
    BEFORE UPDATE ON nabh_chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nabh_standards_updated_at ON nabh_standards;
CREATE TRIGGER update_nabh_standards_updated_at
    BEFORE UPDATE ON nabh_standards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nabh_objective_elements_updated_at ON nabh_objective_elements;
CREATE TRIGGER update_nabh_objective_elements_updated_at
    BEFORE UPDATE ON nabh_objective_elements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nabh_team_members_updated_at ON nabh_team_members;
CREATE TRIGGER update_nabh_team_members_updated_at
    BEFORE UPDATE ON nabh_team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE nabh_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabh_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabh_objective_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabh_evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabh_ai_generated_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabh_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabh_audit_log ENABLE ROW LEVEL SECURITY;

-- Public read access for chapters, standards, and elements (for the app)
CREATE POLICY "Allow public read access to chapters" ON nabh_chapters
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to standards" ON nabh_standards
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to elements" ON nabh_objective_elements
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to evidence files" ON nabh_evidence_files
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to ai evidence" ON nabh_ai_generated_evidence
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to team members" ON nabh_team_members
    FOR SELECT USING (true);

-- Allow all operations for authenticated users (service role will bypass RLS)
CREATE POLICY "Allow all operations for authenticated" ON nabh_chapters
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated" ON nabh_standards
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated" ON nabh_objective_elements
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated" ON nabh_evidence_files
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated" ON nabh_ai_generated_evidence
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated" ON nabh_team_members
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated" ON nabh_audit_log
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Insert Default Team Members
-- ============================================
INSERT INTO nabh_team_members (name, role, designation, department, responsibilities) VALUES
    ('Dr. Shiraz Sheikh', 'NABH Coordinator', 'NABH Coordinator / Administrator', 'Quality & Administration',
     ARRAY['Coordinate the planning, implementation, and monitoring of NABH accreditation',
           'Conduct gap analysis and formulate action plans',
           'Arrange training programs on NABH standards for all staff',
           'Maintain updated documentation and evidence for compliance',
           'Liaise with external assessors and accreditation bodies',
           'Conduct internal audits and help implement corrective actions']),
    ('Gaurav', 'Administrator', 'Hospital Administrator', 'Administration',
     ARRAY['Overall hospital administration', 'Support NABH accreditation efforts',
           'Resource allocation and management', 'Coordination with all departments']),
    ('Kashish', 'NABH Champion / MRD', 'NABH Champion - Medical Records Department', 'Medical Records',
     ARRAY['Implement NABH protocols within MRD department',
           'Conduct departmental training and orientation sessions',
           'Monitor and maintain department-specific quality indicators',
           'Ensure proper documentation and record-keeping',
           'Identify areas of non-conformance and facilitate improvements']),
    ('Jagruti', 'Quality Manager / HR', 'Quality Manager & HR Head', 'Quality & Human Resources',
     ARRAY['Develop and implement the hospital Quality Management System (QMS)',
           'Oversee clinical and non-clinical audits',
           'Manage hospital-wide performance indicators and dashboards',
           'Facilitate root cause analysis and quality improvement projects',
           'Support incident reporting and management systems',
           'Prepare periodic quality reports for management review',
           'HR management and staff development']),
    ('Chandraprakash Bisen', 'Infection Control Nurse', 'Infection Control Nurse', 'Infection Control',
     ARRAY['Implement infection control protocols', 'Monitor hospital-acquired infections',
           'Conduct infection control training', 'Surveillance and reporting of infections',
           'Hand hygiene compliance monitoring']),
    ('Farsana', 'Head Nurse', 'Head Nurse / Nursing In-charge', 'Nursing',
     ARRAY['Oversee nursing staff and patient care', 'Ensure nursing protocols compliance',
           'Staff scheduling and management', 'Quality of nursing care monitoring']),
    ('Chandra', 'Department Staff', 'Staff Member', 'Operations', NULL),
    ('Diksha', 'Department Staff', 'Staff Member', 'Operations', NULL),
    ('Javed', 'Department Staff', 'Staff Member', 'Operations', NULL),
    ('Neesha', 'Department Staff', 'Staff Member', 'Nursing', NULL),
    ('Roma', 'Department Staff', 'Staff Member', 'Operations', NULL),
    ('Sachin', 'Department Staff', 'Staff Member', 'Operations', NULL),
    ('Sikaander', 'Department Staff', 'Staff Member', 'Operations', NULL),
    ('Sonali', 'Department Staff', 'Staff Member', 'Operations', NULL),
    ('Suraj', 'Department Staff', 'Staff Member', 'Operations', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- Create Storage Bucket for Evidence Files
-- ============================================
-- Note: Storage bucket creation is done via Supabase Dashboard or API
-- Bucket name: nabh-evidence-files
-- Public access: false
-- File size limit: 10MB
-- Allowed MIME types: image/*, application/pdf

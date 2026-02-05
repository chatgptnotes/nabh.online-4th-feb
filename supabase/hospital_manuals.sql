-- =====================================================
-- HOSPITAL MANUALS TABLE FOR HOPE HOSPITAL
-- Total: 7 Default Hospital Manuals for NABH Compliance
-- =====================================================

-- Create the hospital_manuals table
CREATE TABLE IF NOT EXISTS hospital_manuals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    author VARCHAR(100),
    department VARCHAR(100),
    created_date DATE,
    last_updated DATE,
    next_review_date DATE,
    status VARCHAR(20) DEFAULT 'Draft',
    approved_by VARCHAR(100),
    file_url VARCHAR(500),
    file_size VARCHAR(20),
    page_count INTEGER,
    nabh_relevant BOOLEAN DEFAULT false,
    nabh_standards TEXT[],
    tags TEXT[],
    review_frequency VARCHAR(20) DEFAULT 'Yearly',
    documents_link VARCHAR(500),
    distribution_list TEXT[],
    implementation_date DATE,
    training_required BOOLEAN DEFAULT false,
    hospital_id VARCHAR(50) DEFAULT 'hope',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_hospital_manuals_hospital ON hospital_manuals(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_manuals_category ON hospital_manuals(category);
CREATE INDEX IF NOT EXISTS idx_hospital_manuals_status ON hospital_manuals(status);
CREATE INDEX IF NOT EXISTS idx_hospital_manuals_nabh ON hospital_manuals(nabh_relevant);

-- Enable Row Level Security
ALTER TABLE hospital_manuals ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy (allow all operations)
DROP POLICY IF EXISTS "Allow all actions" ON hospital_manuals;
CREATE POLICY "Allow all actions" ON hospital_manuals FOR ALL USING (true) WITH CHECK (true);

-- Clear existing data (if re-running)
DELETE FROM hospital_manuals WHERE hospital_id = 'hope';

-- Update existing data with wrong hospital_id
UPDATE hospital_manuals SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- =====================================================
-- INSERT HOSPITAL MANUALS DATA
-- Based on NABH Requirements for Hope Hospital
-- =====================================================

INSERT INTO hospital_manuals (
    title, description, category, version, author, department,
    created_date, last_updated, next_review_date, status, approved_by,
    file_size, page_count, nabh_relevant, nabh_standards, tags,
    review_frequency, distribution_list, implementation_date, training_required
) VALUES

-- 1. Hospital Infection Control Manual
(
    'Hospital Infection Control Manual',
    'Comprehensive guidelines for infection prevention and control across all hospital departments',
    'Infection Control',
    '3.2',
    'Shilpi',
    'Infection Control',
    '2024-01-15',
    '2026-01-15',
    '2026-07-15',
    'Current',
    'Dr. Shiraz Khan',
    '2.4 MB',
    156,
    true,
    ARRAY['HIC.1', 'HIC.2', 'HIC.3', 'HIC.4'],
    ARRAY['Hand Hygiene', 'PPE', 'Sterilization', 'Isolation Protocols'],
    'Half-yearly',
    ARRAY['All Clinical Staff', 'Housekeeping', 'Security'],
    '2024-02-01',
    true
),

-- 2. Emergency Response & Disaster Management Manual
(
    'Emergency Response & Disaster Management Manual',
    'Protocols for emergency response, disaster preparedness, and crisis management',
    'Emergency Response',
    '2.1',
    'Gaurav Agrawal',
    'Administration',
    '2024-03-01',
    '2025-12-01',
    '2026-06-01',
    'Current',
    'Dr. Murali BK',
    '1.8 MB',
    98,
    true,
    ARRAY['FMS.1', 'FMS.2', 'PSQ.1'],
    ARRAY['Fire Safety', 'Code Blue', 'Evacuation', 'Mass Casualty'],
    'Yearly',
    ARRAY['All Staff', 'Security', 'Maintenance'],
    '2024-04-01',
    true
),

-- 3. Quality Management System Manual
(
    'Quality Management System Manual',
    'NABH quality management system policies, procedures, and continuous improvement processes',
    'Quality Management',
    '4.0',
    'Sonali',
    'Quality Department',
    '2023-06-01',
    '2026-01-01',
    '2026-12-31',
    'Current',
    'Dr. Shiraz Khan',
    '3.1 MB',
    245,
    true,
    ARRAY['CQI.1', 'CQI.2', 'CQI.3', 'PSQ.2', 'PSQ.3'],
    ARRAY['NABH Standards', 'Quality Indicators', 'PDCA Cycle', 'Risk Management'],
    'Yearly',
    ARRAY['Quality Team', 'Department Heads', 'Senior Management'],
    '2023-07-01',
    true
),

-- 4. Medication Management & Safety Manual
(
    'Medication Management & Safety Manual',
    'Comprehensive guide for safe medication practices, storage, and administration',
    'Clinical Protocols',
    '2.5',
    'Abhishek',
    'Pharmacy',
    '2024-05-01',
    '2025-11-15',
    '2026-05-15',
    'Current',
    'Dr. Sachin',
    '1.6 MB',
    112,
    true,
    ARRAY['PCC.8', 'PCC.9', 'MOM.2'],
    ARRAY['High Alert Drugs', '5 Rights', 'Drug Storage', 'Adverse Events'],
    'Half-yearly',
    ARRAY['Nursing Staff', 'Pharmacy', 'Doctors'],
    '2024-06-01',
    true
),

-- 5. Human Resources Policy Manual
(
    'Human Resources Policy Manual',
    'HR policies, procedures, staff recruitment, training, and performance management',
    'HR & Admin',
    '1.8',
    'K J Shashank',
    'Human Resources',
    '2024-02-01',
    '2025-08-01',
    '2026-08-01',
    'Under Review',
    'Viji Murali',
    '2.2 MB',
    134,
    true,
    ARRAY['HRM.1', 'HRM.2', 'HRM.3'],
    ARRAY['Recruitment', 'Training', 'Performance', 'Disciplinary'],
    'Yearly',
    ARRAY['HR Team', 'Department Heads', 'Management'],
    '2024-03-01',
    false
),

-- 6. Medical Records Management Manual
(
    'Medical Records Management Manual',
    'Guidelines for medical record creation, maintenance, storage, and retrieval',
    'Clinical Protocols',
    '3.0',
    'Azhar',
    'Medical Records',
    '2024-04-01',
    '2026-01-20',
    '2026-10-20',
    'Current',
    'Dr. Shiraz Khan',
    '1.9 MB',
    87,
    true,
    ARRAY['MOM.1', 'MOM.3', 'MOM.4'],
    ARRAY['Documentation', 'Record Retention', 'Confidentiality', 'Audit Trail'],
    'Half-yearly',
    ARRAY['MRD Staff', 'Clinical Staff', 'Quality Team'],
    '2024-05-01',
    true
),

-- 7. Patient Safety & Risk Management Manual
(
    'Patient Safety & Risk Management Manual',
    'Comprehensive patient safety protocols, incident reporting, and risk mitigation strategies',
    'Safety & Security',
    '2.3',
    'Sonali',
    'Quality Department',
    '2024-01-01',
    '2025-10-01',
    '2026-04-01',
    'Current',
    'Dr. Murali BK',
    '2.7 MB',
    178,
    true,
    ARRAY['PSQ.1', 'PSQ.2', 'PSQ.3', 'PSQ.4'],
    ARRAY['Patient Safety', 'Risk Assessment', 'Incident Reporting', 'Root Cause Analysis'],
    'Half-yearly',
    ARRAY['All Clinical Staff', 'Quality Team', 'Management'],
    '2024-02-01',
    true
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all manuals inserted
-- SELECT title, category, status, nabh_relevant, version FROM hospital_manuals ORDER BY title;

-- Count by category
-- SELECT category, COUNT(*) as count FROM hospital_manuals GROUP BY category ORDER BY count DESC;

-- NABH relevant manuals
-- SELECT title, nabh_standards FROM hospital_manuals WHERE nabh_relevant = true ORDER BY title;

-- Manuals requiring training
-- SELECT title, department, training_required FROM hospital_manuals WHERE training_required = true;

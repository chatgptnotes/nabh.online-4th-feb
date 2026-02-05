-- MOUs & Partnership Agreements Table
-- Run this in Supabase SQL Editor

-- Create ENUM types for category and status
DO $$ BEGIN
    CREATE TYPE mou_category AS ENUM ('Academic', 'Corporate', 'Government', 'Healthcare', 'Insurance', 'Technology', 'Research', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mou_status AS ENUM ('Active', 'Expired', 'Under Renewal', 'Terminated', 'Draft');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('PDF', 'Google Docs', 'Google Sheets', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Main MOUs table
CREATE TABLE IF NOT EXISTS mous (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    partner_organization TEXT NOT NULL,
    category mou_category NOT NULL DEFAULT 'Other',
    signed_date DATE NOT NULL,
    expiry_date DATE,
    validity_period TEXT,
    status mou_status NOT NULL DEFAULT 'Draft',
    purpose TEXT,
    key_benefits TEXT[] DEFAULT '{}',
    responsible_person TEXT,
    partner_contact TEXT,
    renewal_required BOOLEAN DEFAULT true,
    financial_implications TEXT,
    compliance_requirements TEXT,
    hospital_id TEXT DEFAULT 'hope',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MOU Documents table (for multiple document links per MOU)
CREATE TABLE IF NOT EXISTS mou_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mou_id UUID REFERENCES mous(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT,
    document_type document_type DEFAULT 'PDF',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mous_hospital_id ON mous(hospital_id);
CREATE INDEX IF NOT EXISTS idx_mous_status ON mous(status);
CREATE INDEX IF NOT EXISTS idx_mous_category ON mous(category);
CREATE INDEX IF NOT EXISTS idx_mous_expiry_date ON mous(expiry_date);
CREATE INDEX IF NOT EXISTS idx_mou_documents_mou_id ON mou_documents(mou_id);

-- Enable Row Level Security
ALTER TABLE mous ENABLE ROW LEVEL SECURITY;
ALTER TABLE mou_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mous table
DROP POLICY IF EXISTS "Allow public read access on mous" ON mous;
CREATE POLICY "Allow public read access on mous" ON mous
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on mous" ON mous;
CREATE POLICY "Allow public insert on mous" ON mous
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on mous" ON mous;
CREATE POLICY "Allow public update on mous" ON mous
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on mous" ON mous;
CREATE POLICY "Allow public delete on mous" ON mous
    FOR DELETE USING (true);

-- RLS Policies for mou_documents table
DROP POLICY IF EXISTS "Allow public read access on mou_documents" ON mou_documents;
CREATE POLICY "Allow public read access on mou_documents" ON mou_documents
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on mou_documents" ON mou_documents;
CREATE POLICY "Allow public insert on mou_documents" ON mou_documents
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on mou_documents" ON mou_documents;
CREATE POLICY "Allow public update on mou_documents" ON mou_documents
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on mou_documents" ON mou_documents;
CREATE POLICY "Allow public delete on mou_documents" ON mou_documents
    FOR DELETE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mous_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_mous_updated_at ON mous;
CREATE TRIGGER trigger_mous_updated_at
    BEFORE UPDATE ON mous
    FOR EACH ROW
    EXECUTE FUNCTION update_mous_updated_at();

-- =====================================================
-- INSERT SAMPLE DATA FOR HOPE HOSPITAL
-- =====================================================

-- 1. Medical College Partnership
INSERT INTO mous (id, title, partner_organization, category, signed_date, expiry_date, validity_period, status, purpose, key_benefits, responsible_person, partner_contact, renewal_required, financial_implications, compliance_requirements, hospital_id)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
    'Medical College Partnership for Internship Program',
    'Government Medical College, Nagpur',
    'Academic',
    '2024-01-15',
    '2027-01-14',
    '3 Years',
    'Active',
    'Provide clinical training opportunities for medical students and interns at Hope Hospital',
    ARRAY['Access to qualified medical interns', 'Academic collaboration opportunities', 'Research partnerships', 'Enhanced hospital reputation', 'Knowledge exchange programs'],
    'Dr. Ruby Ammon',
    'Dr. S.K. Sharma, Dean - GMC Nagpur',
    true,
    'No direct financial cost. Stipend expenses for interns as per norms.',
    'MCI guidelines compliance, Regular evaluation reports, Academic audit participation',
    'hope'
);

-- 2. Corporate Health Package Agreement
INSERT INTO mous (id, title, partner_organization, category, signed_date, expiry_date, validity_period, status, purpose, key_benefits, responsible_person, partner_contact, renewal_required, financial_implications, compliance_requirements, hospital_id)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
    'Corporate Health Package Agreement',
    'TCS Limited, Nagpur',
    'Corporate',
    '2024-06-01',
    '2026-05-31',
    '2 Years',
    'Active',
    'Provide comprehensive healthcare services to TCS employees and their families',
    ARRAY['Guaranteed patient volume', 'Steady revenue stream', 'Corporate health market presence', 'Long-term partnership', 'Bulk service rates'],
    'Viji Murali',
    'HR Manager - TCS Nagpur',
    true,
    '₹25 lakhs annual revenue potential. 15% discount on standard rates.',
    'Corporate billing compliance, Monthly health reports, Employee satisfaction surveys',
    'hope'
);

-- 3. ESIC Empanelment Agreement
INSERT INTO mous (id, title, partner_organization, category, signed_date, expiry_date, validity_period, status, purpose, key_benefits, responsible_person, partner_contact, renewal_required, financial_implications, compliance_requirements, hospital_id)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
    'ESIC Empanelment Agreement',
    'Employees State Insurance Corporation',
    'Government',
    '2023-08-15',
    '2026-08-14',
    '3 Years',
    'Active',
    'Provide medical services to ESIC beneficiaries under the ESI scheme',
    ARRAY['Access to large patient base', 'Government-backed payments', 'Social service contribution', 'Steady income source', 'Network hospital status'],
    'Dr. Murali BK',
    'Regional Director - ESIC Maharashtra',
    true,
    '₹1+ crore annual claims potential. Reimbursement as per ESIC rates.',
    'ESIC guidelines adherence, Monthly claims submission, Audit compliance, Patient feedback',
    'hope'
);

-- 4. Insurance Network Partnership
INSERT INTO mous (id, title, partner_organization, category, signed_date, expiry_date, validity_period, status, purpose, key_benefits, responsible_person, partner_contact, renewal_required, financial_implications, compliance_requirements, hospital_id)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567804',
    'Insurance Network Partnership',
    'HDFC ERGO Health Insurance',
    'Insurance',
    '2024-03-01',
    '2027-02-28',
    '3 Years',
    'Active',
    'Network hospital partnership for cashless medical services to insurance policyholders',
    ARRAY['Cashless treatment facility', 'Increased patient footfall', 'Guaranteed payments', 'Marketing support', 'Digital integration'],
    'K J Shashank',
    'Network Manager - HDFC ERGO',
    true,
    '10-15% of total revenue. Payment within 30 days of claim approval.',
    'Pre-authorization compliance, Claim documentation, Quality audits, TAT adherence',
    'hope'
);

-- 5. Diagnostic Equipment Maintenance Agreement
INSERT INTO mous (id, title, partner_organization, category, signed_date, expiry_date, validity_period, status, purpose, key_benefits, responsible_person, partner_contact, renewal_required, financial_implications, compliance_requirements, hospital_id)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567805',
    'Diagnostic Equipment Maintenance Agreement',
    'Philips Healthcare India',
    'Technology',
    '2024-04-15',
    '2026-04-14',
    '2 Years',
    'Active',
    'Comprehensive maintenance and support for Philips diagnostic equipment',
    ARRAY['Guaranteed uptime', '24/7 technical support', 'Preventive maintenance', 'Spare parts warranty', 'Software updates'],
    'Suraj Rajput',
    'Service Manager - Philips Healthcare',
    true,
    '₹8 lakhs annual AMC cost. Covers all major equipment maintenance.',
    'Monthly service reports, Equipment performance tracking, Compliance with safety standards',
    'hope'
);

-- 6. Research Collaboration Agreement
INSERT INTO mous (id, title, partner_organization, category, signed_date, expiry_date, validity_period, status, purpose, key_benefits, responsible_person, partner_contact, renewal_required, financial_implications, compliance_requirements, hospital_id)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567806',
    'Research Collaboration Agreement',
    'Indian Council of Medical Research (ICMR)',
    'Research',
    '2024-09-01',
    '2027-08-31',
    '3 Years',
    'Active',
    'Joint research initiatives in orthopedics and patient care outcomes',
    ARRAY['Research funding opportunities', 'Publication collaborations', 'Academic recognition', 'Access to research databases', 'Clinical trial participation'],
    'Dr. Murali BK',
    'Research Coordinator - ICMR',
    true,
    'Research grants ranging ₹5-50 lakhs per project. Indirect benefits through publications.',
    'Ethics committee approvals, Regular progress reports, Data sharing compliance, Publication guidelines',
    'hope'
);

-- 7. Nursing College Clinical Training Partnership
INSERT INTO mous (id, title, partner_organization, category, signed_date, expiry_date, validity_period, status, purpose, key_benefits, responsible_person, partner_contact, renewal_required, financial_implications, compliance_requirements, hospital_id)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567807',
    'Nursing College Clinical Training Partnership',
    'Datta Meghe College of Nursing',
    'Academic',
    '2024-02-01',
    '2027-01-31',
    '3 Years',
    'Active',
    'Clinical training facility for nursing students and skill development programs',
    ARRAY['Access to trained nursing students', 'Faculty support', 'Educational programs', 'Recruitment pipeline', 'Academic partnerships'],
    'Farsana (Head Nurse)',
    'Principal - DMCON',
    true,
    'Minimal direct cost. Potential recruitment savings of ₹2-3 lakhs annually.',
    'Nursing council guidelines, Student safety protocols, Regular evaluations, Academic audits',
    'hope'
);

-- 8. Laboratory Services Partnership
INSERT INTO mous (id, title, partner_organization, category, signed_date, expiry_date, validity_period, status, purpose, key_benefits, responsible_person, partner_contact, renewal_required, financial_implications, compliance_requirements, hospital_id)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567808',
    'Laboratory Services Partnership',
    'SRL Diagnostics',
    'Healthcare',
    '2024-05-01',
    '2026-04-30',
    '2 Years',
    'Active',
    'Outsourced specialized laboratory testing services and technical support',
    ARRAY['Access to advanced testing', 'Cost-effective services', 'Quick turnaround time', 'Quality assurance', 'Technical expertise'],
    'Dr. Sachin',
    'Regional Manager - SRL Diagnostics',
    true,
    '20-30% commission on tests. Estimated ₹10-15 lakhs annual revenue.',
    'NABL accreditation maintenance, Quality control participation, Regular audits',
    'hope'
);

-- =====================================================
-- INSERT DOCUMENT LINKS FOR EACH MOU
-- =====================================================

-- Documents for MOU 1: Medical College Partnership
INSERT INTO mou_documents (mou_id, title, url, document_type) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Original MOU Document', '', 'PDF'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Internship Guidelines', '', 'Google Docs');

-- Documents for MOU 2: TCS Corporate Health
INSERT INTO mou_documents (mou_id, title, url, document_type) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Corporate Health Agreement', '', 'PDF'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Service Rate Card', '', 'Google Sheets'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Employee Health Records Template', '', 'Google Sheets');

-- Documents for MOU 3: ESIC Empanelment
INSERT INTO mou_documents (mou_id, title, url, document_type) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'ESIC Empanelment Certificate', '', 'PDF'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'ESIC Rate Schedule', '', 'Google Sheets'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Billing Guidelines', '', 'Google Docs'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Patient Registration Format', '', 'Google Docs');

-- Documents for MOU 4: HDFC ERGO Insurance
INSERT INTO mou_documents (mou_id, title, url, document_type) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Network Hospital Agreement', '', 'PDF'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Tariff Rate Card', '', 'Google Sheets');

-- Documents for MOU 5: Philips AMC
INSERT INTO mou_documents (mou_id, title, url, document_type) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'AMC Agreement', '', 'PDF'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Equipment Inventory List', '', 'Google Sheets'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Service Call Log Template', '', 'Google Sheets');

-- Documents for MOU 6: ICMR Research
INSERT INTO mou_documents (mou_id, title, url, document_type) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Research Collaboration Agreement', '', 'PDF'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Research Protocol Templates', '', 'Google Docs');

-- Documents for MOU 7: Nursing College
INSERT INTO mou_documents (mou_id, title, url, document_type) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Clinical Training MOU', '', 'PDF'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Student Evaluation Forms', '', 'Google Docs'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Training Schedule Template', '', 'Google Sheets');

-- Documents for MOU 8: SRL Diagnostics
INSERT INTO mou_documents (mou_id, title, url, document_type) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Laboratory Services Agreement', '', 'PDF'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Test Menu & Rates', '', 'Google Sheets');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check MOUs count
SELECT 'Total MOUs: ' || COUNT(*) as info FROM mous;

-- Check Documents count
SELECT 'Total Documents: ' || COUNT(*) as info FROM mou_documents;

-- View all MOUs with document count
SELECT
    m.title,
    m.partner_organization,
    m.category,
    m.status,
    m.expiry_date,
    COUNT(d.id) as document_count
FROM mous m
LEFT JOIN mou_documents d ON m.id = d.mou_id
GROUP BY m.id, m.title, m.partner_organization, m.category, m.status, m.expiry_date
ORDER BY m.signed_date DESC;

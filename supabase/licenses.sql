-- =====================================================
-- LICENSES & STATUTORY TABLE FOR HOPE HOSPITAL
-- Total: 17 Licenses across 7 Categories
-- =====================================================

-- Create the licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    license_number VARCHAR(100),
    issuing_authority VARCHAR(200),
    issue_date DATE,
    expiry_date VARCHAR(50), -- Can be 'Permanent' or a date
    validity_period VARCHAR(50),
    status VARCHAR(30) DEFAULT 'Valid',
    description TEXT,
    attached_document VARCHAR(500),
    renewal_process TEXT,
    responsible_person VARCHAR(100),
    reminder_days INTEGER DEFAULT 60,
    last_renewal_date DATE,
    renewal_cost VARCHAR(50),
    documents_link VARCHAR(500),
    hospital_id VARCHAR(50) DEFAULT 'hope',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_licenses_hospital ON licenses(hospital_id);
CREATE INDEX IF NOT EXISTS idx_licenses_category ON licenses(category);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_expiry ON licenses(expiry_date);

-- Enable Row Level Security
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy (allow all operations)
DROP POLICY IF EXISTS "Allow all actions" ON licenses;
CREATE POLICY "Allow all actions" ON licenses FOR ALL USING (true) WITH CHECK (true);

-- Clear existing data (if re-running)
DELETE FROM licenses WHERE hospital_id IN ('hope-hospital', 'hope');

-- Update existing data with wrong hospital_id
UPDATE licenses SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- =====================================================
-- INSERT LICENSES DATA
-- Comprehensive Licenses for Hope Hospital
-- =====================================================

INSERT INTO licenses (
    name, category, license_number, issuing_authority,
    issue_date, expiry_date, validity_period, status,
    description, renewal_process, responsible_person,
    reminder_days, renewal_cost, documents_link
) VALUES

-- =====================================================
-- MEDICAL LICENSES (5)
-- =====================================================

('Hospital Registration Certificate',
 'Medical',
 'HOPE/REG/2024/001',
 'Directorate of Health Services, Maharashtra',
 '2024-01-15',
 '2029-01-14',
 '5 Years',
 'Valid',
 'Primary hospital registration certificate under Maharashtra Nursing Homes Registration Act',
 'Submit renewal application 3 months before expiry with updated documents',
 'Dr. Murali BK',
 90,
 '₹50,000',
 ''),

('Clinical Establishment License',
 'Medical',
 'CEA/HOPE/2024/015',
 'Clinical Establishments Authority, Maharashtra',
 '2024-02-01',
 '2027-01-31',
 '3 Years',
 'Valid',
 'Clinical Establishment Act license for medical practice and patient care',
 'Online application through CEA portal with compliance certificate',
 'Viji Murali',
 90,
 '₹25,000',
 ''),

('Drug License (Retail)',
 'Medical',
 'DL/HOPE/2024/R/032',
 'Food & Drug Administration, Maharashtra',
 '2024-04-01',
 '2026-03-31',
 '2 Years',
 'Expiring Soon',
 'Drug license for retail sale and dispensing of medicines',
 'Submit Form 19 with inspection certificate and fees',
 'Abhishek (Pharmacist)',
 60,
 '₹15,000',
 ''),

('X-Ray License',
 'Medical',
 'RAD/HOPE/2024/009',
 'Atomic Energy Regulatory Board (AERB)',
 '2024-03-15',
 '2027-03-14',
 '3 Years',
 'Valid',
 'Radiation safety license for X-ray and imaging equipment operation',
 'AERB inspection and compliance certificate required',
 'Nitin Bawane (Radiology Technician)',
 120,
 '₹30,000',
 ''),

('Biomedical Waste Authorization',
 'Medical',
 'BMW/HOPE/2024/045',
 'Maharashtra Pollution Control Board',
 '2024-01-01',
 '2026-12-31',
 '3 Years',
 'Valid',
 'Authorization for biomedical waste generation, collection, and disposal',
 'Annual returns submission and triennial renewal with MPCB',
 'Shilpi (Infection Control Nurse)',
 90,
 '₹20,000',
 ''),

-- =====================================================
-- FIRE SAFETY LICENSES (2)
-- =====================================================

('Fire Safety Certificate',
 'Fire Safety',
 'FSC/HOPE/2024/078',
 'Chief Fire Officer, Nagpur',
 '2024-06-15',
 '2025-06-14',
 '1 Year',
 'Expiring Soon',
 'Fire safety compliance certificate for hospital building and operations',
 'Annual inspection by Fire Department with compliance report',
 'Suraj Rajput (Infrastructure)',
 45,
 '₹10,000',
 ''),

('Fire NOC for Building',
 'Fire Safety',
 'NOC/FIRE/2023/234',
 'Fire Department, Nagpur Municipal Corporation',
 '2023-08-20',
 '2026-08-19',
 '3 Years',
 'Valid',
 'Fire No Objection Certificate for hospital building construction and use',
 'Building compliance inspection and structural fire safety audit',
 'Suraj Rajput (Infrastructure)',
 90,
 '₹25,000',
 ''),

-- =====================================================
-- ENVIRONMENTAL LICENSES (2)
-- =====================================================

('Air Pollution Consent',
 'Environmental',
 'AIR/HOPE/2024/089',
 'Maharashtra Pollution Control Board',
 '2024-01-10',
 '2026-01-09',
 '2 Years',
 'Valid',
 'Consent for air pollution activities including DG set and incinerator operation',
 'Annual environmental compliance report and stack monitoring',
 'Suraj Rajput (Infrastructure)',
 60,
 '₹15,000',
 ''),

('Water Pollution Consent',
 'Environmental',
 'WATER/HOPE/2024/067',
 'Maharashtra Pollution Control Board',
 '2024-02-15',
 '2026-02-14',
 '2 Years',
 'Valid',
 'Consent for water pollution activities and wastewater discharge',
 'Water quality monitoring reports and compliance certificate',
 'Suraj Rajput (Infrastructure)',
 60,
 '₹12,000',
 ''),

-- =====================================================
-- BUILDING LICENSES (2)
-- =====================================================

('Building Use Permission',
 'Building',
 'BUP/HOPE/2023/156',
 'Nagpur Municipal Corporation',
 '2023-12-01',
 'Permanent',
 'Permanent',
 'Valid',
 'Building use permission for hospital and medical facility operations',
 'Structural audit every 10 years for buildings above 15 years',
 'Dr. Murali BK',
 365,
 'N/A',
 ''),

('Lift Safety Certificate',
 'Building',
 'LIFT/HOPE/2024/023',
 'Directorate of Industrial Safety & Health',
 '2024-07-01',
 '2025-06-30',
 '1 Year',
 'Expiring Soon',
 'Annual lift safety inspection and operation certificate',
 'Annual inspection by registered lift inspector',
 'Suraj Rajput (Infrastructure)',
 30,
 '₹8,000',
 ''),

-- =====================================================
-- BUSINESS LICENSES (4)
-- =====================================================

('GST Registration Certificate',
 'Business',
 '27AABCH1234C1Z5',
 'Goods & Services Tax Department',
 '2023-07-01',
 'Permanent',
 'Permanent',
 'Valid',
 'GST registration for hospital services and medical equipment',
 'Annual returns filing and quarterly compliance',
 'K J Shashank (HR & Finance)',
 30,
 'N/A',
 ''),

('Professional Tax Registration',
 'Business',
 'PT/HOPE/2024/891',
 'Commercial Tax Department, Maharashtra',
 '2024-04-01',
 '2025-03-31',
 '1 Year',
 'Valid',
 'Professional tax registration for hospital and staff',
 'Annual renewal with payment of professional tax',
 'K J Shashank (HR & Finance)',
 45,
 '₹2,500',
 ''),

('ESI Registration',
 'Business',
 '40000123456789000',
 'Employees State Insurance Corporation',
 '2023-08-15',
 'Permanent',
 'Permanent',
 'Valid',
 'ESI registration for employee medical benefits and insurance',
 'Monthly contribution and annual compliance',
 'K J Shashank (HR & Finance)',
 30,
 'Monthly Contribution',
 ''),

('PF Registration',
 'Business',
 'MH/NGP/0012345/000',
 'Employees Provident Fund Organisation',
 '2023-08-15',
 'Permanent',
 'Permanent',
 'Valid',
 'Provident Fund registration for employee retirement benefits',
 'Monthly PF contribution and annual compliance',
 'K J Shashank (HR & Finance)',
 30,
 'Monthly Contribution',
 ''),

-- =====================================================
-- PROFESSIONAL LICENSES (2)
-- =====================================================

('Dr. Murali BK - Medical Registration',
 'Professional',
 'MCI-12345-2020',
 'Maharashtra Medical Council',
 '2020-01-15',
 '2025-01-14',
 '5 Years',
 'Expiring Soon',
 'Medical Council registration for Dr. Murali BK - Orthopedic Surgeon',
 'CME credits completion and renewal application',
 'Dr. Murali BK',
 90,
 '₹5,000',
 ''),

('Dr. Ruby Ammon - Medical Registration',
 'Professional',
 'MCI-67890-2018',
 'Maharashtra Medical Council',
 '2018-03-20',
 '2026-03-19',
 '5 Years',
 'Valid',
 'Medical Council registration for Dr. Ruby Ammon - Medical Director',
 'CME credits completion and renewal application',
 'Dr. Ruby Ammon',
 90,
 '₹5,000',
 ''),

-- =====================================================
-- EQUIPMENT LICENSES (1)
-- =====================================================

('Boiler Inspection Certificate',
 'Equipment',
 'BOILER/HOPE/2024/007',
 'Chief Inspector of Boilers, Maharashtra',
 '2024-09-01',
 '2025-08-31',
 '1 Year',
 'Valid',
 'Annual boiler inspection and safety certificate for steam sterilization',
 'Annual inspection by registered boiler inspector',
 'Suraj Rajput (Infrastructure)',
 45,
 '₹12,000',
 '');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all licenses inserted
-- SELECT name, category, status, expiry_date FROM licenses ORDER BY category, name;

-- Count by category
-- SELECT category, COUNT(*) as count FROM licenses GROUP BY category ORDER BY count DESC;

-- Expiring Soon licenses
-- SELECT name, category, expiry_date, responsible_person FROM licenses WHERE status = 'Expiring Soon';

-- Count by status
-- SELECT status, COUNT(*) as count FROM licenses GROUP BY status;

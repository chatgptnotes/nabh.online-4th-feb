-- =====================================================
-- DEPARTMENTS TABLE FOR HOPE HOSPITAL / AYUSHMAN NAGPUR
-- Total: 30 Departments based on Scope of Services
-- =====================================================

-- Create the departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dept_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    head_of_department VARCHAR(100),
    contact_number VARCHAR(20),
    nabh_is_active BOOLEAN DEFAULT true,
    nabh_last_audit_date DATE,
    nabh_compliance_status VARCHAR(20) DEFAULT 'Under Review',
    services TEXT[],
    equipment_list TEXT[],
    staff_count INTEGER,
    is_emergency_service BOOLEAN DEFAULT false,
    operating_hours VARCHAR(50),
    hospital_id VARCHAR(50) DEFAULT 'hope-hospital',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_departments_hospital ON departments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_departments_category ON departments(category);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_type ON departments(type);

-- Clear existing data (if re-running)
DELETE FROM departments WHERE hospital_id = 'hope-hospital';

-- =====================================================
-- INSERT DEPARTMENTS DATA
-- Based on Scope of Services - Ayushman Nagpur Hospital
-- =====================================================

INSERT INTO departments (dept_id, name, code, category, type, description, services, is_emergency_service, operating_hours, nabh_is_active, nabh_compliance_status) VALUES

-- BROAD SPECIALITIES - CLINICAL SERVICES (11 departments)
('dept_001', 'Anaesthesia', 'ANAES', 'Clinical Speciality', 'Medical',
 'Anesthesia services for surgical procedures and pain management',
 ARRAY['General Anesthesia', 'Regional Anesthesia', 'Local Anesthesia', 'Pain Management'],
 true, '24/7', true, 'Under Review'),

('dept_002', 'Critical Care Unit Combined', 'CCU', 'Clinical Speciality', 'Medical',
 'Intensive care services for critically ill patients',
 ARRAY['Intensive Care', 'Ventilator Support', 'Cardiac Monitoring', 'Life Support'],
 true, '24/7', true, 'Under Review'),

('dept_003', 'Family Medicine', 'FAM', 'Clinical Speciality', 'Medical',
 'Primary care and family medicine services',
 ARRAY['Primary Care', 'Family Health', 'Preventive Medicine', 'Health Screening'],
 false, '8:00 AM - 8:00 PM', true, 'Under Review'),

('dept_004', 'General Medicine', 'MED', 'Clinical Speciality', 'Medical',
 'General internal medicine and medical consultations',
 ARRAY['Internal Medicine', 'Medical Consultation', 'Chronic Disease Management'],
 true, '24/7', true, 'Under Review'),

('dept_005', 'General Surgery', 'SURG', 'Clinical Speciality', 'Surgical',
 'General surgical procedures and emergency surgery',
 ARRAY['General Surgery', 'Emergency Surgery', 'Minor Procedures', 'Outpatient Surgery'],
 true, '24/7', true, 'Under Review'),

('dept_006', 'Joint Replacement & Arthroscopy', 'ARTHR', 'Clinical Speciality', 'Surgical',
 'Orthopedic joint replacement and arthroscopic procedures',
 ARRAY['Joint Replacement', 'Arthroscopy', 'Orthopedic Surgery', 'Sports Medicine'],
 false, '8:00 AM - 6:00 PM', true, 'Under Review'),

('dept_007', 'Orthopaedics Surgery', 'ORTHO', 'Clinical Speciality', 'Surgical',
 'Orthopedic surgery and bone-related treatments',
 ARRAY['Orthopedic Surgery', 'Fracture Treatment', 'Spine Surgery', 'Trauma Surgery'],
 true, '24/7', true, 'Under Review'),

('dept_008', 'Otorhinolaryngology', 'ENT', 'Clinical Speciality', 'Surgical',
 'ENT (Ear, Nose, Throat) specialist services',
 ARRAY['ENT Surgery', 'Hearing Tests', 'Nasal Procedures', 'Throat Surgery'],
 false, '8:00 AM - 6:00 PM', true, 'Under Review'),

('dept_009', 'Respiratory Medicine', 'RESP', 'Clinical Speciality', 'Medical',
 'Pulmonology and respiratory care services',
 ARRAY['Pulmonology', 'Respiratory Care', 'Sleep Studies', 'Lung Function Tests'],
 true, '24/7', true, 'Under Review'),

('dept_010', 'Day Care Services', 'DAYCARE', 'Clinical Speciality', 'Medical',
 'Day care procedures and outpatient treatments',
 ARRAY['Day Surgery', 'Outpatient Procedures', 'Minor Operations', 'Same-day Discharge'],
 false, '8:00 AM - 6:00 PM', true, 'Under Review'),

('dept_011', 'Vascular Surgery', 'VASC', 'Clinical Speciality', 'Surgical',
 'Vascular and blood vessel surgical procedures',
 ARRAY['Vascular Surgery', 'Angioplasty', 'Bypass Surgery', 'Vascular Interventions'],
 true, '24/7', true, 'Under Review'),

-- SUPPORT SERVICES (10 departments)
('dept_012', 'Biomedical Engineering', 'BME', 'Support Services', 'Support',
 'Medical equipment maintenance and biomedical engineering services',
 ARRAY['Equipment Maintenance', 'Calibration', 'Medical Device Management', 'Technical Support'],
 true, '24/7', true, 'Under Review'),

('dept_013', 'CSSD', 'CSSD', 'Support Services', 'Support',
 'Central Sterile Supply Department - sterilization services',
 ARRAY['Sterilization', 'Instrument Processing', 'Supply Management', 'Infection Control'],
 true, '24/7', true, 'Under Review'),

('dept_015', 'Housekeeping', 'HOUSE', 'Support Services', 'Support',
 'Hospital housekeeping and environmental services',
 ARRAY['Cleaning Services', 'Waste Management', 'Environmental Hygiene', 'Maintenance'],
 true, '24/7', true, 'Under Review'),

('dept_017', 'Information Technology', 'IT', 'Support Services', 'Support',
 'Hospital information systems and IT services',
 ARRAY['IT Support', 'System Administration', 'Network Management', 'Data Security'],
 true, '24/7', true, 'Under Review'),

('dept_026', 'Physiotherapy', 'PHYSIO', 'Support Services', 'Support',
 'Physical therapy and rehabilitation services',
 ARRAY['Physical Therapy', 'Rehabilitation', 'Exercise Therapy', 'Mobility Training'],
 false, '8:00 AM - 6:00 PM', true, 'Under Review'),

('dept_027', 'Clinical Biochemistry', 'BIOCHEM', 'Support Services', 'Diagnostic',
 'Clinical laboratory biochemistry testing services',
 ARRAY['Blood Chemistry', 'Biochemical Tests', 'Enzyme Analysis', 'Metabolic Testing'],
 true, '24/7', true, 'Under Review'),

('dept_028', 'Clinical Pathology', 'PATH', 'Support Services', 'Diagnostic',
 'Clinical pathology and laboratory diagnostic services',
 ARRAY['Pathology', 'Histopathology', 'Cytology', 'Microscopy'],
 true, '24/7', true, 'Under Review'),

('dept_029', 'Haematology', 'HAEM', 'Support Services', 'Diagnostic',
 'Blood-related diagnostic and treatment services',
 ARRAY['Blood Tests', 'CBC', 'Blood Banking', 'Coagulation Studies'],
 true, '24/7', true, 'Under Review'),

('dept_030', 'Radiology', 'RAD', 'Support Services', 'Diagnostic',
 'Medical imaging services - X-Ray and Ultrasound',
 ARRAY['X-Ray', 'Ultrasound', 'Medical Imaging', 'Diagnostic Radiology'],
 true, '24/7', true, 'Under Review'),

-- ADMINISTRATION (2 departments)
('dept_014', 'General Administration', 'ADMIN', 'Administration', 'Administrative',
 'Hospital administration and management services',
 ARRAY['Hospital Administration', 'Policy Management', 'Compliance', 'Operations Management'],
 false, '8:00 AM - 6:00 PM', true, 'Under Review'),

('dept_016', 'Human Resources', 'HR', 'Administration', 'Administrative',
 'Human resource management and staff services',
 ARRAY['Staff Management', 'Training', 'Recruitment', 'Employee Relations'],
 false, '8:00 AM - 6:00 PM', true, 'Under Review'),

-- SUPER SPECIALITIES (8 departments)
('dept_018', 'Gastrointestinal Medicine', 'GASTRO', 'Super Speciality', 'Medical',
 'Gastroenterology and digestive system specialist services',
 ARRAY['Gastroenterology', 'Endoscopy', 'Liver Care', 'Digestive System Treatment'],
 true, '24/7', true, 'Under Review'),

('dept_019', 'Critical Care - Combined Speciality ICU', 'ICU', 'Super Speciality', 'Medical',
 'Specialized intensive care unit with combined specialties',
 ARRAY['Specialized ICU', 'Multi-specialty Critical Care', 'Advanced Life Support'],
 true, '24/7', true, 'Under Review'),

('dept_020', 'Neurology', 'NEURO', 'Super Speciality', 'Medical',
 'Neurological disorders and brain specialist services',
 ARRAY['Neurology', 'Brain Disorders', 'Neurological Assessment', 'Movement Disorders'],
 true, '24/7', true, 'Under Review'),

('dept_021', 'Neurosurgery', 'NSURG', 'Super Speciality', 'Surgical',
 'Brain and nervous system surgical procedures',
 ARRAY['Brain Surgery', 'Spine Surgery', 'Neurological Procedures', 'Tumor Removal'],
 true, '24/7', true, 'Under Review'),

('dept_022', 'Surgical Oncology', 'ONCO', 'Super Speciality', 'Surgical',
 'Cancer surgery - mainly neuro and orthopedic oncology',
 ARRAY['Cancer Surgery', 'Neuro Oncology', 'Orthopedic Oncology', 'Tumor Removal'],
 false, '8:00 AM - 6:00 PM', true, 'Under Review'),

('dept_023', 'Plastic and Reconstructive Surgery', 'PLASTIC', 'Super Speciality', 'Surgical',
 'Plastic surgery and reconstructive procedures',
 ARRAY['Plastic Surgery', 'Reconstructive Surgery', 'Cosmetic Surgery', 'Burn Treatment'],
 false, '8:00 AM - 6:00 PM', true, 'Under Review'),

('dept_024', 'Urology', 'URO', 'Super Speciality', 'Surgical',
 'Urological surgery and kidney-related treatments',
 ARRAY['Urology', 'Kidney Surgery', 'Prostate Treatment', 'Urological Procedures'],
 true, '24/7', true, 'Under Review'),

('dept_025', 'Surgical Gastroenterology', 'SGASTRO', 'Super Speciality', 'Surgical',
 'Surgical treatment of gastrointestinal disorders',
 ARRAY['GI Surgery', 'Laparoscopic Surgery', 'Liver Surgery', 'Pancreatic Surgery'],
 true, '24/7', true, 'Under Review');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all departments inserted
-- SELECT dept_id, name, code, category, type, is_emergency_service FROM departments ORDER BY dept_id;

-- Count by category
-- SELECT category, COUNT(*) as count FROM departments GROUP BY category ORDER BY category;

-- Count by type
-- SELECT type, COUNT(*) as count FROM departments GROUP BY type ORDER BY type;

-- Emergency services only
-- SELECT name, code, operating_hours FROM departments WHERE is_emergency_service = true ORDER BY name;

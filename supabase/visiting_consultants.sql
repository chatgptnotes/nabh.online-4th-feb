-- =====================================================
-- VISITING CONSULTANTS TABLE FOR HOPE HOSPITAL
-- Total: 22 Visiting Consultants with Registration Numbers
-- =====================================================

-- Create the visiting_consultants table
CREATE TABLE IF NOT EXISTS visiting_consultants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sr_no INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    qualification VARCHAR(150),
    registration_no VARCHAR(50),
    registered_council VARCHAR(100) DEFAULT 'Maharashtra Medical Council',
    hospital_id VARCHAR(50) DEFAULT 'hope-hospital',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_visiting_consultants_hospital ON visiting_consultants(hospital_id);
CREATE INDEX IF NOT EXISTS idx_visiting_consultants_department ON visiting_consultants(department);

-- Clear existing data (if re-running)
DELETE FROM visiting_consultants WHERE hospital_id = 'hope-hospital';

-- =====================================================
-- INSERT VISITING CONSULTANTS DATA
-- =====================================================

INSERT INTO visiting_consultants (sr_no, name, department, qualification, registration_no, registered_council) VALUES
(1, 'Dr. Nikhil Khobragade', 'GASTROENTEROLOGIST', 'MBBS', '2010/08/6234', 'Maharashtra Medical Council'),
(2, 'Dr. B. K. Murali', 'ORTHOPAEDIC SURGERY', 'MBBS, MS. (Ortho)', '2000/07/2602', 'Maharashtra Medical Council'),
(3, 'Dr. Vishal Nandagawali', 'GENERAL SURGERY', 'MS. (General Surgery)', '2003/02/344', 'Maharashtra Medical Council'),
(4, 'Dr. Vijay Bansod', 'ENT SURGERY', 'MS. (ENT Surgery)', '2005/10/3846', 'Maharashtra Medical Council'),
(5, 'Dr. Shrikant Perka', 'PLASTIC SURGERY', 'MCh. (Plastic Surgery)', '2019075436', 'Maharashtra Medical Council'),
(6, 'Dr. Chirag Patil', 'MAXILLOFACIAL SURGERY', 'MBBS, MS. (Oral)', 'A-31608', 'Maharashtra Medical Council'),
(7, 'Dr. Akshay Dalal', 'CARDIOLOGY', 'DM (Cardiology)', '38691', 'Maharashtra Medical Council'),
(8, 'Dr. Arun Agre', 'PATHOLOGY', 'MBBS, MD.', '60425', 'Maharashtra Medical Council'),
(9, 'Dr. Suhash Tiple', 'PULMONOLOGY', 'MBBS, MD.', '2011/04/0865', 'Maharashtra Medical Council'),
(10, 'Dr. Ritesh Mate', 'CVTS', 'MS. MCh (CVTS)', '2019/04/1730', 'Maharashtra Medical Council'),
(11, 'Dr. Thavendra Dihare', 'PAEDIATRIC SURGERY', 'MS. MCh (Paediatric Surgery)', '2004/01/0125', 'Maharashtra Medical Council'),
(12, 'Dr. Dinesh Sharma', 'INTERVENTIONAL CARDIOLOGY', 'MBBS, MD, DNB, Neuro & Vascular', '54923', 'Maharashtra Medical Council'),
(13, 'Dr. Prashik Walde', 'PSYCHIATRY', 'MBBS, DPM', '2016/08/2244', 'Maharashtra Medical Council'),
(14, 'Dr. Kunal Chattani', 'HEMATOLOGY', 'MBBS, MD', '2022/03/0589', 'Maharashtra Medical Council'),
(15, 'Dr. Sushil Rathi', 'DERMATOLOGY', 'MBBS, MD', '84909', 'Maharashtra Medical Council'),
(16, 'Dr. Naved Sheikh', 'RADIOLOGY', 'MBBS, MD (Radiology)', '87718', 'Maharashtra Medical Council'),
(17, 'Dr. Milind Dekate', 'NEPHROLOGY', 'MBBS, MD, DM (Nephrology)', '2006/05/2498', 'Maharashtra Medical Council'),
(18, 'Dr. Jivan Kinkar', 'NEUROLOGY', 'MBBS, MD, DM (Neurology)', '2024/08/6217', 'Maharashtra Medical Council'),
(19, 'Dr. Ankit Daware', 'NEURO SURGERY', 'MBBS, MCh (Neuro Surgery)', '2014/08/3695', 'Maharashtra Medical Council'),
(20, 'Dr. Surekha Nandagawali', 'OBSTETRICS & GYNAECOLOGY', 'MBBS, MS (Gynaecology)', '2005/03/1800', 'Maharashtra Medical Council'),
(21, 'Dr. Rohit Ashrani', 'PAEDIATRICS', 'MBBS, MD (Pediatrics)', '2013/04/1099', 'Maharashtra Medical Council'),
(22, 'Dr. Jayant Nikose', 'UROLOGY', 'MBBS, MCH', '19-90036', 'Maharashtra Medical Council');

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify the data:
-- SELECT sr_no, name, department, qualification, registration_no FROM visiting_consultants ORDER BY sr_no;

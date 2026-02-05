-- =====================================================
-- RMO DOCTORS TABLE FOR HOPE HOSPITAL
-- Total: 12 RMO Doctors (6 Allopathic + 6 Non-Allopathic)
-- =====================================================

-- Create the rmo_doctors table
CREATE TABLE IF NOT EXISTS rmo_doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sr_no INTEGER NOT NULL,
    emp_id_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    qualification VARCHAR(50) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    registration_no VARCHAR(50),
    doctor_type VARCHAR(20) DEFAULT 'Allopathic', -- 'Allopathic' or 'Non-Allopathic'
    hospital_id VARCHAR(50) DEFAULT 'hope-hospital',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_rmo_doctors_hospital ON rmo_doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_rmo_doctors_emp_id ON rmo_doctors(emp_id_no);
CREATE INDEX IF NOT EXISTS idx_rmo_doctors_type ON rmo_doctors(doctor_type);

-- Clear existing data (if re-running)
DELETE FROM rmo_doctors WHERE hospital_id = 'hope-hospital';

-- =====================================================
-- INSERT RMO DOCTORS - ALLOPATHIC (MBBS)
-- =====================================================

INSERT INTO rmo_doctors (sr_no, emp_id_no, name, qualification, designation, registration_no, doctor_type) VALUES
(1, 'H001', 'Dr. Shiraz Khan', 'M.B.B.S', 'RMO / Quality Coordinator', '2001/06/2320', 'Allopathic'),
(2, 'H002', 'Dr. Sandeep Gajbe', 'M.B.B.S', 'RMO', 'MMC/2019/12/7373', 'Allopathic'),
(3, 'H003', 'Dr. Afzal Shekh', 'M.B.B.S', 'RMO', 'MCI/09-35333', 'Allopathic'),
(4, 'H004', 'Dr. Vinod Borkar', 'M.B.B.S', 'RMO', '2000/07/2536', 'Allopathic'),
(5, 'H005', 'Dr. Pranali Gurukar', 'M.B.B.S', 'RMO', '2016/09/3816', 'Allopathic'),
(6, 'H006', 'Dr. Shubham Ingle', 'M.B.B.S', 'RMO', '2019/09/6234', 'Allopathic');

-- =====================================================
-- INSERT RMO DOCTORS - NON-ALLOPATHIC (BHMS/BAMS/BUMS)
-- =====================================================

INSERT INTO rmo_doctors (sr_no, emp_id_no, name, qualification, designation, registration_no, doctor_type) VALUES
(7, 'H007', 'Dr. Swapnil Charpe', 'B.H.M.S', 'RMO', '44068', 'Non-Allopathic'),
(8, 'H008', 'Dr. Javed Khan', 'B.H.M.S', 'RMO', '61356', 'Non-Allopathic'),
(9, 'H009', 'Dr. Sharad Kawde', 'B.H.M.S', 'RMO / MRD Incharge', '20598', 'Non-Allopathic'),
(10, 'H010', 'Dr. Nitin Arihar', 'B.A.M.S', 'RMO', 'I-101786-A', 'Non-Allopathic'),
(11, 'H011', 'Dr. Sachin Gathibande', 'B.H.M.S', 'RMO', 'A423/2005', 'Non-Allopathic'),
(12, 'H012', 'Dr. Sikhandar Khan', 'B.U.M.S', 'RMO', 'I-77705-E', 'Non-Allopathic');

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- SELECT emp_id_no, name, qualification, designation, doctor_type FROM rmo_doctors ORDER BY sr_no;

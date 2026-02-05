-- SQL to insert staff data into nabh_team_members with Emp IDs
-- Run this in Supabase SQL Editor AFTER running add_emp_id_column.sql
--
-- Prerequisites: Run add_emp_id_column.sql first to add the required columns

-- ============================================================================
-- DOCTORS (H001 - H012) - From Staff DOCX
-- ============================================================================
INSERT INTO public.nabh_team_members
(name, role, designation, department, emp_id_no, qualification, registration_no, responsibilities, is_active)
VALUES
-- RMOs and Quality Coordinator
('Dr. Shiraz Khan', 'Doctor', 'RMO / Quality Coordinator', 'Medical', 'H001', 'M.B.B.S', '2001/06/2320', '{}', true),
('Dr. Sandeep Gajbe', 'Doctor', 'RMO', 'Medical', 'H002', 'M.B.B.S', 'MMC/2019/12/7373', '{}', true),
('Dr. Afzal Shekh', 'Doctor', 'RMO', 'Medical', 'H003', 'M.B.B.S', 'MCI/09-35333', '{}', true),
('Dr. Vinod Borkar', 'Doctor', 'RMO', 'Medical', 'H004', 'M.B.B.S', '2000/07/2536', '{}', true),
('Dr. Pranali Gurukar', 'Doctor', 'RMO', 'Medical', 'H005', 'M.B.B.S', '2016/09/3816', '{}', true),
('Dr. Shubham Ingle', 'Doctor', 'RMO', 'Medical', 'H006', 'M.B.B.S', '2019/09/6234', '{}', true),
('Dr. Swapnil Charpe', 'Doctor', 'RMO', 'Medical', 'H007', 'B.H.M.S', '44068', '{}', true),
('Dr. Javed Khan', 'Doctor', 'RMO', 'Medical', 'H008', 'B.H.M.S', '61356', '{}', true),
('Dr. Sharad Kawde', 'Doctor', 'RMO / MRD Incharge', 'Medical', 'H009', 'B.H.M.S', '20598', '{}', true),
('Dr. Nitin Arihar', 'Doctor', 'RMO', 'Medical', 'H010', 'B.A.M.S', 'I-101786-A', '{}', true),
('Dr. Sachin Gathibande', 'Doctor', 'RMO', 'Medical', 'H011', 'B.H.M.S', 'A423/2005', '{}', true),
('Dr. Sikhandar Khan', 'Doctor', 'RMO', 'Medical', 'H012', 'B.U.M.S', 'I-77705-E', '{}', true)

ON CONFLICT (emp_id_no) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  designation = EXCLUDED.designation,
  department = EXCLUDED.department,
  qualification = EXCLUDED.qualification,
  registration_no = EXCLUDED.registration_no,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- NURSING STAFF (H013 - H035) - Placeholder for future data
-- ============================================================================
-- Nursing staff data to be added from DOCX when available

-- ============================================================================
-- ADMIN & SUPPORT STAFF (H036 onwards)
-- ============================================================================
INSERT INTO public.nabh_team_members
(name, role, designation, department, emp_id_no, responsibilities, is_active)
VALUES
-- Admin & HR
('Gaurav Agrawal', 'Management', 'HR Head / Admin', 'Admin', 'H036', '{}', true),
('Shashank Upgade', 'Support Staff', 'HR Attendant', 'Admin', 'H037', '{}', true),

-- Safety
('Aman Rajak', 'Safety Officer', 'Fire Safety Officer', 'Safety', 'H038', '{}', true),

-- Physiotherapy
('Roma Kangwani', 'Technical Staff', 'Physiotherapist', 'Physiotherapy', 'H039', '{}', true),
('Ayushi Nandagawali', 'Support Staff', 'Physiotherapist Attendant', 'Physiotherapy', 'H040', '{}', true),

-- Radiology
('Nitin Bawane', 'Technical Staff', 'X-Ray Technician', 'Radiology', 'H041', '{}', true),
('Pratik Vyankat', 'Support Staff', 'X-Ray Technician Attendant', 'Radiology', 'H042', '{}', true),

-- OT
('Apeksha Wandre', 'Technical Staff', 'OT Technician', 'OT', 'H043', '{}', true),
('Shruti Uikey', 'Technical Staff', 'OT Technician', 'OT', 'H044', '{}', true),
('Sarvesh Bhramhe', 'Technical Staff', 'OT Technician', 'OT', 'H045', '{}', true),

-- Laboratory
('Digesh Bisen', 'Technical Staff', 'Lab Technician', 'Laboratory', 'H046', '{}', true),
('Rachana Rathore', 'Technical Staff', 'Lab Technician', 'Laboratory', 'H047', '{}', true),
('Sarita Rangari', 'Support Staff', 'Lab Attendant', 'Laboratory', 'H048', '{}', true),

-- Front Office
('Nisha Sharma', 'Admin', 'Receptionist', 'Front Office', 'H049', '{}', true),
('Diksha Sakhare', 'Admin', 'Receptionist', 'Front Office', 'H050', '{}', true),

-- Pharmacy
('Ruchika Jambhulkar', 'Pharmacy', 'Pharmacist', 'Pharmacy', 'H051', '{}', true),
('Tejash Akhare', 'Pharmacy', 'Pharmacist', 'Pharmacy', 'H052', '{}', true),
('Abhishek Dannar', 'Pharmacy', 'Pharmacist', 'Pharmacy', 'H053', '{}', true),
('Lalit Meshram', 'Support Staff', 'Attendant Pharmacist', 'Pharmacy', 'H054', '{}', true),

-- Billing
('Jagruti Tembhare', 'Admin', 'Billing Staff', 'Billing', 'H055', '{}', true),
('Azhar Khan', 'Admin', 'Billing Staff', 'Billing', 'H056', '{}', true),
('Madhuri Marwate', 'Admin', 'Billing Staff', 'Billing', 'H057', '{}', true),
('Pragati Nandeshwar', 'Admin', 'Billing Staff', 'Billing', 'H058', '{}', true),

-- MRD
('Kashish Jagwani', 'Support Staff', 'MRD Attendant', 'MRD', 'H059', '{}', true),

-- Finance
('Priyanka Tandekar', 'Admin', 'Accountant', 'Finance', 'H060', '{}', true),
('Shailesh Ninawe', 'Admin', 'Accountant', 'Finance', 'H061', '{}', true),

-- Housekeeping
('Reena Nirgule', 'Support Staff', 'House-Keeping Supervisor', 'Housekeeping', 'H062', '{}', true),
('Asha Sakhare', 'Support Staff', 'Aya', 'Housekeeping', 'H063', '{}', true),
('Urmila Lautkar', 'Support Staff', 'Aya', 'Housekeeping', 'H064', '{}', true),
('Shubhangi Naik', 'Support Staff', 'Aya', 'Housekeeping', 'H065', '{}', true),
('Shrushti Lendare', 'Support Staff', 'Aya', 'Housekeeping', 'H066', '{}', true),
('Shilpa Bankar', 'Support Staff', 'Aya', 'Housekeeping', 'H067', '{}', true),
('Karuna Dhupare', 'Support Staff', 'Aya', 'Housekeeping', 'H068', '{}', true),
('Usha Bhave', 'Support Staff', 'Aya', 'Housekeeping', 'H069', '{}', true),
('Kartik Jangade', 'Support Staff', 'Wardboy', 'Housekeeping', 'H070', '{}', true),
('Vivek Channe', 'Support Staff', 'Wardboy', 'Housekeeping', 'H071', '{}', true),
('Rajkumar Walake', 'Support Staff', 'Housekeeping', 'Housekeeping', 'H072', '{}', true),
('Vijay Chatpaliwar', 'Support Staff', 'Housekeeping', 'Housekeeping', 'H073', '{}', true),
('Janardhan Motghare', 'Support Staff', 'Housekeeping', 'Housekeeping', 'H074', '{}', true),

-- Security
('Afroz Khan', 'Support Staff', 'Security Guard', 'Security', 'H075', '{}', true),
('Kiran Kadbe', 'Support Staff', 'Security Guard', 'Security', 'H076', '{}', true),
('Jiyalal Sukhdeve', 'Support Staff', 'Security Guard', 'Security', 'H077', '{}', true)

ON CONFLICT (emp_id_no) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  designation = EXCLUDED.designation,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the data was inserted correctly:

-- Check all doctors with their qualifications
-- SELECT emp_id_no, name, qualification, designation, registration_no
-- FROM nabh_team_members
-- WHERE role = 'Doctor'
-- ORDER BY emp_id_no;

-- Check all staff with emp_id_no
-- SELECT emp_id_no, name, role, designation, department
-- FROM nabh_team_members
-- WHERE emp_id_no IS NOT NULL
-- ORDER BY emp_id_no;

-- Count by role
-- SELECT role, COUNT(*) as count
-- FROM nabh_team_members
-- WHERE emp_id_no IS NOT NULL
-- GROUP BY role
-- ORDER BY count DESC;

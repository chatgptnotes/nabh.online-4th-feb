-- SQL to insert staff data into nabh_team_members
-- Run this in your Supabase SQL Editor

INSERT INTO public.nabh_team_members 
(name, role, designation, department, emp_id_no, responsibilities, is_active)
VALUES
('Mrs. Meena Raut', 'Management', 'Nursing Superintendent', 'Nursing', 'HOPE/NS/001', '{}', true),
('Ms. Priyanka Meshram', 'Nursing Staff', 'Incharge Nurse', 'ICU', 'HOPE/NS/002', '{}', true),
('Ms. Ashwini Wanode', 'Nursing Staff', 'Staff Nurse', 'ICU', 'HOPE/NS/003', '{}', true),
('Ms. Savita Sahare', 'Nursing Staff', 'Staff Nurse', 'ICU', 'HOPE/NS/004', '{}', true),
('Ms. Rohini Zade', 'Nursing Staff', 'Staff Nurse', 'Ward', 'HOPE/NS/005', '{}', true),
('Ms. Dipali Kadu', 'Nursing Staff', 'Staff Nurse', 'Ward', 'HOPE/NS/006', '{}', true),
('Ms. Nikita Meshram', 'Nursing Staff', 'Staff Nurse', 'ICU', 'HOPE/NS/007', '{}', true),
('Ms. Snehal Dhoke', 'Nursing Staff', 'Staff Nurse', 'Ward', 'HOPE/NS/008', '{}', true),
('Ms. Pooja Bawane', 'Nursing Staff', 'Staff Nurse', 'ICU', 'HOPE/NS/009', '{}', true),
('Ms. Karishma Bagde', 'Nursing Staff', 'Staff Nurse', 'Ward', 'HOPE/NS/010', '{}', true),
('Mr. Amol Somkuwar', 'Admin', 'Admin Officer', 'Administration', 'HOPE/ADM/001', '{}', true),
('Mr. Sandeep Mohod', 'NABH Coordinator', 'Quality Coordinator', 'Quality', 'HOPE/QTY/001', '{}', true),
('Mr. Rakesh Mate', 'Pharmacy', 'Pharmacy Incharge', 'Pharmacy', 'HOPE/PHM/001', '{}', true),
('Mr. Vikas Dongre', 'Technical Staff', 'Lab Technician', 'Laboratory', 'HOPE/LAB/001', '{}', true),
('Mr. Sachin Patil', 'Technical Staff', 'X-Ray Technician', 'Radiology', 'HOPE/RAD/001', '{}', true),
('Mr. Gaurav Chute', 'Technical Staff', 'Maintenance Incharge', 'Maintenance', 'HOPE/MNT/001', '{}', true),
('Ms. Sonali Wankhede', 'Admin', 'Front Desk Executive', 'Front Office', 'HOPE/FD/001', '{}', true),
('Mr. Suraj Gedam', 'Admin', 'Billing Executive', 'Billing', 'HOPE/BIL/001', '{}', true),
('Mr. Vijay Kohad', 'Support Staff', 'Housekeeping Supervisor', 'Housekeeping', 'HOPE/HK/001', '{}', true),
('Mr. Rahul Meshram', 'Support Staff', 'Housekeeping Staff', 'Housekeeping', 'HOPE/HK/002', '{}', true),
('Mr. Akash Sahare', 'Support Staff', 'Housekeeping Staff', 'Housekeeping', 'HOPE/HK/003', '{}', true)
ON CONFLICT (id) DO NOTHING; -- Assuming ID is auto-generated

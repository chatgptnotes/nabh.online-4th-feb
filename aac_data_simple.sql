-- ===============================================
-- Simplified AAC Data INSERT - Manual Approach
-- Run these step by step if the automated script fails
-- ===============================================

-- STEP 1: First, get your AAC Chapter ID by running this query:
-- SELECT id, name FROM public.nabh_chapters WHERE name = 'AAC';
-- Copy the id value and replace 'YOUR_AAC_CHAPTER_ID' below

-- STEP 2: Insert AAC Standards (Replace YOUR_AAC_CHAPTER_ID with actual ID)
INSERT INTO public.nabh_standards (chapter_id, standard_number, name, description) VALUES
('YOUR_AAC_CHAPTER_ID', '1', 'Healthcare Services Definition', 'The organization defines and displays the healthcare services that it provides.'),
('YOUR_AAC_CHAPTER_ID', '2', 'Registration, Admission and Transfer Process', 'The organization has a well-defined registration, admission and transfer process.'),
('YOUR_AAC_CHAPTER_ID', '3', 'Patient Assessment and Re-assessment', 'Patients cared for by the organization undergo an established initial assessment and regular re-assessment.'),
('YOUR_AAC_CHAPTER_ID', '4', 'Laboratory Services', 'Laboratory services are provided as per the scope of services of the organization and adhere to best practices.'),
('YOUR_AAC_CHAPTER_ID', '5', 'Imaging Services', 'Imaging services are provided as per the scope of services of the organization and adhere to best practices.'),
('YOUR_AAC_CHAPTER_ID', '6', 'Laboratory and Imaging Safety Programme', 'There is an established safety programme in the laboratory and imaging services.'),
('YOUR_AAC_CHAPTER_ID', '7', 'Continuous Multidisciplinary Care', 'Patient care is continuous and multidisciplinary in nature.'),
('YOUR_AAC_CHAPTER_ID', '8', 'Discharge Process', 'The organization has an established discharge process, and defines the content of the discharge summary.');

-- STEP 3: Get Standard IDs by running this query:
-- SELECT id, standard_number FROM public.nabh_standards WHERE chapter_id = 'YOUR_AAC_CHAPTER_ID' ORDER BY standard_number;
-- Copy the IDs and replace below

-- STEP 4: Insert Objective Elements for AAC.1 (Replace STANDARD_1_ID with actual ID)
INSERT INTO public.nabh_objective_elements (standard_id, element_number, description, interpretation, is_core, status) VALUES
('STANDARD_1_ID', 'a', 'The healthcare services being provided are defined and are in consonance with the needs of the community.', 'Hospital must conduct community health needs assessment and ensure services align with identified needs.', false, 'Not Started'),
('STANDARD_1_ID', 'b', 'Each defined healthcare service should have diagnostic and treatment services with suitably qualified personnel who provide out-patient, in-patient and emergency cover.', 'Ensure adequate staffing with appropriate qualifications for all service areas.', false, 'Not Started'),
('STANDARD_1_ID', 'c', 'Scope of healthcare services of each department is defined.', 'Create detailed scope of service documents for each department.', false, 'Not Started'),
('STANDARD_1_ID', 'd', 'The organization''s defined healthcare services are prominently displayed.', 'Install clear signage and information boards displaying all services.', false, 'Not Started');

-- STEP 5: Insert Objective Elements for AAC.2 (Replace STANDARD_2_ID with actual ID)
INSERT INTO public.nabh_objective_elements (standard_id, element_number, description, interpretation, is_core, status) VALUES
('STANDARD_2_ID', 'a', 'There is a documented process for registration of patients.', 'Establish comprehensive patient registration procedures.', false, 'Not Started'),
('STANDARD_2_ID', 'b', 'There is a documented process for admission of patients.', 'Create standardized admission procedures.', false, 'Not Started'),
('STANDARD_2_ID', 'c', 'There is a documented process for transfer of patients.', 'Establish protocols for internal and external transfers.', false, 'Not Started'),
('STANDARD_2_ID', 'd', 'The processes are understood by all concerned staff.', 'Provide comprehensive training to all staff.', false, 'Not Started');

-- STEP 6: Insert Objective Elements for AAC.3 (Replace STANDARD_3_ID with actual ID)
INSERT INTO public.nabh_objective_elements (standard_id, element_number, description, interpretation, is_core, status) VALUES
('STANDARD_3_ID', 'a', 'There is a documented process for initial assessment of patients.', 'Establish comprehensive initial assessment protocols.', false, 'Not Started'),
('STANDARD_3_ID', 'b', 'There is a documented process for re-assessment of patients.', 'Create protocols for regular patient reassessment.', false, 'Not Started'),
('STANDARD_3_ID', 'c', 'The assessment processes are followed by all concerned staff.', 'Ensure all clinical staff are trained on assessment protocols.', false, 'Not Started');

-- STEP 7: Insert Objective Elements for AAC.4 (Replace STANDARD_4_ID with actual ID)
INSERT INTO public.nabh_objective_elements (standard_id, element_number, description, interpretation, is_core, status) VALUES
('STANDARD_4_ID', 'a', 'Laboratory services are available as per the scope of services.', 'Ensure laboratory services match the defined scope.', false, 'Not Started'),
('STANDARD_4_ID', 'b', 'Laboratory services follow established protocols and best practices.', 'Implement quality control measures and SOPs.', false, 'Not Started');

-- STEP 8: Insert Objective Elements for AAC.5 (Replace STANDARD_5_ID with actual ID)
INSERT INTO public.nabh_objective_elements (standard_id, element_number, description, interpretation, is_core, status) VALUES
('STANDARD_5_ID', 'a', 'Imaging services are available as per the scope of services.', 'Ensure imaging services match defined scope.', false, 'Not Started'),
('STANDARD_5_ID', 'b', 'Imaging services follow established protocols and best practices.', 'Implement radiation safety and quality assurance.', false, 'Not Started');

-- STEP 9: Insert Objective Elements for AAC.6 (Replace STANDARD_6_ID with actual ID)
INSERT INTO public.nabh_objective_elements (standard_id, element_number, description, interpretation, is_core, status) VALUES
('STANDARD_6_ID', 'a', 'There is a documented safety programme for laboratory services.', 'Establish comprehensive lab safety protocols.', false, 'Not Started'),
('STANDARD_6_ID', 'b', 'There is a documented safety programme for imaging services.', 'Implement radiation safety protocols.', false, 'Not Started'),
('STANDARD_6_ID', 'c', 'Safety programmes are implemented and monitored.', 'Conduct regular safety audits and monitoring.', false, 'Not Started');

-- STEP 10: Insert Objective Elements for AAC.7 (Replace STANDARD_7_ID with actual ID)
INSERT INTO public.nabh_objective_elements (standard_id, element_number, description, interpretation, is_core, status) VALUES
('STANDARD_7_ID', 'a', 'There are documented processes for continuous patient care.', 'Establish protocols for seamless patient care.', false, 'Not Started'),
('STANDARD_7_ID', 'b', 'There are documented processes for multidisciplinary care.', 'Create multidisciplinary team structures.', false, 'Not Started');

-- STEP 11: Insert Objective Elements for AAC.8 (Replace STANDARD_8_ID with actual ID)
INSERT INTO public.nabh_objective_elements (standard_id, element_number, description, interpretation, is_core, status) VALUES
('STANDARD_8_ID', 'a', 'There is a documented discharge process.', 'Establish comprehensive discharge procedures.', false, 'Not Started'),
('STANDARD_8_ID', 'b', 'The content of discharge summary is defined.', 'Standardize discharge summary format.', false, 'Not Started');

-- ===============================================
-- Final Result: 8 Standards + 23 Objective Elements
-- ===============================================
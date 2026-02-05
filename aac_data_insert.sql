-- ===============================================
-- AAC Chapter Standards and Objective Elements
-- Complete SQL INSERT script for NABH database
-- ===============================================

BEGIN;

-- Get the AAC chapter ID (assuming it exists in nabh_chapters table)
-- Replace 'your-aac-chapter-id' with actual ID from your nabh_chapters table

-- Step 1: Insert AAC Standards
INSERT INTO public.nabh_standards (id, chapter_id, standard_number, name, description, created_at, updated_at) VALUES
(uuid_generate_v4(), (SELECT id FROM public.nabh_chapters WHERE name = 'AAC'), '1', 'Healthcare Services Definition', 'The organization defines and displays the healthcare services that it provides.', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_chapters WHERE name = 'AAC'), '2', 'Registration, Admission and Transfer Process', 'The organization has a well-defined registration, admission and transfer process.', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_chapters WHERE name = 'AAC'), '3', 'Patient Assessment and Re-assessment', 'Patients cared for by the organization undergo an established initial assessment and regular re-assessment.', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_chapters WHERE name = 'AAC'), '4', 'Laboratory Services', 'Laboratory services are provided as per the scope of services of the organization and adhere to best practices.', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_chapters WHERE name = 'AAC'), '5', 'Imaging Services', 'Imaging services are provided as per the scope of services of the organization and adhere to best practices.', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_chapters WHERE name = 'AAC'), '6', 'Laboratory and Imaging Safety Programme', 'There is an established safety programme in the laboratory and imaging services.', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_chapters WHERE name = 'AAC'), '7', 'Continuous Multidisciplinary Care', 'Patient care is continuous and multidisciplinary in nature.', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_chapters WHERE name = 'AAC'), '8', 'Discharge Process', 'The organization has an established discharge process, and defines the content of the discharge summary.', NOW(), NOW());

-- Step 2: Insert AAC.1 Objective Elements
INSERT INTO public.nabh_objective_elements (id, standard_id, element_number, description, interpretation, is_core, status, assignee, evidence_links, notes, created_at, updated_at) VALUES
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '1' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'a', 'The healthcare services being provided are defined and are in consonance with the needs of the community.', 'Hospital must conduct community health needs assessment and ensure services align with identified needs. Document service scope and rationale.', false, 'Not Started', '', '', 'Conduct community needs assessment and document service alignment', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '1' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'b', 'Each defined healthcare service should have diagnostic and treatment services with suitably qualified personnel who provide out-patient, in-patient and emergency cover.', 'Ensure adequate staffing with appropriate qualifications for all service areas. Maintain 24/7 coverage for emergency services.', false, 'Not Started', '', '', 'Review staffing patterns and qualifications for all services', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '1' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'c', 'Scope of healthcare services of each department is defined.', 'Create detailed scope of service documents for each department outlining capabilities, limitations, and protocols.', false, 'Not Started', '', '', 'Develop department-wise service scope documents', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '1' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'd', 'The organization''s defined healthcare services are prominently displayed.', 'Install clear signage and information boards displaying all available services in patient and visitor areas.', false, 'Not Started', '', '', 'Create and install service display boards and signage', NOW(), NOW());

-- Step 3: Insert AAC.2 Objective Elements
INSERT INTO public.nabh_objective_elements (id, standard_id, element_number, description, interpretation, is_core, status, assignee, evidence_links, notes, created_at, updated_at) VALUES
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '2' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'a', 'There is a documented process for registration of patients.', 'Establish comprehensive patient registration procedures including identity verification, insurance processing, and documentation requirements.', false, 'Not Started', '', '', 'Document patient registration process and train staff', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '2' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'b', 'There is a documented process for admission of patients.', 'Create standardized admission procedures including bed allocation, initial assessment, and documentation protocols.', false, 'Not Started', '', '', 'Develop admission process documentation and workflows', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '2' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'c', 'There is a documented process for transfer of patients.', 'Establish protocols for internal transfers between departments and external transfers to other facilities.', false, 'Not Started', '', '', 'Create transfer protocols and communication procedures', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '2' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'd', 'The processes are understood by all concerned staff.', 'Provide comprehensive training to all staff involved in registration, admission, and transfer processes.', false, 'Not Started', '', '', 'Conduct staff training and maintain competency records', NOW(), NOW());

-- Step 4: Insert AAC.3 Objective Elements
INSERT INTO public.nabh_objective_elements (id, standard_id, element_number, description, interpretation, is_core, status, assignee, evidence_links, notes, created_at, updated_at) VALUES
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '3' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'a', 'There is a documented process for initial assessment of patients.', 'Establish comprehensive initial assessment protocols including medical history, physical examination, and risk assessment.', false, 'Not Started', '', '', 'Develop initial assessment protocols and forms', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '3' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'b', 'There is a documented process for re-assessment of patients.', 'Create protocols for regular patient reassessment including frequency, parameters, and documentation requirements.', false, 'Not Started', '', '', 'Establish reassessment schedules and monitoring protocols', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '3' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'c', 'The assessment processes are followed by all concerned staff.', 'Ensure all clinical staff are trained on assessment protocols and compliance is monitored.', false, 'Not Started', '', '', 'Train staff and implement compliance monitoring', NOW(), NOW());

-- Step 5: Insert AAC.4 Objective Elements
INSERT INTO public.nabh_objective_elements (id, standard_id, element_number, description, interpretation, is_core, status, assignee, evidence_links, notes, created_at, updated_at) VALUES
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '4' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'a', 'Laboratory services are available as per the scope of services.', 'Ensure laboratory services match the defined scope and are available when needed for patient care.', false, 'Not Started', '', '', 'Review lab service availability and scope alignment', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '4' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'b', 'Laboratory services follow established protocols and best practices.', 'Implement quality control measures, standard operating procedures, and best practice guidelines.', false, 'Not Started', '', '', 'Develop lab SOPs and quality control protocols', NOW(), NOW());

-- Step 6: Insert AAC.5 Objective Elements
INSERT INTO public.nabh_objective_elements (id, standard_id, element_number, description, interpretation, is_core, status, assignee, evidence_links, notes, created_at, updated_at) VALUES
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '5' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'a', 'Imaging services are available as per the scope of services.', 'Ensure imaging services match the defined scope and equipment is properly maintained and calibrated.', false, 'Not Started', '', '', 'Review imaging service availability and equipment status', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '5' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'b', 'Imaging services follow established protocols and best practices.', 'Implement radiation safety protocols, quality assurance programs, and best practice guidelines.', false, 'Not Started', '', '', 'Develop imaging SOPs and safety protocols', NOW(), NOW());

-- Step 7: Insert AAC.6 Objective Elements
INSERT INTO public.nabh_objective_elements (id, standard_id, element_number, description, interpretation, is_core, status, assignee, evidence_links, notes, created_at, updated_at) VALUES
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '6' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'a', 'There is a documented safety programme for laboratory services.', 'Establish comprehensive lab safety protocols including chemical safety, infection control, and waste management.', false, 'Not Started', '', '', 'Develop laboratory safety program and protocols', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '6' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'b', 'There is a documented safety programme for imaging services.', 'Implement radiation safety protocols, protective equipment requirements, and exposure monitoring.', false, 'Not Started', '', '', 'Create imaging safety program and radiation protection protocols', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '6' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'c', 'Safety programmes are implemented and monitored.', 'Ensure safety protocols are followed, conduct regular safety audits, and maintain incident reporting systems.', false, 'Not Started', '', '', 'Implement safety monitoring and audit procedures', NOW(), NOW());

-- Step 8: Insert AAC.7 Objective Elements
INSERT INTO public.nabh_objective_elements (id, standard_id, element_number, description, interpretation, is_core, status, assignee, evidence_links, notes, created_at, updated_at) VALUES
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '7' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'a', 'There are documented processes for continuous patient care.', 'Establish protocols for seamless patient care across shifts, departments, and care transitions.', false, 'Not Started', '', '', 'Develop continuous care protocols and handover procedures', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '7' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'b', 'There are documented processes for multidisciplinary care.', 'Create multidisciplinary team structures, communication protocols, and care coordination mechanisms.', false, 'Not Started', '', '', 'Establish multidisciplinary team protocols and coordination systems', NOW(), NOW());

-- Step 9: Insert AAC.8 Objective Elements
INSERT INTO public.nabh_objective_elements (id, standard_id, element_number, description, interpretation, is_core, status, assignee, evidence_links, notes, created_at, updated_at) VALUES
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '8' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'a', 'There is a documented discharge process.', 'Establish comprehensive discharge procedures including planning, patient education, and follow-up arrangements.', false, 'Not Started', '', '', 'Develop discharge planning process and protocols', NOW(), NOW()),
(uuid_generate_v4(), (SELECT id FROM public.nabh_standards WHERE standard_number = '8' AND chapter_id = (SELECT id FROM public.nabh_chapters WHERE name = 'AAC')), 'b', 'The content of discharge summary is defined.', 'Standardize discharge summary format including diagnosis, treatment, medications, and follow-up instructions.', false, 'Not Started', '', '', 'Create standardized discharge summary template and requirements', NOW(), NOW());

COMMIT;

-- ===============================================
-- Summary:
-- - 8 AAC Standards inserted
-- - 23 AAC Objective Elements inserted
-- - All with proper foreign key relationships
-- ===============================================
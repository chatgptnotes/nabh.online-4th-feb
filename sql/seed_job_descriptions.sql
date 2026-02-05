-- First, ensure the table exists
CREATE TABLE IF NOT EXISTS nabh_document_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  version VARCHAR(20) DEFAULT '1.0',
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert all 16 Job Descriptions into Level 3 (Work Instructions)

INSERT INTO nabh_document_levels (level, title, description, version, status) VALUES
(3, 'JD - Consultant Doctor',
'Designation: Consultant
Department: Clinical
Reports To: Medical Superintendent

Qualification:
• MD/MS/DNB (Relevant Specialty)
• Valid Medical Council Registration

Key Responsibilities:
• Provide comprehensive patient care as per clinical protocols
• Perform diagnosis, treatment, and procedures within scope of practice
• Maintain accurate and timely medical records
• Participate in clinical audits, mortality & morbidity meetings
• Ensure patient safety and informed consent
• Adhere to NABH, ethical, and legal guidelines
• Participate in infection control and quality improvement activities

NABH Responsibilities:
• Follow standard treatment guidelines
• Ensure documentation completeness
• Report adverse events and near misses
• Participate in CQI programs', '1.0', 'Active'),

(3, 'JD - Duty Doctor',
'Department: Clinical
Reports To: Consultant / Medical Superintendent

Qualification:
• MBBS with valid registration

Key Responsibilities:
• Monitor admitted patients and respond to emergencies
• Implement consultant instructions
• Maintain patient medical records
• Coordinate with nursing and support staff
• Ensure timely investigations and referrals
• Counsel patients and relatives

NABH Focus:
• Patient identification & safety protocols
• Medication safety
• Handover documentation', '1.0', 'Active'),

(3, 'JD - Infection Control Nurse (ICN)',
'Department: Nursing / Quality
Reports To: Infection Control Officer

Qualification:
• B.Sc / GNM with Infection Control Training

Key Responsibilities:
• Implement Hospital Infection Control Program
• Conduct surveillance of HAI
• Monitor hand hygiene and biomedical waste practices
• Conduct staff training on infection prevention
• Maintain infection control records and reports

NABH Focus:
• HIC Committee coordination
• Incident reporting
• Policy compliance', '1.0', 'Active'),

(3, 'JD - ICU Nurse',
'Department: Nursing
Reports To: Nursing Supervisor

Qualification:
• B.Sc Nursing / GNM with ICU experience

Key Responsibilities:
• Provide critical care nursing services
• Monitor vitals and life-support equipment
• Administer medications safely
• Maintain ICU documentation
• Assist in procedures and emergencies
• Communicate patient condition to doctors and relatives

NABH Focus:
• High-risk patient safety
• Medication & device safety
• Infection control compliance', '1.0', 'Active'),

(3, 'JD - General Ward & Private Ward Nurse',
'Department: Nursing
Reports To: Nursing In-charge

Qualification:
• GNM / B.Sc Nursing

Key Responsibilities:
• Provide nursing care as per care plan
• Administer medications and treatments
• Monitor patient condition and report changes
• Maintain nursing notes
• Educate patients and attendants

NABH Focus:
• Patient rights & education
• Safe medication practices
• Proper documentation', '1.0', 'Active'),

(3, 'JD - Pharmacist',
'Department: Pharmacy
Reports To: Pharmacy In-charge

Qualification:
• D.Pharm / B.Pharm with registration

Key Responsibilities:
• Dispense medications accurately
• Maintain drug inventory and cold chain
• Check prescriptions for safety and legality
• Counsel patients on medication usage
• Ensure LASA drug management

NABH Focus:
• Medication safety
• Expiry and storage compliance
• Prescription audit support', '1.0', 'Active'),

(3, 'JD - Pathologist',
'Department: Laboratory
Reports To: Medical Superintendent

Qualification:
• MD Pathology with registration

Key Responsibilities:
• Supervise laboratory testing and reporting
• Ensure accuracy and quality control
• Validate reports before release
• Guide lab technicians
• Participate in lab audits

NABH Focus:
• Quality assurance
• Critical value reporting
• Turnaround time monitoring', '1.0', 'Active'),

(3, 'JD - X-Ray Technician',
'Department: Radiology
Reports To: Radiologist / Department Head

Qualification:
• Diploma / Degree in Radiology Technology

Key Responsibilities:
• Perform imaging procedures safely
• Ensure radiation safety
• Maintain imaging records
• Equipment care and calibration support

NABH Focus:
• Patient identification
• Radiation safety protocols
• Documentation accuracy', '1.0', 'Active'),

(3, 'JD - Dialysis Technician / Nurse',
'Department: Dialysis
Reports To: Dialysis In-charge

Qualification:
• Dialysis Technician Course / Nursing

Key Responsibilities:
• Prepare and monitor dialysis procedures
• Maintain dialysis machines and consumables
• Monitor patient vitals during dialysis
• Maintain dialysis records
• Follow infection control protocols strictly

NABH Focus:
• High-risk infection prevention
• Equipment safety
• Documentation', '1.0', 'Active'),

(3, 'JD - OT Nurse',
'Department: Operation Theatre
Reports To: OT In-charge

Qualification:
• GNM / B.Sc Nursing with OT training

Key Responsibilities:
• Assist in surgical procedures
• Maintain sterile environment
• Prepare OT instruments and consumables
• Maintain OT records and checklists

NABH Focus:
• Surgical safety checklist
• Sterilization compliance
• Count protocols', '1.0', 'Active'),

(3, 'JD - OT Technician',
'Department: Operation Theatre
Reports To: OT In-charge

Qualification:
• OT Technician Course

Key Responsibilities:
• Prepare OT equipment and instruments
• Assist surgeons and nurses
• Ensure proper sterilization
• Maintain OT equipment

NABH Focus:
• Equipment safety
• Infection control
• Documentation', '1.0', 'Active'),

(3, 'JD - Reception Staff',
'Department: Front Office
Reports To: Administration

Qualification:
• Graduate with communication skills

Key Responsibilities:
• Patient registration and guidance
• Appointment scheduling
• Patient identification and billing coordination
• Handle patient queries politely

NABH Focus:
• Patient rights & confidentiality
• Accurate patient identification', '1.0', 'Active'),

(3, 'JD - Billing Staff',
'Department: Accounts
Reports To: Accounts Manager

Qualification:
• Graduate with billing software knowledge

Key Responsibilities:
• Prepare accurate bills
• Explain charges to patients
• Coordinate with departments
• Maintain billing records

NABH Focus:
• Transparency in billing
• Documentation accuracy', '1.0', 'Active'),

(3, 'JD - Security Guard',
'Department: Security
Reports To: Security Supervisor

Qualification:
• Basic education with security training

Key Responsibilities:
• Control hospital entry & exit
• Ensure safety of patients and staff
• Assist during emergencies
• Enforce hospital policies

NABH Focus:
• Safety & security management
• Incident reporting', '1.0', 'Active'),

(3, 'JD - Housekeeping Staff',
'Department: Housekeeping
Reports To: Housekeeping Supervisor

Qualification:
• Basic education with training

Key Responsibilities:
• Maintain cleanliness of hospital areas
• Follow cleaning schedules
• Handle biomedical waste correctly
• Use PPE appropriately

NABH Focus:
• Infection control
• BMW segregation', '1.0', 'Active'),

(3, 'JD - Patient Attendant',
'Department: Nursing Support
Reports To: Nursing In-charge

Qualification:
• Basic education

Key Responsibilities:
• Assist patients with mobility and daily needs
• Transport patients safely
• Support nursing staff
• Maintain patient dignity

NABH Focus:
• Patient safety
• Compassionate care', '1.0', 'Active');

-- Verify the inserts
SELECT COUNT(*) as total_jds FROM nabh_document_levels WHERE level = 3;

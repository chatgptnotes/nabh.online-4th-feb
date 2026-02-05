-- =====================================================
-- CLINICAL AUDITS TABLE FOR HOPE HOSPITAL
-- Total: 5 Default Audits for NABH Compliance
-- =====================================================

-- Create the clinical_audits table
CREATE TABLE IF NOT EXISTS clinical_audits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    audit_type VARCHAR(30) NOT NULL,
    department VARCHAR(100),
    auditor VARCHAR(100),
    start_date DATE,
    completion_date DATE,
    status VARCHAR(30) DEFAULT 'Planned',
    frequency VARCHAR(30) DEFAULT 'Quarterly',
    criteria TEXT[],
    findings TEXT[],
    recommendations TEXT[],
    action_items TEXT[],
    compliance INTEGER DEFAULT 0,
    samples_reviewed INTEGER DEFAULT 0,
    total_samples INTEGER DEFAULT 0,
    nabh_standard VARCHAR(30),
    priority VARCHAR(20) DEFAULT 'Medium',
    follow_up_date DATE,
    documents_link VARCHAR(500),
    hospital_id VARCHAR(50) DEFAULT 'hope-hospital',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_clinical_audits_hospital ON clinical_audits(hospital_id);
CREATE INDEX IF NOT EXISTS idx_clinical_audits_category ON clinical_audits(category);
CREATE INDEX IF NOT EXISTS idx_clinical_audits_status ON clinical_audits(status);
CREATE INDEX IF NOT EXISTS idx_clinical_audits_priority ON clinical_audits(priority);
CREATE INDEX IF NOT EXISTS idx_clinical_audits_department ON clinical_audits(department);

-- Clear existing data (if re-running)
DELETE FROM clinical_audits WHERE hospital_id = 'hope-hospital';

-- =====================================================
-- INSERT CLINICAL AUDITS DATA
-- Based on NABH Requirements for Hope Hospital
-- =====================================================

INSERT INTO clinical_audits (
    title, description, category, audit_type, department, auditor,
    start_date, completion_date, status, frequency, criteria, findings,
    recommendations, action_items, compliance, samples_reviewed,
    total_samples, nabh_standard, priority, follow_up_date, documents_link
) VALUES

-- 1. Hand Hygiene Compliance Audit - NABH Priority
(
    'Hand Hygiene Compliance Audit - NABH Priority',
    'Critical NABH audit for hand hygiene compliance across Hope Hospital - WHO 5 Moments focus',
    'Infection Control',
    'Internal',
    'Infection Control',
    'Shilpi',
    '2026-02-04',
    NULL,
    'Planned',
    'Monthly',
    ARRAY[
        'WHO 5 Moments: Before patient contact',
        'WHO 5 Moments: Before clean/aseptic procedures',
        'WHO 5 Moments: After body fluid exposure',
        'WHO 5 Moments: After patient contact',
        'WHO 5 Moments: After contact with patient surroundings',
        'Proper technique (20 seconds soap/water or alcohol rub)',
        'Availability of hand hygiene stations'
    ],
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    ARRAY[
        'Observe 50 hand hygiene opportunities across all departments',
        'Document compliance for each WHO moment',
        'Provide immediate feedback to staff',
        'Identify areas needing additional dispensers',
        'Schedule re-audit after 3 days of intervention'
    ],
    0,
    0,
    50,
    'HIC.1',
    'High',
    '2026-02-10',
    ''
),

-- 2. Medication Error Prevention Audit
(
    'Medication Error Prevention Audit',
    'Quarterly review of medication administration processes and error prevention',
    'Medication Safety',
    'Internal',
    'Pharmacy',
    'Abhishek',
    '2026-01-15',
    NULL,
    'In Progress',
    'Quarterly',
    ARRAY[
        '5 Rights of medication administration followed',
        'Double-check system implemented',
        'High-alert medications properly labeled',
        'Patient identification process correct'
    ],
    ARRAY[
        'Medication errors reduced by 35% from previous quarter',
        'Double-check compliance: 92%',
        'High-alert medication labeling: 98%',
        '3 near-miss events identified and resolved'
    ],
    ARRAY[
        'Implement barcode scanning system',
        'Enhance nurse training on high-alert medications',
        'Create standardized medication reconciliation form',
        'Establish medication safety committee'
    ],
    ARRAY[
        'Procure barcode scanners',
        'Schedule high-alert medication training',
        'Design medication reconciliation form',
        'Form medication safety committee'
    ],
    92,
    180,
    200,
    'PCC.8',
    'High',
    '2026-03-01',
    ''
),

-- 3. Patient Fall Prevention Audit
(
    'Patient Fall Prevention Audit',
    'Assessment of fall prevention protocols and patient safety measures',
    'Patient Safety',
    'Internal',
    'Nursing',
    'Sonali',
    '2025-12-01',
    '2025-12-31',
    'Completed',
    'Quarterly',
    ARRAY[
        'Fall risk assessment completed within 24 hours',
        'Appropriate fall prevention measures implemented',
        'Patient and family education provided',
        'Environmental safety measures in place'
    ],
    ARRAY[
        'Fall risk assessments completed: 95%',
        'Prevention measures implemented: 90%',
        'Patient education completion: 85%',
        '2 falls occurred during audit period'
    ],
    ARRAY[
        'Standardize fall risk assessment tool',
        'Improve patient education materials',
        'Enhance environmental safety rounds',
        'Implement hourly rounding protocol'
    ],
    ARRAY[
        'Update fall risk assessment forms',
        'Create patient education pamphlets',
        'Schedule safety rounds training',
        'Pilot hourly rounding in high-risk areas'
    ],
    90,
    150,
    150,
    'PSQ.3',
    'Medium',
    '2026-02-28',
    ''
),

-- 4. Medical Records Documentation Audit
(
    'Medical Records Documentation Audit',
    'Review of medical record completeness and documentation quality',
    'Documentation',
    'Internal',
    'Medical Records',
    'Azhar',
    '2026-02-01',
    NULL,
    'Planned',
    'Monthly',
    ARRAY[
        'Medical records completed within 48 hours',
        'All required signatures present',
        'Diagnosis and treatment plans documented',
        'Discharge summary completed before patient leaves'
    ],
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    ARRAY[
        'Schedule audit training session',
        'Prepare audit checklists',
        'Coordinate with clinical departments',
        'Set up audit documentation system'
    ],
    0,
    0,
    200,
    'MOM.1',
    'Medium',
    NULL,
    ''
),

-- 5. Patient Identification Audit
(
    'Patient Identification Audit',
    'Critical patient safety audit to ensure proper patient identification protocols',
    'Patient Safety',
    'Internal',
    'Quality Department',
    'Sonali',
    '2026-02-04',
    NULL,
    'Planned',
    'Monthly',
    ARRAY[
        'Patient wristband present with 2 identifiers (Name + UHID)',
        'Staff verify patient identity before medication administration',
        'Staff verify patient identity before procedures',
        'Wristband information matches medical records',
        'Missing/damaged bands replaced immediately'
    ],
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    ARRAY[
        'Conduct systematic check of all admitted patients',
        'Replace any missing or damaged identification bands',
        'Train staff on proper verification protocols',
        'Document non-compliance and corrective actions'
    ],
    0,
    0,
    100,
    'PSQ.1',
    'High',
    '2026-02-10',
    ''
),

-- 6. Surgical Safety Checklist Audit (Additional)
(
    'Surgical Safety Checklist Audit',
    'WHO Surgical Safety Checklist compliance audit for OT procedures',
    'Patient Safety',
    'Internal',
    'Operation Theatre',
    'Farsana',
    '2026-01-01',
    NULL,
    'In Progress',
    'Monthly',
    ARRAY[
        'Sign In: Patient identity confirmed',
        'Sign In: Site marked',
        'Sign In: Anesthesia safety check complete',
        'Time Out: Team members introduced',
        'Time Out: Surgery/site/side confirmed',
        'Sign Out: Counts complete',
        'Sign Out: Specimen labeled'
    ],
    ARRAY[
        'Checklist compliance: 94%',
        'Time Out compliance: 97%',
        'Sign In compliance: 92%',
        'Sign Out compliance: 89%'
    ],
    ARRAY[
        'Reinforce Sign Out documentation',
        'Conduct refresher training for all OT staff',
        'Display checklist prominently in OT'
    ],
    ARRAY[
        'Schedule OT staff training',
        'Create visual reminders for OT',
        'Implement daily checklist verification'
    ],
    94,
    85,
    90,
    'PSQ.2',
    'High',
    '2026-02-15',
    ''
),

-- 7. Infection Control Practices Audit (Additional)
(
    'Infection Control Practices Audit',
    'Comprehensive audit of infection control practices across all departments',
    'Infection Control',
    'Internal',
    'Infection Control',
    'Shilpi',
    '2025-11-01',
    '2025-12-15',
    'Completed',
    'Quarterly',
    ARRAY[
        'PPE usage compliance',
        'Waste segregation at source',
        'Needle stick injury reporting',
        'Sterilization protocols followed',
        'Clean linen management'
    ],
    ARRAY[
        'PPE compliance: 91%',
        'Waste segregation: 88%',
        'Sterilization compliance: 96%',
        'Zero needle stick injuries reported',
        'Clean linen compliance: 94%'
    ],
    ARRAY[
        'Improve waste segregation training',
        'Enhance PPE availability at all points',
        'Continue needle stick awareness program'
    ],
    ARRAY[
        'Conduct waste segregation workshop',
        'Procure additional PPE supplies',
        'Update infection control manual'
    ],
    91,
    120,
    120,
    'HIC.2',
    'High',
    '2026-03-15',
    ''
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all audits inserted
-- SELECT title, category, status, compliance, nabh_standard FROM clinical_audits ORDER BY title;

-- Count by category
-- SELECT category, COUNT(*) as count FROM clinical_audits GROUP BY category ORDER BY count DESC;

-- Count by status
-- SELECT status, COUNT(*) as count FROM clinical_audits GROUP BY status;

-- High priority audits
-- SELECT title, department, auditor, status FROM clinical_audits WHERE priority = 'High';

-- Audits by compliance level
-- SELECT title, compliance, status FROM clinical_audits WHERE compliance > 0 ORDER BY compliance DESC;

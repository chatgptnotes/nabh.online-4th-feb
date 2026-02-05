-- =====================================================
-- HOSPITAL PROGRAMS TABLE FOR HOPE HOSPITAL
-- Total: 4 Default Programs for NABH Compliance
-- =====================================================

-- Create the hospital_programs table
CREATE TABLE IF NOT EXISTS hospital_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    coordinator VARCHAR(100),
    department VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(30) DEFAULT 'Active',
    objectives TEXT[],
    outcomes TEXT[],
    budget DECIMAL(12, 2),
    participants INTEGER DEFAULT 0,
    frequency VARCHAR(30) DEFAULT 'Monthly',
    nabh_relevant BOOLEAN DEFAULT true,
    hospital_id VARCHAR(50) DEFAULT 'hope-hospital',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_hospital_programs_hospital ON hospital_programs(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_programs_category ON hospital_programs(category);
CREATE INDEX IF NOT EXISTS idx_hospital_programs_status ON hospital_programs(status);
CREATE INDEX IF NOT EXISTS idx_hospital_programs_nabh ON hospital_programs(nabh_relevant);

-- Clear existing data (if re-running)
DELETE FROM hospital_programs WHERE hospital_id = 'hope-hospital';

-- =====================================================
-- INSERT HOSPITAL PROGRAMS DATA
-- Based on NABH Requirements for Hope Hospital
-- =====================================================

INSERT INTO hospital_programs (
    name, description, category, coordinator, department,
    start_date, end_date, status, objectives, outcomes,
    participants, frequency, nabh_relevant
) VALUES

-- 1. Hand Hygiene Compliance Program
(
    'Hand Hygiene Compliance Program',
    'Hospital-wide initiative to improve hand hygiene compliance among all healthcare workers',
    'Infection Control',
    'Shilpi',
    'Infection Control',
    '2025-01-01',
    NULL,
    'Active',
    ARRAY[
        'Achieve 95% hand hygiene compliance',
        'Reduce healthcare-associated infections by 20%',
        'Conduct monthly training sessions'
    ],
    ARRAY[
        'Current compliance rate: 88%',
        'HAI reduction: 15% in last quarter',
        'Training completed: 250 staff members'
    ],
    450,
    'Monthly',
    true
),

-- 2. Patient Safety Rounds
(
    'Patient Safety Rounds',
    'Regular patient safety rounds conducted by multidisciplinary teams',
    'Patient Safety',
    'Sonali',
    'Quality',
    '2025-06-01',
    NULL,
    'Active',
    ARRAY[
        'Identify patient safety risks proactively',
        'Improve communication between departments',
        'Implement corrective actions promptly'
    ],
    ARRAY[
        'Safety incidents reduced by 30%',
        'Patient satisfaction improved by 15%',
        'Communication gaps identified and resolved'
    ],
    85,
    'Weekly',
    true
),

-- 3. Code Blue Training Program
(
    'Code Blue Training Program',
    'Comprehensive training program for cardiac arrest response',
    'Training',
    'Farsana',
    'Nursing',
    '2025-03-01',
    '2025-12-31',
    'Completed',
    ARRAY[
        'Train all clinical staff in Code Blue procedures',
        'Reduce response time to <3 minutes',
        'Improve survival rates'
    ],
    ARRAY[
        '100% staff training completed',
        'Average response time: 2.5 minutes',
        'Survival rate improved by 25%'
    ],
    320,
    'Quarterly',
    true
),

-- 4. Medication Safety Initiative
(
    'Medication Safety Initiative',
    'Program to reduce medication errors and improve pharmacy protocols',
    'Patient Safety',
    'Abhishek',
    'Pharmacy',
    '2025-02-01',
    NULL,
    'Active',
    ARRAY[
        'Reduce medication errors by 40%',
        'Implement double-check procedures',
        'Upgrade pharmacy information system'
    ],
    ARRAY[
        'Medication errors reduced by 35%',
        'Double-check system implemented',
        'New pharmacy system operational'
    ],
    25,
    'Monthly',
    true
),

-- 5. Quality Improvement Program (Additional)
(
    'Continuous Quality Improvement (CQI) Program',
    'Systematic approach to improve hospital services and patient outcomes through PDCA cycles',
    'Quality Improvement',
    'Sonali',
    'Quality',
    '2024-01-01',
    NULL,
    'Active',
    ARRAY[
        'Implement PDCA cycles for all departments',
        'Track and improve key quality indicators',
        'Conduct quarterly quality audits',
        'Achieve NABH standards compliance'
    ],
    ARRAY[
        '12 PDCA cycles completed',
        'Quality indicators improved by 22%',
        '100% departments audited',
        'NABH pre-assessment score: 85%'
    ],
    150,
    'Quarterly',
    true
),

-- 6. Community Health Outreach (Additional)
(
    'Community Health Screening Program',
    'Free health screening camps and awareness programs for the local community',
    'Community Health',
    'Dr. Shiraz Khan',
    'Outpatient',
    '2025-04-01',
    NULL,
    'Active',
    ARRAY[
        'Conduct monthly health camps',
        'Screen 500+ community members per quarter',
        'Provide health education and awareness',
        'Refer critical cases for treatment'
    ],
    ARRAY[
        '8 health camps conducted',
        '1,850 community members screened',
        '45 critical cases referred for treatment',
        'Diabetes & Hypertension awareness sessions completed'
    ],
    1850,
    'Monthly',
    true
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all programs inserted
-- SELECT name, category, status, participants, nabh_relevant FROM hospital_programs ORDER BY name;

-- Count by category
-- SELECT category, COUNT(*) as count FROM hospital_programs GROUP BY category ORDER BY count DESC;

-- Count by status
-- SELECT status, COUNT(*) as count FROM hospital_programs GROUP BY status;

-- Active NABH relevant programs
-- SELECT name, coordinator, department FROM hospital_programs WHERE status = 'Active' AND nabh_relevant = true;

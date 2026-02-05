-- Emergency Codes Master Tables
-- Run this in Supabase SQL Editor

-- 1. Emergency Codes Protocols Table
CREATE TABLE IF NOT EXISTS public.emergency_code_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_type TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#666666',
    icon TEXT DEFAULT 'warning',
    response_time TEXT,
    activation_criteria TEXT[],
    response_team JSONB,
    equipment_required TEXT[],
    hospital_id TEXT DEFAULT 'hope',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Emergency Code Documents Table
CREATE TABLE IF NOT EXISTS public.emergency_code_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id TEXT NOT NULL,
    code_type TEXT NOT NULL REFERENCES public.emergency_code_protocols(code_type),
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    frequency TEXT,
    mandatory_fields TEXT[],
    template TEXT,
    evidence_requirement TEXT,
    nabh_standard TEXT[],
    responsible_person TEXT,
    review_frequency TEXT,
    hospital_id TEXT DEFAULT 'hope',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.emergency_code_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_code_documents ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
DROP POLICY IF EXISTS "Allow all actions" ON public.emergency_code_protocols;
CREATE POLICY "Allow all actions" ON public.emergency_code_protocols FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all actions" ON public.emergency_code_documents;
CREATE POLICY "Allow all actions" ON public.emergency_code_documents FOR ALL USING (true) WITH CHECK (true);

-- 5. Insert Emergency Code Protocols
INSERT INTO public.emergency_code_protocols (code_type, name, description, color, icon, response_time, activation_criteria, response_team, equipment_required)
VALUES
(
    'CODE_BLUE',
    'Medical Emergency Response',
    'Cardiac arrest, respiratory failure, and life-threatening medical emergencies',
    '#2196f3',
    'medical',
    '≤ 3 minutes',
    ARRAY['Cardiac arrest (no pulse, no breathing)', 'Respiratory arrest', 'Severe respiratory distress', 'Unconscious patient', 'Any life-threatening emergency'],
    '{"teamLeader": "Senior Doctor on duty", "primaryNurse": "Emergency trained RN", "pharmacist": "For emergency medications", "technician": "For equipment support", "security": "For crowd control"}'::jsonb,
    ARRAY['Crash Cart', 'Defibrillator', 'Airway Management Kit', 'Emergency Medications', 'Oxygen Supply', 'Suction Machine']
),
(
    'CODE_RED',
    'Fire Emergency Response',
    'Fire, smoke, and combustion-related emergencies requiring evacuation',
    '#f44336',
    'fire',
    '≤ 5 minutes evacuation',
    ARRAY['Fire detected', 'Smoke detected', 'Fire alarm activated', 'Smell of burning', 'Electrical fire hazard'],
    '{"fireOfficer": "Security In-charge", "evacuationLead": "Nursing Supervisor", "assemblyPoint": "Designated safe zone", "fireTeam": "Trained fire response team"}'::jsonb,
    ARRAY['Fire Extinguishers', 'Fire Blankets', 'Emergency Exit Signs', 'PA System', 'Evacuation Maps', 'First Aid Kit']
),
(
    'CODE_PINK',
    'Infant/Child Security',
    'Missing infant, child abduction, or infant security breach',
    '#e91e63',
    'child',
    '≤ 2 minutes lockdown',
    ARRAY['Missing infant from nursery', 'Unauthorized person near pediatric area', 'Child not found with parent', 'Security band removed', 'Suspicious activity near children'],
    '{"securityLead": "Security Supervisor", "nursingLead": "Pediatric Nursing In-charge", "entranceGuards": "All entrance security", "searchTeam": "Available staff"}'::jsonb,
    ARRAY['Security Bands', 'CCTV Monitoring', 'Door Locks', 'PA System', 'Communication Devices', 'Photo Records']
)
ON CONFLICT (code_type) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    response_time = EXCLUDED.response_time,
    updated_at = NOW();

-- 6. Insert Code Blue Documents
INSERT INTO public.emergency_code_documents (doc_id, code_type, document_type, title, description, category, frequency, mandatory_fields, template, evidence_requirement, nabh_standard, responsible_person, review_frequency)
VALUES
(
    'CB_SOP_001',
    'CODE_BLUE',
    'SOP',
    'Code Blue Standard Operating Procedure',
    'Complete protocol for medical emergency response',
    'Protocol Documentation',
    'Permanent',
    ARRAY['Emergency type', 'Location', 'Time of call', 'Response team', 'Patient details', 'Clinical status', 'Interventions performed', 'Outcome', 'Team leader signature'],
    '# CODE BLUE - MEDICAL EMERGENCY PROTOCOL
**Hope Hospital Emergency Response SOP**

## ACTIVATION CRITERIA
- Cardiac arrest (no pulse, no breathing)
- Respiratory arrest (not breathing, has pulse)
- Severe respiratory distress
- Unconscious patient with unknown cause
- Any life-threatening emergency

## RESPONSE TEAM
- **Team Leader:** Senior Doctor on duty
- **Primary Nurse:** Emergency trained RN
- **Pharmacist:** For emergency medications
- **Technician:** For equipment support
- **Security:** For crowd control and assistance

## RESPONSE PROTOCOL
### Phase 1: Immediate (0-2 minutes)
1. Call "CODE BLUE" overhead announcement
2. Announce location clearly 3 times
3. Secure airway, start CPR if needed
4. Activate crash cart to location

### Phase 2: Team Response (2-5 minutes)
1. Team leader assumes control
2. Primary nurse assists with interventions
3. Pharmacist prepares emergency drugs
4. Continuous monitoring and documentation

### Phase 3: Stabilization (5+ minutes)
1. Advanced life support measures
2. Prepare for transfer if needed
3. Family notification protocol
4. Post-incident debriefing',
    'Signed SOP with annual review, training records',
    ARRAY['ACC.7', 'ACC.7.1', 'ACC.7.2'],
    'Dr. Shiraz Navedkhan Khan - Quality Coordinator',
    'Annual'
),
(
    'CB_TRAIN_001',
    'CODE_BLUE',
    'TRAINING_RECORD',
    'Code Blue Training Documentation',
    'Staff training records and competency assessment',
    'Training Evidence',
    'Annual/New staff',
    ARRAY['Staff name', 'Department', 'Training date', 'Trainer name', 'Topics covered', 'Practical assessment', 'Competency score', 'Certification status', 'Next training due'],
    '# CODE BLUE TRAINING RECORD
**Hope Hospital Emergency Response Training**

## PARTICIPANT DETAILS
**Name:** ___________________________
**Employee ID:** ____________________
**Department:** _____________________
**Designation:** ____________________
**Training Date:** ___________________

## TRAINING MODULES COMPLETED
□ Recognition of emergency situations
□ Code Blue activation procedures
□ Basic Life Support (BLS)
□ Advanced Cardiac Life Support (ACLS)
□ Team roles and responsibilities
□ Equipment usage and maintenance
□ Documentation requirements
□ Communication protocols

## PRACTICAL ASSESSMENT
**Scenario:** Cardiac arrest in general ward
**Performance Score:** ___/100',
    'Individual training records for all staff, competency certificates',
    ARRAY['HRR.5', 'HRR.5.1', 'ACC.7.3'],
    'K J Shashank - Quality Manager/HR',
    'Annual'
),
(
    'CB_INCIDENT_001',
    'CODE_BLUE',
    'INCIDENT_FORM',
    'Code Blue Incident Report Form',
    'Documentation of actual emergency response',
    'Response Documentation',
    'Per incident',
    ARRAY['Date/time', 'Location', 'Patient ID', 'Presenting condition', 'Response team members', 'Interventions', 'Timeline', 'Outcome', 'Equipment used', 'Medications given'],
    '# CODE BLUE INCIDENT REPORT
**Hope Hospital Emergency Response Documentation**

## INCIDENT DETAILS
**Date:** ___________________________
**Time of Call:** ___________________
**Location:** _______________________
**Reported by:** ____________________

## PATIENT INFORMATION
**Patient ID:** _____________________
**Name:** ___________________________
**Age/Gender:** ____________________

## OUTCOME
□ Patient stabilized
□ Transferred to ICU
□ Transferred to higher center
□ Declared dead',
    'Complete incident reports for all activations, signed by team leader',
    ARRAY['ACC.7.4', 'QMS.6'],
    'Dr. Sachin - Senior Doctor',
    'Per incident'
),
(
    'CB_DRILL_001',
    'CODE_BLUE',
    'DRILL_REPORT',
    'Code Blue Drill Documentation',
    'Regular training drill reports and evaluation',
    'Training Drills',
    'Quarterly',
    ARRAY['Drill date', 'Scenario', 'Participants', 'Response time', 'Performance evaluation', 'Areas for improvement', 'Action plan'],
    '# CODE BLUE DRILL REPORT
**Hope Hospital Quarterly Emergency Drill**

## DRILL DETAILS
**Date:** ____________________________
**Time:** ____________________________
**Location:** ________________________

## PERFORMANCE METRICS
**Response Time:**
- Code called to first responder: ______ minutes
- Team assembly: ______ minutes

**Team Performance Score:** ____/100',
    'Quarterly drill reports with evaluation and action plans',
    ARRAY['ACC.7.5', 'HRR.5.2'],
    'Gaurav Agrawal - NABH Coordination Lead',
    'Quarterly'
);

-- 7. Insert Code Red Documents
INSERT INTO public.emergency_code_documents (doc_id, code_type, document_type, title, description, category, frequency, mandatory_fields, template, evidence_requirement, nabh_standard, responsible_person, review_frequency)
VALUES
(
    'CR_SOP_001',
    'CODE_RED',
    'SOP',
    'Code Red Fire Emergency SOP',
    'Complete protocol for fire emergency response and evacuation',
    'Protocol Documentation',
    'Permanent',
    ARRAY['Fire location', 'Type of fire', 'Evacuation status', 'Fire brigade called', 'Injuries if any', 'Property damage'],
    '# CODE RED - FIRE EMERGENCY PROTOCOL
**Hope Hospital Fire Response SOP**

## RACE PROTOCOL
- **R** - RESCUE anyone in immediate danger
- **A** - ALARM - Activate fire alarm
- **C** - CONTAIN - Close doors to contain fire
- **E** - EXTINGUISH/EVACUATE

## EVACUATION ROUTES
- Primary: Main corridor to Assembly Point A
- Secondary: Emergency stairs to Assembly Point B
- ICU/Critical: Horizontal evacuation first',
    'Signed SOP, fire drill records, equipment maintenance logs',
    ARRAY['FMS.4', 'FMS.4.1', 'FMS.4.2'],
    'Security In-charge',
    'Annual'
),
(
    'CR_DRILL_001',
    'CODE_RED',
    'DRILL_REPORT',
    'Fire Drill Documentation',
    'Fire evacuation drill reports',
    'Training Drills',
    'Quarterly',
    ARRAY['Drill date', 'Evacuation time', 'Participants', 'Assembly point count', 'Issues identified'],
    '# FIRE DRILL REPORT
**Hope Hospital Fire Safety Drill**

## DRILL DETAILS
**Date:** ____________________________
**Evacuation Time:** _________________ minutes
**Total Evacuated:** _________________ persons

## ASSEMBLY POINT COUNT
- Assembly Point A: ______ persons
- Assembly Point B: ______ persons',
    'Quarterly fire drill reports with evacuation times',
    ARRAY['FMS.4.3', 'FMS.4.4'],
    'Fire Safety Officer',
    'Quarterly'
);

-- 8. Insert Code Pink Documents
INSERT INTO public.emergency_code_documents (doc_id, code_type, document_type, title, description, category, frequency, mandatory_fields, template, evidence_requirement, nabh_standard, responsible_person, review_frequency)
VALUES
(
    'CP_SOP_001',
    'CODE_PINK',
    'SOP',
    'Code Pink Infant Security SOP',
    'Protocol for infant/child security emergencies',
    'Protocol Documentation',
    'Permanent',
    ARRAY['Missing child details', 'Last seen location', 'Time reported', 'Search areas', 'Lockdown status'],
    '# CODE PINK - INFANT SECURITY PROTOCOL
**Hope Hospital Child Safety SOP**

## IMMEDIATE ACTIONS
1. Announce CODE PINK with location
2. Initiate hospital lockdown
3. Security to all exits
4. Search team deployment

## IDENTIFICATION
- Photo of child (from records)
- Security band details
- Parent/guardian details',
    'Signed SOP, security band logs, CCTV records',
    ARRAY['COP.1.4', 'COP.8.5'],
    'Pediatric Nursing In-charge',
    'Annual'
),
(
    'CP_DRILL_001',
    'CODE_PINK',
    'DRILL_REPORT',
    'Code Pink Drill Documentation',
    'Infant security drill reports',
    'Training Drills',
    'Quarterly',
    ARRAY['Drill date', 'Lockdown time', 'Search completion time', 'Staff response', 'Gaps identified'],
    '# CODE PINK DRILL REPORT
**Hope Hospital Infant Security Drill**

## DRILL METRICS
**Lockdown Time:** _______ minutes
**Search Completion:** _______ minutes
**All Exits Secured:** □ Yes □ No',
    'Quarterly drill reports',
    ARRAY['COP.1.5', 'COP.8.6'],
    'Security Supervisor',
    'Quarterly'
);

-- 9. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_emergency_protocols_code_type ON public.emergency_code_protocols(code_type);
CREATE INDEX IF NOT EXISTS idx_emergency_documents_code_type ON public.emergency_code_documents(code_type);
CREATE INDEX IF NOT EXISTS idx_emergency_documents_doc_type ON public.emergency_code_documents(document_type);

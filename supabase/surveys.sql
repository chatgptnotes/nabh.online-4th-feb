-- Surveys Table for NABH Evidence Creator
-- Run this in Supabase SQL Editor

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE survey_type AS ENUM ('patient_satisfaction', 'staff_satisfaction', 'feedback', 'quality_assessment', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE survey_status AS ENUM ('draft', 'active', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE survey_frequency AS ENUM ('one_time', 'weekly', 'monthly', 'quarterly', 'annually');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('rating', 'multiple_choice', 'text', 'yes_no', 'scale');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Main Surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    survey_type survey_type NOT NULL DEFAULT 'custom',
    status survey_status NOT NULL DEFAULT 'draft',
    target_audience TEXT,
    start_date DATE,
    end_date DATE,
    response_count INTEGER DEFAULT 0,
    created_by TEXT,
    nabh_relevant BOOLEAN DEFAULT false,
    frequency survey_frequency DEFAULT 'one_time',
    hospital_id TEXT DEFAULT 'hope',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Questions table
CREATE TABLE IF NOT EXISTS survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type question_type NOT NULL DEFAULT 'text',
    options TEXT[] DEFAULT '{}',
    required BOOLEAN DEFAULT true,
    category TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Responses table (for storing actual responses)
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_id TEXT,
    respondent_type TEXT, -- 'patient', 'staff', 'visitor', 'consultant'
    responses JSONB DEFAULT '{}',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    completion_time INTEGER -- in minutes
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_surveys_hospital_id ON surveys(hospital_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_type ON surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);

-- Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for surveys
DROP POLICY IF EXISTS "Allow public read on surveys" ON surveys;
CREATE POLICY "Allow public read on surveys" ON surveys FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on surveys" ON surveys;
CREATE POLICY "Allow public insert on surveys" ON surveys FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on surveys" ON surveys;
CREATE POLICY "Allow public update on surveys" ON surveys FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on surveys" ON surveys;
CREATE POLICY "Allow public delete on surveys" ON surveys FOR DELETE USING (true);

-- RLS Policies for survey_questions
DROP POLICY IF EXISTS "Allow public read on survey_questions" ON survey_questions;
CREATE POLICY "Allow public read on survey_questions" ON survey_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on survey_questions" ON survey_questions;
CREATE POLICY "Allow public insert on survey_questions" ON survey_questions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on survey_questions" ON survey_questions;
CREATE POLICY "Allow public update on survey_questions" ON survey_questions FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on survey_questions" ON survey_questions;
CREATE POLICY "Allow public delete on survey_questions" ON survey_questions FOR DELETE USING (true);

-- RLS Policies for survey_responses
DROP POLICY IF EXISTS "Allow public read on survey_responses" ON survey_responses;
CREATE POLICY "Allow public read on survey_responses" ON survey_responses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on survey_responses" ON survey_responses;
CREATE POLICY "Allow public insert on survey_responses" ON survey_responses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on survey_responses" ON survey_responses;
CREATE POLICY "Allow public update on survey_responses" ON survey_responses FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on survey_responses" ON survey_responses;
CREATE POLICY "Allow public delete on survey_responses" ON survey_responses FOR DELETE USING (true);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_surveys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_surveys_updated_at ON surveys;
CREATE TRIGGER trigger_surveys_updated_at
    BEFORE UPDATE ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_surveys_updated_at();

-- =====================================================
-- INSERT SAMPLE SURVEYS
-- =====================================================

-- 1. Staff Satisfaction Survey
INSERT INTO surveys (id, title, description, survey_type, status, target_audience, start_date, end_date, response_count, created_by, nabh_relevant, frequency, hospital_id)
VALUES (
    'b1c2d3e4-f5a6-7890-bcde-f12345678901',
    'Staff Satisfaction Survey',
    'Comprehensive staff satisfaction assessment for NABH compliance',
    'staff_satisfaction',
    'draft',
    'All hospital staff (doctors, nurses, admin, support)',
    '2026-02-04',
    '2026-03-06',
    43,
    'Dr. Shiraz (Quality Coordinator)',
    true,
    'quarterly',
    'hope'
);

-- 2. Patient Satisfaction Survey
INSERT INTO surveys (id, title, description, survey_type, status, target_audience, start_date, end_date, response_count, created_by, nabh_relevant, frequency, hospital_id)
VALUES (
    'b1c2d3e4-f5a6-7890-bcde-f12345678902',
    'Patient Satisfaction Survey',
    'Patient experience and satisfaction assessment',
    'patient_satisfaction',
    'draft',
    'All patients and their families',
    '2026-02-04',
    '2026-03-06',
    39,
    'Dr. Shiraz (Quality Coordinator)',
    true,
    'monthly',
    'hope'
);

-- 3. Quality Assessment Survey
INSERT INTO surveys (id, title, description, survey_type, status, target_audience, start_date, end_date, response_count, created_by, nabh_relevant, frequency, hospital_id)
VALUES (
    'b1c2d3e4-f5a6-7890-bcde-f12345678903',
    'Quality Assessment Survey',
    'Internal quality assessment and improvement feedback',
    'quality_assessment',
    'draft',
    'Department heads and quality coordinators',
    '2026-02-04',
    '2026-03-06',
    25,
    'Dr. Shiraz (Quality Coordinator)',
    true,
    'monthly',
    'hope'
);

-- =====================================================
-- INSERT QUESTIONS FOR STAFF SATISFACTION SURVEY
-- =====================================================

INSERT INTO survey_questions (survey_id, question, question_type, required, category, sort_order) VALUES
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'How satisfied are you with your overall work experience at Hope Hospital?', 'rating', true, 'General Satisfaction', 1),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'How would you rate the work environment and workplace culture?', 'rating', true, 'Work Environment', 2),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'How satisfied are you with the support provided by your immediate supervisor/manager?', 'rating', true, 'Management', 3),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'How satisfied are you with career development and training opportunities?', 'rating', true, 'Professional Development', 4),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'How would you rate your work-life balance?', 'rating', true, 'Work-Life Balance', 5),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'How effective is communication within your department and across departments?', 'rating', true, 'Communication', 6),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'Do you have adequate resources and equipment to perform your job effectively?', 'yes_no', true, 'Resources', 7),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'How satisfied are you with workplace safety protocols and infection control measures?', 'rating', true, 'Safety', 8),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'Would you recommend Hope Hospital as a good place to work?', 'yes_no', true, 'Recommendation', 9),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'How satisfied are you with the compensation and benefits?', 'rating', true, 'Compensation', 10),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'Do you feel valued and recognized for your contributions?', 'rating', true, 'Recognition', 11),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'How would you rate the quality of patient care at Hope Hospital?', 'rating', true, 'Patient Care', 12),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'Are you aware of and do you follow hospital policies and procedures?', 'yes_no', true, 'Compliance', 13),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'How satisfied are you with the grievance redressal mechanism?', 'rating', true, 'Grievance', 14),
('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'What suggestions do you have for improving the work environment?', 'text', false, 'Suggestions', 15);

-- =====================================================
-- INSERT QUESTIONS FOR PATIENT SATISFACTION SURVEY
-- =====================================================

INSERT INTO survey_questions (survey_id, question, question_type, required, category, sort_order) VALUES
('b1c2d3e4-f5a6-7890-bcde-f12345678902', 'How would you rate your overall experience at Hope Hospital?', 'rating', true, 'Overall Experience', 1),
('b1c2d3e4-f5a6-7890-bcde-f12345678902', 'How satisfied were you with the admission process?', 'rating', true, 'Admission', 2),
('b1c2d3e4-f5a6-7890-bcde-f12345678902', 'How would you rate the cleanliness and hygiene of the hospital?', 'rating', true, 'Cleanliness', 3),
('b1c2d3e4-f5a6-7890-bcde-f12345678902', 'How satisfied were you with the behavior and attitude of nursing staff?', 'rating', true, 'Nursing Care', 4),
('b1c2d3e4-f5a6-7890-bcde-f12345678902', 'How satisfied were you with the attention and care provided by doctors?', 'rating', true, 'Doctor Care', 5),
('b1c2d3e4-f5a6-7890-bcde-f12345678902', 'Were you adequately informed about your diagnosis and treatment plan?', 'yes_no', true, 'Communication', 6),
('b1c2d3e4-f5a6-7890-bcde-f12345678902', 'How would you rate the food quality and service?', 'rating', true, 'Food Service', 7),
('b1c2d3e4-f5a6-7890-bcde-f12345678902', 'How satisfied were you with the discharge process?', 'rating', true, 'Discharge', 8),
('b1c2d3e4-f5a6-7890-bcde-f12345678902', 'Would you recommend Hope Hospital to your friends and family?', 'yes_no', true, 'Recommendation', 9),
('b1c2d3e4-f5a6-7890-bcde-f12345678902', 'Any suggestions for improvement?', 'text', false, 'Suggestions', 10);

-- =====================================================
-- INSERT QUESTIONS FOR QUALITY ASSESSMENT SURVEY
-- =====================================================

INSERT INTO survey_questions (survey_id, question, question_type, required, category, sort_order) VALUES
('b1c2d3e4-f5a6-7890-bcde-f12345678903', 'How would you rate the overall quality of services in your department?', 'rating', true, 'Service Quality', 1),
('b1c2d3e4-f5a6-7890-bcde-f12345678903', 'Are quality indicators being monitored and reported regularly?', 'yes_no', true, 'Quality Monitoring', 2),
('b1c2d3e4-f5a6-7890-bcde-f12345678903', 'How effective are the current quality improvement initiatives?', 'rating', true, 'QI Initiatives', 3),
('b1c2d3e4-f5a6-7890-bcde-f12345678903', 'What areas need immediate quality improvement?', 'text', true, 'Improvement Areas', 4);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

SELECT 'Total Surveys: ' || COUNT(*) as info FROM surveys;
SELECT 'Total Questions: ' || COUNT(*) as info FROM survey_questions;

-- View surveys with question count
SELECT
    s.title,
    s.survey_type,
    s.status,
    s.response_count,
    COUNT(q.id) as question_count
FROM surveys s
LEFT JOIN survey_questions q ON s.id = q.survey_id
GROUP BY s.id, s.title, s.survey_type, s.status, s.response_count
ORDER BY s.created_at DESC;

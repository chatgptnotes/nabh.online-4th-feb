-- Create table for storing SOP improvement feedback
CREATE TABLE IF NOT EXISTS sop_improvement_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chapter_code VARCHAR(10),
    objective_code VARCHAR(20),
    feedback_data JSONB,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sop_feedback_chapter ON sop_improvement_feedback(chapter_code);
CREATE INDEX idx_sop_feedback_objective ON sop_improvement_feedback(objective_code);
CREATE INDEX idx_sop_feedback_user ON sop_improvement_feedback(user_id);
CREATE INDEX idx_sop_feedback_created ON sop_improvement_feedback(created_at);

-- Enable RLS
ALTER TABLE sop_improvement_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can insert their own feedback" ON sop_improvement_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all feedback" ON sop_improvement_feedback
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own feedback" ON sop_improvement_feedback
    FOR UPDATE USING (auth.uid() = user_id);
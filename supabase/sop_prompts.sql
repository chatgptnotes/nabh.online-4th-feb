-- SOP Prompts Table
-- Stores AI prompts for SOP generation and documentation

CREATE TABLE IF NOT EXISTS public.nabh_sop_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  hospital_id TEXT DEFAULT 'hope',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.nabh_sop_prompts ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust for production use)
CREATE POLICY "Allow all operations on sop_prompts"
  ON public.nabh_sop_prompts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for hospital filtering
CREATE INDEX IF NOT EXISTS idx_sop_prompts_hospital ON public.nabh_sop_prompts(hospital_id);

-- Index for active prompts
CREATE INDEX IF NOT EXISTS idx_sop_prompts_active ON public.nabh_sop_prompts(is_active);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_sop_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sop_prompts_updated_at ON public.nabh_sop_prompts;
CREATE TRIGGER trigger_sop_prompts_updated_at
  BEFORE UPDATE ON public.nabh_sop_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_sop_prompts_updated_at();

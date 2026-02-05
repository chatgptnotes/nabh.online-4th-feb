// Quick migration script for SOP Prompts table
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aynoltymgusyasgxshng.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bm9sdHltZ3VzeWFzZ3hzaG5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk2MzYyMCwiZXhwIjoyMDgzNTM5NjIwfQ.YCsx3oWDUkxjb7Mv_DllNU3Bue_5YWYZD7aHDikLcjU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const sql = `
-- Create the SOP Prompts table
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

-- Enable RLS
ALTER TABLE public.nabh_sop_prompts ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations on sop_prompts" ON public.nabh_sop_prompts;

-- Create policy
CREATE POLICY "Allow all operations on sop_prompts"
  ON public.nabh_sop_prompts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sop_prompts_hospital ON public.nabh_sop_prompts(hospital_id);
CREATE INDEX IF NOT EXISTS idx_sop_prompts_active ON public.nabh_sop_prompts(is_active);
`;

async function runMigration() {
  console.log('Running SOP Prompts migration...');

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // Try alternative approach - direct SQL via REST API
    console.log('RPC not available, trying fetch approach...');

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      console.log('Direct SQL execution not available via API.');
      console.log('Please run the SQL manually in Supabase Dashboard > SQL Editor');
      console.log('SQL file location: supabase/sop_prompts.sql');
      return false;
    }
  }

  console.log('Migration completed successfully!');
  return true;
}

runMigration().catch(console.error);

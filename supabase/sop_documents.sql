-- SOP Documents Table Setup
-- Run this in Supabase SQL Editor to fix RLS policy

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.nabh_sop_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_code TEXT NOT NULL,
    chapter_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    google_drive_url TEXT,
    google_drive_file_id TEXT,
    extracted_content TEXT,
    version TEXT DEFAULT '1.0',
    effective_date DATE,
    review_date DATE,
    category TEXT DEFAULT 'Procedure',
    department TEXT,
    author TEXT,
    status TEXT DEFAULT 'Active',
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    created_by TEXT,
    hospital_id TEXT DEFAULT 'hope',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.nabh_sop_documents ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any
DROP POLICY IF EXISTS "Allow all actions" ON public.nabh_sop_documents;
DROP POLICY IF EXISTS "Allow public read" ON public.nabh_sop_documents;
DROP POLICY IF EXISTS "Allow public insert" ON public.nabh_sop_documents;
DROP POLICY IF EXISTS "Allow public update" ON public.nabh_sop_documents;
DROP POLICY IF EXISTS "Allow public delete" ON public.nabh_sop_documents;

-- 4. Create permissive policy for all operations
CREATE POLICY "Allow all actions" ON public.nabh_sop_documents
FOR ALL USING (true) WITH CHECK (true);

-- 5. Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_sop_chapter_code ON public.nabh_sop_documents(chapter_code);
CREATE INDEX IF NOT EXISTS idx_sop_status ON public.nabh_sop_documents(status);
CREATE INDEX IF NOT EXISTS idx_sop_hospital_id ON public.nabh_sop_documents(hospital_id);

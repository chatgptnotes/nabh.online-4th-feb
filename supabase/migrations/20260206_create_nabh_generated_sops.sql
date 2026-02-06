-- =============================================
-- NABH Generated SOPs - Complete Storage Solution
-- Created: 2026-02-06
-- Purpose: Store F2, F3, F4, Final SOP HTML & PDF
-- =============================================

-- =============================================
-- 1. CREATE STORAGE BUCKET FOR SOP PDFs
-- =============================================
-- Run this in Supabase Dashboard > Storage > New Bucket
-- Bucket Name: sop-documents
-- Public: Yes

-- Or run via SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sop-documents',
  'sop-documents',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. STORAGE POLICIES
-- =============================================
-- Public read access
CREATE POLICY "Public read SOP PDFs" ON storage.objects
FOR SELECT USING (bucket_id = 'sop-documents');

-- Anyone can upload (for now)
CREATE POLICY "Allow upload SOP PDFs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'sop-documents');

-- Anyone can update
CREATE POLICY "Allow update SOP PDFs" ON storage.objects
FOR UPDATE USING (bucket_id = 'sop-documents');

-- Anyone can delete
CREATE POLICY "Allow delete SOP PDFs" ON storage.objects
FOR DELETE USING (bucket_id = 'sop-documents');

-- =============================================
-- 3. CREATE MAIN SOP TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.nabh_generated_sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Chapter Reference
  chapter_id UUID REFERENCES nabh_chapters(id) ON DELETE CASCADE,
  chapter_code TEXT NOT NULL,
  chapter_name TEXT,

  -- F2: Objective Element (Dropdown selection)
  objective_code TEXT NOT NULL,
  objective_title TEXT NOT NULL,

  -- F3: Title (from NABH standard)
  f3_title TEXT,

  -- F4: Interpretation
  f4_interpretation TEXT,

  -- Generated SOP Content
  sop_html_content TEXT NOT NULL,
  sop_text_content TEXT,

  -- PDF Storage
  pdf_url TEXT,
  pdf_file_path TEXT,
  pdf_file_size INTEGER,

  -- Document Metadata
  document_number TEXT,
  version TEXT DEFAULT '1.0',
  department TEXT DEFAULT 'Quality Department',
  category TEXT DEFAULT 'Administrative',
  effective_date DATE DEFAULT CURRENT_DATE,
  review_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year'),

  -- Status & Tracking
  status TEXT DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Under Review', 'Archived')),
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Tags for search
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- =============================================
-- 4. CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_nabh_generated_sops_chapter_code
ON public.nabh_generated_sops(chapter_code);

CREATE INDEX IF NOT EXISTS idx_nabh_generated_sops_objective_code
ON public.nabh_generated_sops(objective_code);

CREATE INDEX IF NOT EXISTS idx_nabh_generated_sops_status
ON public.nabh_generated_sops(status);

CREATE INDEX IF NOT EXISTS idx_nabh_generated_sops_created_at
ON public.nabh_generated_sops(created_at DESC);

-- Composite index for chapter + objective lookup
CREATE INDEX IF NOT EXISTS idx_nabh_generated_sops_chapter_objective
ON public.nabh_generated_sops(chapter_code, objective_code);

-- =============================================
-- 5. AUTO-UPDATE TIMESTAMP TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_nabh_generated_sops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS nabh_generated_sops_updated_at ON public.nabh_generated_sops;

CREATE TRIGGER nabh_generated_sops_updated_at
BEFORE UPDATE ON public.nabh_generated_sops
FOR EACH ROW
EXECUTE FUNCTION update_nabh_generated_sops_updated_at();

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.nabh_generated_sops ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read nabh_generated_sops"
ON public.nabh_generated_sops FOR SELECT USING (true);

-- Insert policy
CREATE POLICY "Allow insert nabh_generated_sops"
ON public.nabh_generated_sops FOR INSERT WITH CHECK (true);

-- Update policy
CREATE POLICY "Allow update nabh_generated_sops"
ON public.nabh_generated_sops FOR UPDATE USING (true);

-- Delete policy
CREATE POLICY "Allow delete nabh_generated_sops"
ON public.nabh_generated_sops FOR DELETE USING (true);

-- =============================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =============================================
COMMENT ON TABLE public.nabh_generated_sops IS 'Stores all generated SOPs with F2, F3, F4 data and PDF files';
COMMENT ON COLUMN public.nabh_generated_sops.objective_code IS 'F2: Objective Element code (e.g., AAC.1.a)';
COMMENT ON COLUMN public.nabh_generated_sops.objective_title IS 'F2: Full objective title text';
COMMENT ON COLUMN public.nabh_generated_sops.f3_title IS 'F3: Title from NABH standard';
COMMENT ON COLUMN public.nabh_generated_sops.f4_interpretation IS 'F4: Interpretation text';
COMMENT ON COLUMN public.nabh_generated_sops.sop_html_content IS 'Final generated SOP in HTML format';
COMMENT ON COLUMN public.nabh_generated_sops.pdf_url IS 'Public URL of uploaded PDF in storage bucket';
COMMENT ON COLUMN public.nabh_generated_sops.pdf_file_path IS 'File path within sop-documents bucket';

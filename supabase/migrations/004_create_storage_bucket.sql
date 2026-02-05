-- Migration: Create storage bucket for NABH evidence files
-- This bucket stores infographics and other evidence files

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nabh-evidence',
  'nabh-evidence',
  true,
  52428800, -- 50MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- Allow public read access to all files
CREATE POLICY "Public read access for nabh-evidence" ON storage.objects
  FOR SELECT USING (bucket_id = 'nabh-evidence');

-- Allow authenticated uploads (using anon key)
CREATE POLICY "Allow uploads to nabh-evidence" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'nabh-evidence');

-- Allow updates/overwrites
CREATE POLICY "Allow updates to nabh-evidence" ON storage.objects
  FOR UPDATE USING (bucket_id = 'nabh-evidence');

-- Allow deletes
CREATE POLICY "Allow deletes from nabh-evidence" ON storage.objects
  FOR DELETE USING (bucket_id = 'nabh-evidence');

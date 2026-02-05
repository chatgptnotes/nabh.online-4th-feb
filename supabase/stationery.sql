-- 1. Create Stationery Table
CREATE TABLE IF NOT EXISTS public.stationery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    original_file_url TEXT, 
    original_file_name TEXT,
    original_file_type TEXT,
    extracted_text TEXT,
    analyzed_data JSONB, 
    improved_content TEXT,
    user_suggestions TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    documents_link TEXT, 
    hospital_id TEXT DEFAULT 'hope', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.stationery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON public.stationery_items;
CREATE POLICY "Allow all actions" ON public.stationery_items FOR ALL USING (true) WITH CHECK (true);

-- 3. Setup Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('stationery', 'stationery', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow Public Upload" ON storage.objects;
CREATE POLICY "Allow Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'stationery');

DROP POLICY IF EXISTS "Allow Public Access" ON storage.objects;
CREATE POLICY "Allow Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'stationery');

-- 4. Insert Default Data
INSERT INTO public.stationery_items 
(name, category, description, status, user_suggestions, hospital_id)
VALUES 
('Patient Registration Form', 'forms', 'Complete patient admission and registration form', 'pending', '{}', 'hope'),
('Patient History Form', 'forms', 'Comprehensive medical history documentation', 'pending', '{}', 'hope'),
('Discharge Summary Template', 'forms', 'Standardized discharge summary format', 'pending', '{}', 'hope'),
('General Surgical Consent Form', 'consent', 'Standard surgical procedure consent', 'pending', '{}', 'hope'),
('Anesthesia Consent Form', 'consent', 'Anesthesia administration consent', 'pending', '{}', 'hope'),
('Blood Transfusion Consent', 'consent', 'Blood product transfusion consent', 'pending', '{}', 'hope'),
('WHO Surgical Safety Checklist', 'checklists', 'WHO standard safety checklist', 'pending', '{}', 'hope'),
('Nursing Handover Checklist', 'checklists', 'Nursing shift handover checklist', 'pending', '{}', 'hope'),
('Code Blue Emergency Checklist', 'checklists', 'Emergency response checklist', 'pending', '{}', 'hope'),
('OPD Patient Register', 'registers', 'Outpatient daily patient log', 'pending', '{}', 'hope'),
('IPD Admission Register', 'registers', 'Inpatient tracking register', 'pending', '{}', 'hope'),
('Medication Error Register', 'registers', 'Incident reporting for errors', 'pending', '{}', 'hope'),
('Hand Hygiene SOP', 'sops', 'WHO 5 moments hand hygiene procedure', 'pending', '{}', 'hope'),
('Medication Administration SOP', 'sops', 'Safe medication administration procedure', 'pending', '{}', 'hope'),
('Infection Control SOP', 'sops', 'Hospital infection prevention procedures', 'pending', '{}', 'hope'),
('Incident Reporting Form', 'other', 'Medical incidents and near-misses form', 'pending', '{}', 'hope'),
('Sentinel Event Reporting Form', 'other', 'Critical safety events reporting form', 'pending', '{}', 'hope')
ON CONFLICT DO NOTHING;

-- 5. Fix existing data (update old hospital_id values)
UPDATE public.stationery_items SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

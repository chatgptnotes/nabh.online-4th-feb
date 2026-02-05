-- =====================================================
-- FIX RLS POLICIES FOR ALL TABLES
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. LICENSES TABLE
ALTER TABLE IF EXISTS licenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON licenses;
CREATE POLICY "Allow all actions" ON licenses FOR ALL USING (true) WITH CHECK (true);
UPDATE licenses SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- 2. HOSPITAL MANUALS TABLE
ALTER TABLE IF EXISTS hospital_manuals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON hospital_manuals;
CREATE POLICY "Allow all actions" ON hospital_manuals FOR ALL USING (true) WITH CHECK (true);
UPDATE hospital_manuals SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- 3. EMERGENCY CODE PROTOCOLS TABLE
ALTER TABLE IF EXISTS emergency_code_protocols ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON emergency_code_protocols;
CREATE POLICY "Allow all actions" ON emergency_code_protocols FOR ALL USING (true) WITH CHECK (true);
UPDATE emergency_code_protocols SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- 4. EMERGENCY CODE DOCUMENTS TABLE
ALTER TABLE IF EXISTS emergency_code_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON emergency_code_documents;
CREATE POLICY "Allow all actions" ON emergency_code_documents FOR ALL USING (true) WITH CHECK (true);
UPDATE emergency_code_documents SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- 5. STATIONERY ITEMS TABLE
ALTER TABLE IF EXISTS stationery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON stationery_items;
CREATE POLICY "Allow all actions" ON stationery_items FOR ALL USING (true) WITH CHECK (true);
UPDATE stationery_items SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- 6. SOP DOCUMENTS TABLE
ALTER TABLE IF EXISTS sop_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON sop_documents;
CREATE POLICY "Allow all actions" ON sop_documents FOR ALL USING (true) WITH CHECK (true);
UPDATE sop_documents SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- 7. DEPARTMENTS TABLE
ALTER TABLE IF EXISTS departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON departments;
CREATE POLICY "Allow all actions" ON departments FOR ALL USING (true) WITH CHECK (true);
UPDATE departments SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- 8. EQUIPMENT TABLE
ALTER TABLE IF EXISTS equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON equipment;
CREATE POLICY "Allow all actions" ON equipment FOR ALL USING (true) WITH CHECK (true);
UPDATE equipment SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- 9. COMMITTEES TABLE
ALTER TABLE IF EXISTS committees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON committees;
CREATE POLICY "Allow all actions" ON committees FOR ALL USING (true) WITH CHECK (true);
UPDATE committees SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- 10. NABH PATIENTS TABLE
ALTER TABLE IF EXISTS nabh_patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON nabh_patients;
CREATE POLICY "Allow all actions" ON nabh_patients FOR ALL USING (true) WITH CHECK (true);

-- 11. NABH TEAM MEMBERS TABLE
ALTER TABLE IF EXISTS nabh_team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON nabh_team_members;
CREATE POLICY "Allow all actions" ON nabh_team_members FOR ALL USING (true) WITH CHECK (true);

-- 12. HOSPITAL PROGRAMS TABLE
ALTER TABLE IF EXISTS hospital_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions" ON hospital_programs;
CREATE POLICY "Allow all actions" ON hospital_programs FOR ALL USING (true) WITH CHECK (true);
UPDATE hospital_programs SET hospital_id = 'hope' WHERE hospital_id = 'hope-hospital';

-- =====================================================
-- VERIFICATION - Check all tables have RLS enabled
-- =====================================================
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

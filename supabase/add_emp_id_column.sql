-- Migration: Add emp_id_no, qualification, and registration_no columns to nabh_team_members
-- Run this in Supabase SQL Editor BEFORE running seed_staff_with_ids.sql

-- Add emp_id_no column (Employee ID like H001, H002, etc.)
ALTER TABLE public.nabh_team_members
ADD COLUMN IF NOT EXISTS emp_id_no TEXT;

-- Add qualification column for doctors (M.B.B.S, B.H.M.S, B.A.M.S, B.U.M.S, etc.)
ALTER TABLE public.nabh_team_members
ADD COLUMN IF NOT EXISTS qualification TEXT;

-- Add registration_no column for doctors (Medical Council Registration Number)
ALTER TABLE public.nabh_team_members
ADD COLUMN IF NOT EXISTS registration_no TEXT;

-- Add unique index on emp_id_no to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_nabh_team_members_emp_id_no
ON public.nabh_team_members(emp_id_no)
WHERE emp_id_no IS NOT NULL;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'nabh_team_members'
AND column_name IN ('emp_id_no', 'qualification', 'registration_no');

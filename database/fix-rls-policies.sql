-- Fix RLS policies to allow anonymous report creation for demo purposes
-- Run this in your Supabase SQL editor

-- Drop existing restrictive policies for reports
DROP POLICY IF EXISTS "Authenticated users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can create reports" ON reports;

-- Create more permissive policies for demo (allow anonymous users to insert reports)
CREATE POLICY "Anyone can create reports" ON reports
    FOR INSERT TO authenticated, anon WITH CHECK (true);

-- Also allow anyone to update reports (for admin panel)
CREATE POLICY IF NOT EXISTS "Anyone can update reports" ON reports
    FOR UPDATE TO authenticated, anon USING (true);

-- Similarly for alerts (if needed)
DROP POLICY IF EXISTS "Authenticated users can create alerts" ON alerts;
CREATE POLICY "Anyone can create alerts" ON alerts
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can update alerts" ON alerts
    FOR UPDATE TO authenticated, anon USING (true);

-- Verify policies
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('reports', 'alerts', 'users') 
ORDER BY tablename, policyname;
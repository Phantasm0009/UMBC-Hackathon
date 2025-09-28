-- STEP 1: Run this in your Supabase SQL Editor to fix RLS policies
-- This will allow anonymous users to create reports (needed for the demo)

-- First, check current policies
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('reports', 'alerts', 'users') 
ORDER BY tablename, policyname;

-- Drop existing restrictive policies for reports
DROP POLICY IF EXISTS "Authenticated users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can create reports" ON reports;

-- Create new permissive policy for anonymous report creation
CREATE POLICY "Anyone can create reports for demo" ON reports
    FOR INSERT TO authenticated, anon WITH CHECK (true);

-- Also allow updates for admin functionality  
CREATE POLICY IF NOT EXISTS "Anyone can update reports for demo" ON reports
    FOR UPDATE TO authenticated, anon USING (true);

-- Ensure read access works
DROP POLICY IF EXISTS "Anyone can view reports" ON reports;
CREATE POLICY "Anyone can view reports for demo" ON reports
    FOR SELECT TO authenticated, anon USING (true);

-- Verify the new policies are in place
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reports'
ORDER BY policyname;
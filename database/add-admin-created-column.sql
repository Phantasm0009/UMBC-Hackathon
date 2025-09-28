-- Add admin_created column to reports table
-- Run this in your Supabase SQL Editor to enable admin incident creation

-- Add the admin_created column to the reports table
ALTER TABLE reports 
ADD COLUMN admin_created BOOLEAN DEFAULT FALSE;

-- Add a comment to the column
COMMENT ON COLUMN reports.admin_created IS 'Flag to indicate if this report was created by an admin user';

-- Create an index for better query performance when filtering by admin_created
CREATE INDEX idx_reports_admin_created ON reports(admin_created);

-- Update any existing admin reports (if you have any test data)
-- This is optional - you can remove this line if not needed
-- UPDATE reports SET admin_created = TRUE WHERE user_id = 'admin-user-id';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name = 'admin_created';

-- Show the updated table structure
\d reports;
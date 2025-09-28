-- Add severity column to reports table
-- Run this in your Supabase SQL Editor

-- Add the severity column to the reports table
ALTER TABLE reports 
ADD COLUMN severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high', 'critical'));

-- Add a comment to the column
COMMENT ON COLUMN reports.severity IS 'Emergency severity level assigned by admin during approval';

-- Create an index for better query performance
CREATE INDEX idx_reports_severity ON reports(severity);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name = 'severity';

-- Show all columns in the reports table
\d reports;
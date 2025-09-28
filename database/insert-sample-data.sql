-- DisasterLens Sample Data for Supabase
-- Copy and paste this entire SQL script into your Supabase SQL Editor
-- This will populate your database with realistic test data

-- Insert sample users (3 users for testing different roles)
INSERT INTO public.users (email, role) VALUES 
('citizen.user@example.com', 'citizen'),
('emergency.responder@baltimore.gov', 'responder'),  
('admin.user@disasterlens.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for foreign key references
-- We'll use the first citizen user for most reports
WITH user_ids AS (
  SELECT id, role FROM public.users ORDER BY created_at LIMIT 3
)

-- Insert sample alerts (10 alerts corresponding to the 10 Baltimore locations)
INSERT INTO public.alerts (
  type, 
  location_text, 
  latitude, 
  longitude, 
  location_lat, 
  location_lng, 
  source, 
  confidence_score, 
  description, 
  severity, 
  status,
  created_at
) VALUES 

-- 1. Baltimore Inner Harbor - Critical Fire
('fire', 'Baltimore Inner Harbor - Pier 5', 39.2864, -76.6081, 39.2864, -76.6081, 'Baltimore Fire Department', 0.95, 
'🔥 CRITICAL: Large warehouse fire spreading rapidly at Inner Harbor Pier 5. Multiple fire companies responding. Smoke visible across downtown. Immediate evacuation of nearby buildings in progress. Wind pushing flames toward tourist areas.', 
'critical', 'active', NOW() - INTERVAL '30 minutes'),

-- 2. UMBC Campus - High Priority Power Outage  
('outage', 'UMBC Campus - Academic Buildings', 39.2540, -76.7134, 39.2540, -76.7134, 'BGE Utilities', 0.92,
'⚡ HIGH PRIORITY: Major power outage affecting UMBC campus. Transformer explosion reported near library. 8,000+ students and staff affected. Emergency generators activated for critical systems. Repair crews on site.',
'high', 'investigating', NOW() - INTERVAL '20 minutes'),

-- 3. BWI Airport - Critical Storm
('storm', 'BWI Airport - Terminal Areas', 39.1754, -76.6683, 39.1754, -76.6683, 'National Weather Service', 0.96,
'🌪️ CRITICAL: Severe thunderstorm with 80+ mph winds approaching BWI Airport. Tornado watch in effect. All flights grounded. Terminal evacuation to secure areas. Massive hail reported. Emergency shelters activated.',
'critical', 'active', NOW() - INTERVAL '15 minutes'),

-- 4. Fells Point Historic District - High Priority Shelter
('shelter', 'Fells Point Historic District', 39.2838, -76.5924, 39.2838, -76.5924, 'Baltimore Emergency Management', 0.91,
'🏠 HIGH PRIORITY: Emergency evacuation of historic waterfront buildings due to structural damage from recent storm. 200+ residents need temporary shelter. Red Cross setting up emergency housing at nearby community center.',
'high', 'active', NOW() - INTERVAL '60 minutes'),

-- 5. Fort McHenry National Monument - Medium Fire
('fire', 'Fort McHenry National Monument - Visitor Center', 39.2637, -76.5802, 39.2637, -76.5802, 'National Park Service', 0.78,
'🔥 MODERATE: Small grass fire contained near Fort McHenry visitor parking area. Fire department responded quickly. No structural damage. Visitor center temporarily closed as precaution. Reopening expected this afternoon.',
'medium', 'resolved', NOW() - INTERVAL '120 minutes'),

-- 6. Johns Hopkins Hospital - Medium Power Outage
('outage', 'Johns Hopkins Hospital - Main Campus', 39.2970, -76.5929, 39.2970, -76.5929, 'Hospital Security', 0.89,
'⚡ MODERATE: Partial power outage in Johns Hopkins Hospital east wing. Backup systems functioning normally. Non-critical services temporarily suspended. Utility crews working to restore full power within 2 hours.',
'medium', 'investigating', NOW() - INTERVAL '90 minutes'),

-- 7. Camden Yards Stadium - Low Storm Damage
('storm', 'Camden Yards Stadium - Parking Lots', 39.2837, -76.6218, 39.2837, -76.6218, 'Stadium Operations', 0.73,
'🌪️ LOW PRIORITY: Minor wind damage in Camden Yards parking areas. Some signage down and debris scattered. No injuries reported. Cleanup crew dispatched. Tonight''s game proceeding as scheduled.',
'low', 'resolved', NOW() - INTERVAL '180 minutes'),

-- 8. Patapsco Valley State Park - High Priority Flood
('flood', 'Patapsco Valley State Park - Cascade Falls Trail', 39.2315, -76.7656, 39.2315, -76.7656, 'Maryland State Parks', 0.88,
'🌊 HIGH PRIORITY: Flash flood warning - Patapsco River overflowing due to heavy rainfall. Trail access roads flooded. Several hikers stranded on high ground. Water rescue teams deployed. Park closed indefinitely.',
'high', 'active', NOW() - INTERVAL '45 minutes'),

-- 9. Downtown Baltimore Business District - Medium Flood
('flood', 'Downtown Baltimore Business District - Light Street', 39.2904, -76.6122, 39.2904, -76.6122, 'Baltimore City Department of Transportation', 0.82,
'🌊 MODERATE: Street flooding on Light Street due to blocked storm drains. Several intersections have standing water. Traffic rerouted through alternate routes. Maintenance crews clearing drains. Expected resolution in 1-2 hours.',
'medium', 'investigating', NOW() - INTERVAL '150 minutes'),

-- 10. Dundalk Marine Terminal - Low Priority Shelter
('shelter', 'Dundalk Marine Terminal - Worker Areas', 39.2406, -76.5333, 39.2406, -76.5333, 'Port Authority', 0.67,
'🏠 LOW PRIORITY: Temporary shelter setup for port workers during shift change due to heavy rain. Covered break areas opened. Workers staying dry and safe. Normal operations resuming as weather clears.',
'low', 'resolved', NOW() - INTERVAL '240 minutes');

-- Insert sample reports (5 sample citizen reports with varying statuses)
INSERT INTO public.reports (
  user_id, 
  text_report, 
  image_url, 
  location_text, 
  location_lat, 
  location_lng, 
  alert_type, 
  confidence_score, 
  status, 
  severity,
  admin_created,
  created_at
) VALUES 

-- Use the citizen user ID for reports
((SELECT id FROM public.users WHERE role = 'citizen' LIMIT 1), 
'I can see heavy smoke coming from the harbor area. There are fire trucks everywhere and people are being told to evacuate. The smoke is very thick and black.',
'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400',
'Near Baltimore Inner Harbor', 39.2850, -76.6070, 'fire', 0.92, 'approved', 'high', false, NOW() - INTERVAL '35 minutes'),

((SELECT id FROM public.users WHERE role = 'citizen' LIMIT 1),
'The lights just went out across the entire UMBC campus. I heard a loud bang that sounded like an explosion from the direction of the library. Students are using flashlights to navigate.',
NULL,
'UMBC Campus Library Area', 39.2545, -76.7130, 'outage', 0.88, 'approved', 'high', false, NOW() - INTERVAL '25 minutes'),

((SELECT id FROM public.users WHERE role = 'citizen' LIMIT 1),
'Street flooding is getting worse on Light Street downtown. My car almost got stuck. Several cars have stalled in the water. Need immediate help with drainage.',
'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
'Light Street, Downtown Baltimore', 39.2900, -76.6125, 'flood', 0.85, 'pending', 'medium', false, NOW() - INTERVAL '160 minutes'),

((SELECT id FROM public.users WHERE role = 'citizen' LIMIT 1),
'Small grass fire near the Fort McHenry parking lot. Fire department is already here and it looks contained. Not too serious but wanted to report it.',
NULL,
'Fort McHenry Visitor Parking', 39.2640, -76.5800, 'fire', 0.75, 'approved', 'low', false, NOW() - INTERVAL '125 minutes'),

((SELECT id FROM public.users WHERE role = 'citizen' LIMIT 1),
'Wind damage at Camden Yards. Some signs are down in the parking area. Doesn''t look too bad but there''s debris scattered around. Hope the game tonight isn''t cancelled.',
'https://images.unsplash.com/photo-1574006652973-2b1a0799dc7d?w=400',
'Camden Yards Parking Area', 39.2835, -76.6220, 'storm', 0.70, 'rejected', NULL, false, NOW() - INTERVAL '185 minutes');

-- Verify data was inserted successfully
SELECT 'Users inserted:' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Alerts inserted:', COUNT(*) FROM public.alerts  
UNION ALL
SELECT 'Reports inserted:', COUNT(*) FROM public.reports;

-- Show a summary of the alerts data
SELECT 
  'ALERTS' as summary_type,
  type,
  severity, 
  status,
  COUNT(*) as count
FROM public.alerts 
GROUP BY type, severity, status
ORDER BY type, severity;

-- Show a summary of the reports data
SELECT 
  'REPORTS' as summary_type,
  alert_type as type,
  COALESCE(severity, 'NULL') as severity,
  status, 
  COUNT(*) as count
FROM public.reports 
WHERE alert_type IS NOT NULL
GROUP BY alert_type, severity, status
ORDER BY alert_type, severity;
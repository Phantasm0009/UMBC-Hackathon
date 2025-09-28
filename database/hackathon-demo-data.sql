-- DisasterLens Hackathon Demo Data
-- Comprehensive sample data designed to showcase all features
-- Copy and paste this entire SQL script into your Supabase SQL Editor

-- Clear existing data for clean demo (optional - remove if you want to keep existing data)
-- DELETE FROM public.reports;
-- DELETE FROM public.alerts;
-- DELETE FROM public.users;

-- Insert demo users with different roles
INSERT INTO public.users (email, role) VALUES 
-- Citizens
('demo.citizen@example.com', 'citizen'),
('sarah.reporter@gmail.com', 'citizen'),
('john.witness@yahoo.com', 'citizen'),
('maria.observer@outlook.com', 'citizen'),
-- Emergency Responders
('chief.martinez@baltimore.fire', 'responder'),
('officer.johnson@baltimore.police', 'responder'),
('dr.wilson@jhmi.edu', 'responder'),
-- Administrators
('admin.demo@disasterlens.gov', 'admin'),
('coordinator.smith@baltimore.gov', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert comprehensive alerts showcasing different scenarios and severities
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

-- CRITICAL INCIDENTS (Active emergencies requiring immediate attention)
('fire', 'Harbor East Apartments - 1000 Lancaster St', 39.2851, -76.5986, 39.2851, -76.5986, 'Baltimore City Fire Department', 0.98, 
'🔥 CRITICAL EMERGENCY: High-rise apartment fire on 15th floor spreading rapidly. 200+ residents evacuated. Multiple fire companies on scene. Avoid area - heavy smoke and emergency vehicle traffic. Water supply established, aerial ladder operations in progress.', 
'critical', 'active', NOW() - INTERVAL '12 minutes'),

('storm', 'BWI Airport - All Terminals', 39.1754, -76.6683, 39.1754, -76.6683, 'National Weather Service', 0.96,
'🌪️ CRITICAL WEATHER ALERT: Tornado spotted 5 miles west of BWI Airport moving northeast at 45 mph. All flights suspended. Terminal evacuations to lower levels in progress. Seek immediate shelter! Estimated arrival: 15-20 minutes.',
'critical', 'active', NOW() - INTERVAL '8 minutes'),

-- HIGH PRIORITY INCIDENTS (Serious situations requiring urgent response)
('flood', 'Inner Harbor Promenade - Light Street', 39.2864, -76.6072, 39.2864, -76.6072, 'Baltimore Emergency Management', 0.91,
'🌊 MAJOR FLOODING: Storm surge from harbor causing significant flooding on Light Street and Pratt Street. Water levels 3-4 feet in some areas. Harbor Tunnel entrance closed. Water rescue teams deployed. Avoid downtown waterfront area.',
'high', 'active', NOW() - INTERVAL '35 minutes'),

('outage', 'Johns Hopkins Bayview Campus', 39.2840, -76.5594, 39.2840, -76.5594, 'BGE Emergency Operations', 0.89,
'⚡ HOSPITAL POWER EMERGENCY: Main power grid failure affecting Johns Hopkins Bayview Medical Center. Emergency generators active but running at capacity. Non-essential services suspended. Utility crews working on transformer repairs.',
'high', 'investigating', NOW() - INTERVAL '22 minutes'),

('shelter', 'East Baltimore - Greenmount Ave Corridor', 39.3067, -76.5947, 39.3067, -76.5947, 'American Red Cross Maryland', 0.94,
'🏠 MASS DISPLACEMENT EVENT: Gas leak forces evacuation of 8-block area in East Baltimore. 500+ residents need temporary shelter. Emergency shelters opening at Patterson High School and Clifton Park Recreation Center. Transportation provided.',
'high', 'active', NOW() - INTERVAL '45 minutes'),

-- MEDIUM SEVERITY INCIDENTS (Ongoing situations being managed)
('fire', 'Druid Hill Park - Pavilion Area', 39.3198, -76.6436, 39.3198, -76.6436, 'Baltimore City Fire Department', 0.82,
'🔥 BRUSH FIRE CONTAINED: Large brush fire in Druid Hill Park now 80% contained. Park closed to visitors. Fire crews conducting mop-up operations. Air quality advisory in effect for surrounding neighborhoods due to smoke.',
'medium', 'investigating', NOW() - INTERVAL '2 hours'),

('outage', 'Canton Neighborhood - Boston Street', 39.2792, -76.5614, 39.2792, -76.5614, 'Baltimore Gas & Electric', 0.76,
'⚡ PLANNED POWER RESTORATION: Scheduled power restoration in Canton area following storm damage repairs. 2,500 customers affected. Estimated completion: 6:00 PM today. Cooling centers available at local community centers.',
'medium', 'investigating', NOW() - INTERVAL '4 hours'),

('flood', 'I-95 South - Fort McHenry Tunnel Approach', 39.2627, -76.5813, 39.2627, -76.5813, 'Maryland Transportation Authority', 0.88,
'🌊 ROADWAY FLOODING: Heavy rain causing flooding in Fort McHenry Tunnel approach lanes. Right lane closed southbound I-95. Traffic delays expected. Pumping operations underway. Consider alternate routes via I-695.',
'medium', 'active', NOW() - INTERVAL '1.5 hours'),

-- LOW PRIORITY INCIDENTS (Minor issues or resolved situations)
('storm', 'Federal Hill Park', 39.2772, -76.6122, 39.2772, -76.6122, 'Baltimore Parks & Recreation', 0.71,
'🌪️ STORM CLEANUP: Tree down in Federal Hill Park from earlier storm. Park partially closed while crews remove debris. Walking paths remain open. Normal operations expected to resume tomorrow morning.',
'low', 'investigating', NOW() - INTERVAL '6 hours'),

('shelter', 'Port Covington - Community Center', 39.2643, -76.6289, 39.2643, -76.6289, 'Baltimore Community Services', 0.63,
'🏠 TEMPORARY WARMING CENTER: Opened warming center at Port Covington Community Center due to unseasonably cold weather. Space for 50 individuals. Hot meals and basic services available. Transportation assistance provided.',
'low', 'active', NOW() - INTERVAL '3 hours'),

-- RESOLVED INCIDENTS (Showing incident lifecycle)
('fire', 'Fells Point - Thames Street Market', 39.2834, -76.5929, 39.2834, -76.5929, 'Baltimore City Fire Department', 0.95,
'🔥 INCIDENT RESOLVED: Kitchen fire at Thames Street restaurant fully extinguished. No injuries reported. Building damage minimal. Restaurant closed for cleanup and inspection. Adjacent businesses operating normally.',
'high', 'resolved', NOW() - INTERVAL '8 hours'),

('outage', 'University of Maryland Medical Center', 39.2959, -76.6213, 39.2959, -76.6213, 'BGE Utilities', 0.92,
'⚡ POWER RESTORED: Emergency power situation at UMMC resolved. All systems back to normal operations. Backup generators performed as expected during 3-hour outage. All scheduled surgeries proceeding.',
'high', 'resolved', NOW() - INTERVAL '5 hours');

-- Insert diverse citizen reports showcasing the AI classification system
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

-- APPROVED REPORTS (Demonstrating successful AI classification)
((SELECT id FROM public.users WHERE email = 'demo.citizen@example.com' LIMIT 1), 
'URGENT: Huge apartment fire at Harbor East! Multiple floors burning, people on balconies screaming for help. Fire trucks everywhere but the flames are spreading fast. Thick black smoke covering the whole area. This is terrifying!',
'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500',
'Harbor East High Rise - Lancaster Street', 39.2851, -76.5986, 'fire', 0.97, 'approved', 'critical', false, NOW() - INTERVAL '15 minutes'),

((SELECT id FROM public.users WHERE email = 'sarah.reporter@gmail.com' LIMIT 1),
'Major water flooding downtown! The Inner Harbor is overflowing onto Light Street. Cars are stalled in 3 feet of water. Emergency boats are pulling people from vehicles. Never seen anything like this!',
'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500',
'Inner Harbor - Light Street intersection', 39.2864, -76.6072, 'flood', 0.93, 'approved', 'high', false, NOW() - INTERVAL '40 minutes'),

((SELECT id FROM public.users WHERE email = 'john.witness@yahoo.com' LIMIT 1),
'Holy cow! Just saw a funnel cloud touch down near the airport! Sirens going off everywhere. Airport looks like it''s shutting down operations. This tornado is real and heading northeast fast!',
NULL,
'BWI Airport perimeter', 39.1754, -76.6683, 'storm', 0.89, 'approved', 'critical', false, NOW() - INTERVAL '10 minutes'),

((SELECT id FROM public.users WHERE email = 'maria.observer@outlook.com' LIMIT 1),
'Gas leak evacuation happening right now on Greenmount Ave! Police going door to door telling everyone to leave immediately. They say it could be dangerous. Families with kids and elderly people need help getting to safety.',
'https://images.unsplash.com/photo-1591732606112-6be6b9c3aed3?w=500',
'Greenmount Avenue - East Baltimore', 39.3067, -76.5947, 'shelter', 0.85, 'approved', 'high', false, NOW() - INTERVAL '48 minutes'),

-- PENDING REPORTS (Awaiting admin review - showcasing the approval workflow)
((SELECT id FROM public.users WHERE email = 'demo.citizen@example.com' LIMIT 1),
'Power outage affecting our whole neighborhood in Canton. Traffic lights are out too which is causing problems. Seems like a pretty big area is affected. Not sure if this is storm related or equipment failure.',
NULL,
'Canton - Boston Street area', 39.2792, -76.5614, 'outage', 0.78, 'pending', 'medium', false, NOW() - INTERVAL '25 minutes'),

((SELECT id FROM public.users WHERE email = 'sarah.reporter@gmail.com' LIMIT 1),
'Brush fire in Druid Hill Park is putting out a lot of smoke. Can see it from miles away. Fire department seems to have it under control but the smoke is drifting over residential areas. Air quality is pretty bad.',
'https://images.unsplash.com/photo-1574006652973-2b1a0799dc7d?w=500',
'Druid Hill Park - near Pavilion', 39.3198, -76.6436, 'fire', 0.82, 'pending', 'medium', false, NOW() - INTERVAL '2.2 hours'),

((SELECT id FROM public.users WHERE email = 'john.witness@yahoo.com' LIMIT 1),
'Flooding on I-95 near Fort McHenry Tunnel. Right lane is completely underwater. Saw a few cars get stuck. Tow trucks are helping but traffic is backing up badly. Might want to avoid this route.',
NULL,
'I-95 South - Fort McHenry Tunnel approach', 39.2627, -76.5813, 'flood', 0.81, 'pending', 'medium', false, NOW() - INTERVAL '1.8 hours'),

-- REJECTED REPORT (Demonstrating quality control)
((SELECT id FROM public.users WHERE email = 'maria.observer@outlook.com' LIMIT 1),
'Saw some smoke coming from a building but turns out it was just a BBQ restaurant cooking. False alarm but wanted to report it just in case. Better safe than sorry I guess.',
NULL,
'Fells Point - Thames Street', 39.2834, -76.5929, 'fire', 0.45, 'rejected', NULL, false, NOW() - INTERVAL '3 hours'),

-- ADMIN-CREATED REPORTS (Demonstrating official incident documentation)
((SELECT id FROM public.users WHERE email = 'admin.demo@disasterlens.gov' LIMIT 1),
'OFFICIAL UPDATE: Harbor East apartment fire - Building 1000 Lancaster St. Fire department has established defensive operations. Residents from floors 12-20 have been safely evacuated. Red Cross on scene providing assistance.',
NULL,
'Harbor East - 1000 Lancaster Street', 39.2851, -76.5986, 'fire', 1.0, 'approved', 'critical', true, NOW() - INTERVAL '10 minutes'),

((SELECT id FROM public.users WHERE email = 'coordinator.smith@baltimore.gov' LIMIT 1),
'SHELTER OPERATIONS: Emergency shelters now open at Patterson High School (capacity 200) and Clifton Park Rec Center (capacity 150). Transportation to shelters available at Greenmount Ave & 25th St. Hot meals being served.',
NULL,
'Patterson High School & Clifton Park Rec Center', 39.3067, -76.5947, 'shelter', 1.0, 'approved', 'high', true, NOW() - INTERVAL '35 minutes');

-- Create summary view of current demo data
SELECT 
  'DATA SUMMARY FOR HACKATHON DEMO' as info,
  '' as details
UNION ALL
SELECT 
  'Total Users:', 
  CONCAT(COUNT(*), ' (', 
    SUM(CASE WHEN role = 'citizen' THEN 1 ELSE 0 END), ' citizens, ',
    SUM(CASE WHEN role = 'responder' THEN 1 ELSE 0 END), ' responders, ',
    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END), ' admins)')
FROM public.users

UNION ALL
SELECT 
  'Total Alerts:', 
  CONCAT(COUNT(*), ' (', 
    SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END), ' critical, ',
    SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END), ' high, ',
    SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END), ' medium, ',
    SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END), ' low)')
FROM public.alerts

UNION ALL
SELECT 
  'Alert Status Breakdown:',
  CONCAT(
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), ' active, ',
    SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END), ' investigating, ',
    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END), ' resolved')
FROM public.alerts

UNION ALL
SELECT 
  'Total Reports:', 
  CONCAT(COUNT(*), ' (', 
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), ' approved, ',
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), ' pending, ',
    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), ' rejected)')
FROM public.reports

UNION ALL
SELECT 
  'Report Types:',
  CONCAT(
    SUM(CASE WHEN alert_type = 'fire' THEN 1 ELSE 0 END), ' fire, ',
    SUM(CASE WHEN alert_type = 'flood' THEN 1 ELSE 0 END), ' flood, ',
    SUM(CASE WHEN alert_type = 'outage' THEN 1 ELSE 0 END), ' outage, ',
    SUM(CASE WHEN alert_type = 'storm' THEN 1 ELSE 0 END), ' storm, ',
    SUM(CASE WHEN alert_type = 'shelter' THEN 1 ELSE 0 END), ' shelter')
FROM public.reports
WHERE alert_type IS NOT NULL

UNION ALL
SELECT 
  'Admin vs Citizen Reports:',
  CONCAT(
    SUM(CASE WHEN admin_created = true THEN 1 ELSE 0 END), ' admin-created, ',
    SUM(CASE WHEN admin_created = false THEN 1 ELSE 0 END), ' citizen reports')
FROM public.reports;

-- Show active emergency situations for demo narrative
SELECT 
  demo_scenario,
  details
FROM (
  SELECT 
    '🚨 ACTIVE EMERGENCY SITUATIONS FOR DEMO 🚨' as demo_scenario,
    '' as details,
    0 as sort_order
  UNION ALL
  SELECT 
    CONCAT('⚠️  ', UPPER(severity), ' - ', type) as demo_scenario,
    CONCAT(location_text, ' (', ROUND(EXTRACT(EPOCH FROM (NOW() - created_at))/60), ' min ago)') as details,
    CASE severity 
      WHEN 'critical' THEN 1 
      WHEN 'high' THEN 2 
      WHEN 'medium' THEN 3 
      WHEN 'low' THEN 4 
      ELSE 5
    END as sort_order
  FROM public.alerts 
  WHERE status = 'active'
) active_alerts
ORDER BY sort_order;
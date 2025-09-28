-- 🚨 DISASTERLENS DEMO SEED DATA FOR HACKATHON JUDGES
-- Real emergency scenarios across major US cities to showcase platform capabilities
-- Execute this SQL in your Supabase SQL editor

-- First, let's clear any existing demo data (optional - remove if you want to keep existing data)
-- DELETE FROM public.reports WHERE text_report LIKE '%DEMO:%' OR location_text LIKE '%Demo%';
-- DELETE FROM public.alerts WHERE description LIKE '%DEMO:%' OR source LIKE '%Demo%';
-- DELETE FROM public.users WHERE email LIKE '%demo%' OR email LIKE '%hackathon%';

-- ========================================
-- 1. INSERT DEMO USERS
-- ========================================

INSERT INTO public.users (id, email, role, created_at) VALUES
-- Citizens from different cities
('11111111-1111-1111-1111-111111111111', 'citizen.la@demo.com', 'citizen', NOW() - INTERVAL '3 days'),
('22222222-2222-2222-2222-222222222222', 'miami.reporter@demo.com', 'citizen', NOW() - INTERVAL '5 days'),
('33333333-3333-3333-3333-333333333333', 'nyc.witness@demo.com', 'citizen', NOW() - INTERVAL '1 week'),
('44444444-4444-4444-4444-444444444444', 'chicago.citizen@demo.com', 'citizen', NOW() - INTERVAL '2 weeks'),
('55555555-5555-5555-5555-555555555555', 'houston.resident@demo.com', 'citizen', NOW() - INTERVAL '1 month'),

-- Emergency Responders
('66666666-6666-6666-6666-666666666666', 'chief.rodriguez@lafd.gov', 'responder', NOW() - INTERVAL '2 months'),
('77777777-7777-7777-7777-777777777777', 'dispatcher.chen@miami.gov', 'responder', NOW() - INTERVAL '3 months'),
('88888888-8888-8888-8888-888888888888', 'captain.johnson@fdny.gov', 'responder', NOW() - INTERVAL '6 months'),

-- Administrators
('99999999-9999-9999-9999-999999999999', 'admin@disasterlens.demo', 'admin', NOW() - INTERVAL '1 year'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'demo.admin@hackathon.dev', 'admin', NOW() - INTERVAL '1 year');

-- ========================================
-- 2. INSERT CRITICAL & HIGH PRIORITY ALERTS
-- ========================================

INSERT INTO public.alerts (
    id, type, location_text, latitude, longitude, location_lat, location_lng, 
    source, confidence_score, description, severity, status, created_at
) VALUES

-- 🔥 CRITICAL FIRE - Los Angeles, CA (Active Major Incident)
(
    'a1111111-1111-1111-1111-111111111111',
    'fire',
    'Downtown Los Angeles, CA - Wilshire Boulevard Financial District',
    34.0522, -118.2437, 34.0522, -118.2437,
    'LAFD Emergency Dispatch Center',
    0.98,
    'CRITICAL FIRE EMERGENCY: 25-story office tower fully engulfed from floors 15-20. Over 300 people evacuated via helicopter from rooftop. Heavy black smoke visible 20+ miles away. Multiple ladder companies, hazmat units deployed. Wind pushing smoke toward residential areas. Major traffic disruptions on I-110 and I-101.',
    'critical',
    'active',
    NOW() - INTERVAL '12 minutes'
),

-- 🌊 CRITICAL FLOOD - Miami, FL (Active Hurricane Aftermath)
(
    'a2222222-2222-2222-2222-222222222222', 
    'flood',
    'Miami Beach, FL - Ocean Drive & South Beach District',
    25.7617, -80.1918, 25.7617, -80.1918,
    'Miami-Dade Emergency Operations Center',
    0.96,
    'FLASH FLOOD EMERGENCY: Category 2 hurricane storm surge + 8 inches rainfall in 45 minutes. Ocean Drive completely submerged. 50+ vehicles trapped in flood waters. Coast Guard conducting water rescues. Hotels evacuating ground floors. Pumping stations at maximum capacity. Expected to worsen with high tide in 2 hours.',
    'critical',
    'active',
    NOW() - INTERVAL '18 minutes'
),

-- ⚡ HIGH PRIORITY BLACKOUT - New York, NY (Manhattan Grid Failure)
(
    'a3333333-3333-3333-3333-333333333333',
    'outage', 
    'Times Square & Theater District, Manhattan, NY',
    40.7589, -73.9851, 40.7589, -73.9851,
    'ConEd Emergency Command Center',
    0.94,
    'MAJOR POWER GRID FAILURE: Times Square and 15-block radius experiencing complete blackout. Subway system on emergency power only. Traffic control systems down causing gridlock. Estimated 75,000+ people affected including major Broadway theaters during evening shows. Generator power activated at hospitals. Transformer explosion at 42nd St substation confirmed.',
    'high',
    'investigating',
    NOW() - INTERVAL '25 minutes'
),

-- 🌪️ HIGH PRIORITY STORM - Chicago, IL (Severe Weather Event)
(
    'a4444444-4444-4444-4444-444444444444',
    'storm',
    'Chicago Loop & Magnificent Mile, IL', 
    41.8781, -87.6298, 41.8781, -87.6298,
    'National Weather Service Chicago Office',
    0.93,
    'SEVERE STORM WARNING: Tornado watch issued with 85+ mph straight-line winds. Baseball-sized hail reported downtown. Multiple high-rise windows shattered. Construction cranes emergency-secured. Millennium Park and Navy Pier evacuated. O''Hare Airport suspending all flights. Lake Shore Drive closed due to debris.',
    'high',
    'active',
    NOW() - INTERVAL '31 minutes'
),

-- 🏠 HIGH PRIORITY EVACUATION - Houston, TX (Chemical Plant Incident)
(
    'a5555555-5555-5555-5555-555555555555',
    'shelter',
    'Houston Ship Channel & Baytown Industrial Complex, TX',
    29.7604, -95.3698, 29.7604, -95.3698,
    'Harris County Emergency Management Office',
    0.91,
    'MASS EVACUATION ORDER: Chemical plant explosion with toxic gas release. 5-mile evacuation radius affects 18,000+ residents. Emergency shelters opened at NRG Stadium, Toyota Center, and Convention Center. Hazmat teams establishing containment perimeter. Air quality monitoring stations deployed. Highway 225 closed indefinitely.',
    'high',
    'active', 
    NOW() - INTERVAL '47 minutes'
);

-- ========================================
-- 3. INSERT MEDIUM & LOW PRIORITY ALERTS
-- ========================================

INSERT INTO public.alerts (
    id, type, location_text, latitude, longitude, location_lat, location_lng,
    source, confidence_score, description, severity, status, created_at
) VALUES

-- 🔥 MEDIUM FIRE - Phoenix, AZ (Controlled Structure Fire)
(
    'a6666666-6666-6666-6666-666666666666',
    'fire',
    'Downtown Phoenix, AZ - Roosevelt Row Arts District',
    33.4484, -112.0740, 33.4484, -112.0740,
    'Phoenix Fire Department Battalion 7',
    0.87,
    'STRUCTURE FIRE: Historic warehouse converted to artist lofts. Fire contained to 2nd floor, 28 units evacuated safely. Smoke visible from Chase Field. Cause under investigation - possible electrical. Roosevelt Street closed between 7th Ave and 7th St. Estimated $2M damage.',
    'medium',
    'investigating',
    NOW() - INTERVAL '1 hour 15 minutes'
),

-- ⚡ MEDIUM OUTAGE - Seattle, WA (Infrastructure Maintenance)
(
    'a7777777-7777-7777-7777-777777777777', 
    'outage',
    'Capitol Hill & Central District, Seattle, WA',
    47.6062, -122.3321, 47.6062, -122.3321,
    'Seattle City Light Operations Center',
    0.82,
    'PLANNED POWER RESTORATION: Underground cable replacement project. 4,200 customers affected. Pike Street businesses operating on backup power. Streetcar service suspended. Estimated restoration: 6-8 hours. Cooling centers open at community centers.',
    'medium',
    'investigating',
    NOW() - INTERVAL '1 hour 45 minutes'
),

-- 🌊 MEDIUM FLOOD - Denver, CO (Urban Flash Flood)
(
    'a8888888-8888-8888-8888-888888888888',
    'flood',
    'Downtown Denver, CO - Platte River & Cherry Creek',
    39.7392, -104.9903, 39.7392, -104.9903,
    'Denver Emergency Management & Homeland Security',
    0.79,
    'URBAN FLASH FLOODING: Rapid mountain snowmelt combined with afternoon thunderstorms. Cherry Creek Trail submerged. Several vehicles rescued from Speer Boulevard underpass. Union Station lower level evacuated as precaution. Water levels expected to recede in 3-4 hours.',
    'medium',
    'active',
    NOW() - INTERVAL '2 hours 10 minutes'
),

-- 🏠 LOW SHELTER - Portland, OR (Community Support)
(
    'a9999999-9999-9999-9999-999999999999',
    'shelter',
    'Pearl District, Portland, OR',
    45.5152, -122.6784, 45.5152, -122.6784,
    'Multnomah County Emergency Services', 
    0.71,
    'WARMING CENTER ACTIVATION: Unseasonably cold temperatures prompt emergency shelter opening. Pearl District Community Center activated with capacity for 150 people. Hot meals and basic services available. Transportation assistance provided from downtown MAX stations.',
    'low',
    'active',
    NOW() - INTERVAL '3 hours 20 minutes'
),

-- 🌪️ LOW STORM - Boston, MA (Weather Advisory)
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
    'storm',
    'Boston Common & Back Bay, MA',
    42.3601, -71.0589, 42.3601, -71.0589,
    'National Weather Service Boston/Norton',
    0.68,
    'WIND ADVISORY: Sustained winds 25-35 mph with gusts to 50 mph through midnight. Some tree branches down in Public Garden and Commonwealth Ave. Secure loose outdoor items. Exercise caution when driving high-profile vehicles. MBTA monitoring for service impacts.',
    'low',
    'active',
    NOW() - INTERVAL '2 hours 45 minutes'
),

-- ⚡ RESOLVED OUTAGE - San Francisco, CA (Maintenance Complete)
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'outage',
    'Mission District & SOMA, San Francisco, CA',
    37.7749, -122.4194, 37.7749, -122.4194,
    'PG&E Grid Operations Center',
    0.95,
    'POWER FULLY RESTORED: Planned grid modernization completed 2 hours ahead of schedule. All 3,400 customers back online. New smart grid technology installed successfully. System reliability improved by 40%. No further outages anticipated.',
    'low',
    'resolved',
    NOW() - INTERVAL '4 hours'
),

-- 🔥 RESOLVED FIRE - Las Vegas, NV (Casino Incident Contained)
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'fire',
    'Las Vegas Strip - Major Casino Resort, NV',
    36.1699, -115.1398, 36.1699, -115.1398,
    'Clark County Fire Department Station 11',
    0.92,
    'KITCHEN FIRE RESOLVED: High-end restaurant fire fully extinguished within 45 minutes. Advanced sprinkler system prevented spread to casino floor. No guest evacuations required. Minor smoke damage to ventilation system. Restaurant cleared for reopening after safety inspection.',
    'medium',
    'resolved',
    NOW() - INTERVAL '5 hours 30 minutes'
);

-- ========================================
-- 4. INSERT CITIZEN REPORTS
-- ========================================

INSERT INTO public.reports (
    id, user_id, text_report, image_url, location_text, location_lat, location_lng,
    alert_type, confidence_score, status, created_at, severity, admin_created
) VALUES

-- CRITICAL REPORTS (Approved - Led to Alert Generation)
(
    '12345678-1234-1234-1234-123456789abc',
    '11111111-1111-1111-1111-111111111111',
    'URGENT! Massive fire in downtown office building! I can see people on the roof waving for help. Helicopters circling. This is happening RIGHT NOW on Wilshire Blvd. Smoke is so thick I can barely breathe from 3 blocks away. Multiple fire trucks but the flames are spreading fast!',
    'https://example.com/demo-fire-la.jpg',
    'Downtown Los Angeles, CA - Wilshire Boulevard Financial District',
    34.0522, -118.2437,
    'fire',
    0.97,
    'approved',
    NOW() - INTERVAL '15 minutes',
    'critical',
    false
),

(
    '23456789-2345-2345-2345-23456789abcd',
    '22222222-2222-2222-2222-222222222222', 
    'Emergency situation on Ocean Drive! Water is up to car windows and rising fast. I saw Coast Guard boats rescuing people from their cars. My hotel lobby is flooding and they are moving everyone to higher floors. This is definitely not normal flooding - it happened so quickly!',
    'https://example.com/demo-flood-miami.jpg',
    'Miami Beach, FL - Ocean Drive & South Beach District',
    25.7617, -80.1918,
    'flood',
    0.94,
    'approved', 
    NOW() - INTERVAL '22 minutes',
    'critical',
    false
),

-- HIGH PRIORITY REPORTS (Approved)
(
    '34567890-3456-3456-3456-3456789abcde',
    '33333333-3333-3333-3333-333333333333',
    'Total blackout in Times Square! I''m stuck in the subway tunnel and emergency lighting just kicked in. Traffic lights are out and cars are honking everywhere. This is chaos - thousands of people in the street. Need emergency response ASAP!',
    NULL,
    'Times Square & Theater District, Manhattan, NY',
    40.7589, -73.9851,
    'outage',
    0.91,
    'approved',
    NOW() - INTERVAL '28 minutes',
    'high',
    false
),

(
    '45678901-4567-4567-4567-456789abcdef', 
    '44444444-4444-4444-4444-444444444444',
    'Dangerous storm downtown! Baseball-sized hail just shattered store windows on Michigan Ave. Wind is so strong I can barely stand up. Debris flying everywhere. Saw people running for cover in buildings. Police are telling everyone to get inside immediately.',
    'https://example.com/demo-storm-chicago.jpg',
    'Chicago Loop & Magnificent Mile, IL',
    41.8781, -87.6298,
    'storm',
    0.89,
    'approved',
    NOW() - INTERVAL '35 minutes',
    'high',
    false
),

-- MEDIUM PRIORITY REPORTS (Approved)
(
    '56789012-5678-5678-5678-56789abcdef0',
    '55555555-5555-5555-5555-555555555555',
    'Fire at the old warehouse that got turned into apartments on Roosevelt Row. Fire trucks everywhere but it looks like they have it under control. Smoke is pretty thick but not spreading to other buildings. About 30 people evacuated and standing across the street.',
    NULL,
    'Downtown Phoenix, AZ - Roosevelt Row Arts District',
    33.4484, -112.0740,
    'fire',
    0.83,
    'approved',
    NOW() - INTERVAL '1 hour 20 minutes',
    'medium',
    false
),

(
    '67890123-6789-6789-6789-6789abcdef01',
    '11111111-1111-1111-1111-111111111111',
    'Power has been out in Capitol Hill for about 2 hours now. Our coffee shop is running on backup power but most of the block is dark. City Light crews are working on Pike Street. They said it should be back up in a few hours.',
    NULL,
    'Capitol Hill & Central District, Seattle, WA',
    47.6062, -122.3321,
    'outage',
    0.78,
    'approved',
    NOW() - INTERVAL '1 hour 50 minutes',
    'medium',
    false
),

-- PENDING REPORTS (Awaiting AI Classification)
(
    '78901234-7890-7890-7890-789abcdef012',
    '22222222-2222-2222-2222-222222222222',
    'Cherry Creek is overflowing near downtown! I had to turn around because the underpass is completely flooded. Saw a few cars that got stuck. Water came up really fast after that thunderstorm. Be careful if you''re driving in this area.',
    'https://example.com/demo-flood-denver.jpg',
    'Downtown Denver, CO - Platte River & Cherry Creek',
    39.7392, -104.9903,
    'flood',
    NULL,
    'pending',
    NOW() - INTERVAL '2 hours 15 minutes',
    NULL,
    false
),

(
    '89012345-8901-8901-8901-89abcdef0123',
    '33333333-3333-3333-3333-333333333333',
    'It''s really cold tonight and I see a lot of people who need somewhere warm to stay. Are there any emergency shelters open? I''m in the Pearl District and there are folks who look like they need help.',
    NULL,
    'Pearl District, Portland, OR',
    45.5152, -122.6784,
    'shelter',
    NULL,
    'pending',
    NOW() - INTERVAL '3 hours 30 minutes',
    NULL,
    false
),

(
    '90123456-9012-9012-9012-9abcdef01234',
    '44444444-4444-4444-4444-444444444444',
    'Strong winds knocked down a big tree branch in Boston Common. It''s blocking part of the walking path but nobody got hurt. Parks department should probably come clean it up. Wind is still pretty gusty.',
    NULL,
    'Boston Common & Back Bay, MA',
    42.3601, -71.0589,
    'storm',
    NULL,
    'pending',
    NOW() - INTERVAL '3 hours',
    NULL,
    false
),

-- LOW PRIORITY REPORTS (Some Approved, Some Rejected)
(
    'a0123456-a012-a012-a012-abcdef012345',
    '55555555-5555-5555-5555-555555555555',
    'Just wanted to report that power is back on in the Mission! Crews did a great job - finished earlier than expected. Everything seems to be working normally now. Thanks to PG&E for the quick work!',
    NULL,
    'Mission District & SOMA, San Francisco, CA',
    37.7749, -122.4194,
    'outage',
    0.72,
    'approved',
    NOW() - INTERVAL '4 hours 15 minutes',
    'low',
    false
),

(
    'b0123456-b012-b012-b012-bcdef0123456',
    '11111111-1111-1111-1111-111111111111',
    'Small kitchen fire at one of the casino restaurants on the Strip. Fire department got here super fast and put it out quickly. Didn''t affect the casino at all. Just some smoke smell but nothing serious.',
    NULL,
    'Las Vegas Strip - Major Casino Resort, NV',
    36.1699, -115.1398,
    'fire',
    0.65,
    'rejected',
    NOW() - INTERVAL '6 hours',
    'low',
    false
);

-- ========================================
-- 5. VERIFICATION QUERIES
-- ========================================

-- Check that all data was inserted correctly
SELECT 'USERS' as table_name, COUNT(*) as count FROM public.users WHERE email LIKE '%demo%'
UNION ALL
SELECT 'ALERTS' as table_name, COUNT(*) as count FROM public.alerts WHERE source LIKE '%Center%'
UNION ALL  
SELECT 'REPORTS' as table_name, COUNT(*) as count FROM public.reports WHERE location_text LIKE '%CA%' OR location_text LIKE '%NY%' OR location_text LIKE '%FL%';

-- Show distribution of alerts by severity and status
SELECT 
    severity,
    status, 
    COUNT(*) as count
FROM public.alerts 
WHERE source LIKE '%Center%' OR source LIKE '%Department%' OR source LIKE '%Service%'
GROUP BY severity, status 
ORDER BY 
    CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
    status;

-- Show recent reports by status
SELECT 
    status,
    alert_type,
    COUNT(*) as count
FROM public.reports 
WHERE location_text LIKE '%CA%' OR location_text LIKE '%NY%' OR location_text LIKE '%FL%' OR location_text LIKE '%IL%' OR location_text LIKE '%TX%'
GROUP BY status, alert_type
ORDER BY status, alert_type;

COMMIT;
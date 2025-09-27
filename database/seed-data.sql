-- DisasterLens Sample Data for Supabase
-- Run these commands in your Supabase SQL editor to populate the database

-- First, let's make sure the tables exist with the correct schema
-- (This should match your schema.md file)

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('citizen', 'responder', 'admin')) DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table (if not exists)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT CHECK (type IN ('fire', 'flood', 'outage', 'shelter', 'storm')) NOT NULL,
    location_text TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    location_lat FLOAT8, -- For compatibility with frontend
    location_lng FLOAT8, -- For compatibility with frontend  
    source TEXT,
    confidence_score FLOAT8 DEFAULT 0.5,
    description TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('active', 'resolved', 'investigating')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table (if not exists)
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text_report TEXT,
    image_url TEXT,
    location_text TEXT,
    location_lat FLOAT8,
    location_lng FLOAT8,
    alert_type TEXT CHECK (alert_type IN ('fire', 'flood', 'outage', 'storm', 'shelter')),
    confidence_score FLOAT8,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample users
INSERT INTO users (email, role) VALUES 
('alice@example.com', 'citizen'),
('bob@responder.com', 'responder'),
('admin@disasterlens.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample alerts (Baltimore area)
INSERT INTO alerts (type, location_text, latitude, longitude, location_lat, location_lng, source, confidence_score, description, severity, status) VALUES

('fire', 'Catonsville, MD', 39.2847, -76.8483, 39.2847, -76.8483, 'Emergency Services', 0.95, 'Structure fire reported on Main Street. Multiple units responding.', 'high', 'active'),

('flood', 'Baltimore, MD', 39.2904, -76.6122, 39.2904, -76.6122, 'Weather Service', 0.87, 'Flash flooding in downtown area due to heavy rainfall.', 'medium', 'active'),

('outage', 'Towson, MD', 39.3643, -76.5431, 39.3643, -76.5431, 'BGE Utility', 0.92, 'Power outage affecting approximately 2,500 customers.', 'medium', 'investigating'),

('storm', 'Ellicott City, MD', 39.1612, -76.8517, 39.1612, -76.8517, 'Weather Service', 0.78, 'Severe thunderstorm warning with potential for damaging winds.', 'high', 'active'),

('shelter', 'Arbutus Community Center', 39.2448, -76.7158, 39.2448, -76.7158, 'Red Cross', 0.99, 'Emergency shelter opened for displaced residents.', 'medium', 'active'),

('fire', 'Parkville, MD', 39.3915, -76.6107, 39.3915, -76.6107, 'Citizen Report', 0.65, 'Possible brush fire near residential area.', 'low', 'investigating');

-- Insert sample reports
INSERT INTO reports (user_id, text_report, location_text, location_lat, location_lng, alert_type, confidence_score, status) VALUES

((SELECT id FROM users WHERE email = 'alice@example.com' LIMIT 1), 
 'Large fire visible from my window with heavy smoke. Fire trucks are arriving.', 
 'Catonsville, MD', 39.2847, -76.8483, 'fire', 0.95, 'approved'),

((SELECT id FROM users WHERE email = 'alice@example.com' LIMIT 1), 
 'Street flooding on Light Street downtown. Water is about 6 inches deep.', 
 'Baltimore, MD', 39.2904, -76.6122, 'flood', 0.88, 'pending'),

((SELECT id FROM users WHERE email = 'bob@responder.com' LIMIT 1), 
 'Power lines down on York Road after the storm. BGE trucks on scene.', 
 'Towson, MD', 39.3643, -76.5431, 'outage', 0.92, 'approved'),

((SELECT id FROM users WHERE email = 'alice@example.com' LIMIT 1), 
 'Strong winds knocked down several trees. One is blocking the road.', 
 'Ellicott City, MD', 39.1612, -76.8517, 'storm', 0.76, 'pending');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (suitable for demo)
-- In production, you'd want more restrictive policies

-- Allow everyone to read alerts
CREATE POLICY IF NOT EXISTS "Anyone can view alerts" ON alerts
    FOR SELECT TO authenticated, anon USING (true);

-- Allow authenticated users to insert alerts  
CREATE POLICY IF NOT EXISTS "Authenticated users can create alerts" ON alerts
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow everyone to read reports
CREATE POLICY IF NOT EXISTS "Anyone can view reports" ON reports
    FOR SELECT TO authenticated, anon USING (true);

-- Allow authenticated users to insert reports
CREATE POLICY IF NOT EXISTS "Authenticated users can create reports" ON reports
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow everyone to read users (for demo purposes)
CREATE POLICY IF NOT EXISTS "Anyone can view users" ON users
    FOR SELECT TO authenticated, anon USING (true);
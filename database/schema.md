# DisasterLens Supabase Database Schema

This file contains the SQL commands to set up the DisasterLens database schema in Supabase.

## Tables

### 1. users
Stores user information for authentication and role management.

```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) CHECK (role IN ('citizen', 'responder', 'admin')) DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
```

### 2. alerts
Stores emergency alerts and disaster information.

```sql
CREATE TABLE alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) CHECK (type IN ('fire', 'flood', 'outage', 'storm', 'shelter')) NOT NULL,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    location_text TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('active', 'investigating', 'resolved')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_location ON alerts(location_lat, location_lng);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view alerts" ON alerts
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Only admins and responders can create alerts" ON alerts
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'responder')
        )
    );

CREATE POLICY "Only admins and responders can update alerts" ON alerts
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'responder')
        )
    );
```

### 3. reports
Stores citizen reports submitted through the app.

```sql
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT,
    text_report TEXT NOT NULL,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    location_text TEXT NOT NULL,
    alert_type VARCHAR(50) CHECK (alert_type IN ('fire', 'flood', 'outage', 'storm', 'shelter')),
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_alert_type ON reports(alert_type);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_location ON reports(location_lat, location_lng);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins and responders can view all reports" ON reports
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'responder')
        )
    );

CREATE POLICY "Users can create their own reports" ON reports
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins and responders can update reports" ON reports
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'responder')
        )
    );
```

## Sample Data

```sql
-- Insert sample users
INSERT INTO users (id, email, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'citizen@example.com', 'citizen'),
    ('00000000-0000-0000-0000-000000000002', 'responder@fire.gov', 'responder'),
    ('00000000-0000-0000-0000-000000000003', 'admin@disasterlens.com', 'admin');

-- Insert sample alerts
INSERT INTO alerts (type, location_lat, location_lng, location_text, source, confidence_score, description, severity, status) VALUES
    ('fire', 39.2847, -76.8483, 'Catonsville, MD', 'Emergency Services', 0.95, 'Structure fire reported on Main Street. Multiple units responding.', 'high', 'active'),
    ('flood', 39.2904, -76.6122, 'Baltimore, MD', 'Weather Service', 0.87, 'Flash flooding in downtown area due to heavy rainfall.', 'medium', 'active'),
    ('outage', 39.3643, -76.5431, 'Towson, MD', 'BGE Utility', 0.92, 'Power outage affecting approximately 2,500 customers.', 'medium', 'investigating'),
    ('storm', 39.1612, -76.8517, 'Ellicott City, MD', 'Weather Service', 0.78, 'Severe thunderstorm warning with potential for damaging winds.', 'high', 'active'),
    ('shelter', 39.2448, -76.7158, 'Arbutus Community Center', 'Red Cross', 0.99, 'Emergency shelter opened for displaced residents.', 'medium', 'active');

-- Insert sample reports
INSERT INTO reports (user_id, text_report, location_lat, location_lng, location_text, alert_type, confidence_score, status) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Large fire visible from my window with heavy smoke. Fire trucks are arriving.', 39.2847, -76.8483, 'Catonsville, MD', 'fire', 0.95, 'approved'),
    ('00000000-0000-0000-0000-000000000001', 'Street flooding on Frederick Road. Cars are struggling to pass through.', 39.2904, -76.6122, 'Baltimore, MD', 'flood', 0.87, 'approved'),
    ('00000000-0000-0000-0000-000000000001', 'Power has been out for 20 minutes. Traffic lights are also down.', 39.3643, -76.5431, 'Towson, MD', 'outage', 0.92, 'pending');
```

## Functions

```sql
-- Function to automatically update alert status based on reports
CREATE OR REPLACE FUNCTION update_alert_from_reports()
RETURNS TRIGGER AS $$
BEGIN
    -- If a report is approved with high confidence, ensure there's an active alert
    IF NEW.status = 'approved' AND NEW.confidence_score > 0.8 THEN
        INSERT INTO alerts (
            type, location_lat, location_lng, location_text, 
            source, confidence_score, description, severity, status
        ) VALUES (
            NEW.alert_type, NEW.location_lat, NEW.location_lng, NEW.location_text,
            'Citizen Report', NEW.confidence_score, NEW.text_report,
            CASE 
                WHEN NEW.confidence_score > 0.9 THEN 'high'
                ELSE 'medium'
            END,
            'active'
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the function
CREATE TRIGGER trigger_update_alert_from_reports
    AFTER UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_from_reports();
```
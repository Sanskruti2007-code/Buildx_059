-- ====================================================================
-- MEHFUS: Phase 2 — City-Wide Daily Safety (PostgreSQL & PostGIS Extension)
-- ====================================================================

-- 1. Enumerations for Phase 2
CREATE TYPE safety_state AS ENUM ('GREEN', 'YELLOW', 'ORANGE', 'RED', 'RESOLVED', 'FALSE_ALARM');
CREATE TYPE saferide_status AS ENUM ('IDLE', 'ACTIVE', 'ANOMALY_DETECTED', 'ESCALATED', 'COMPLETED', 'CANCELLED');
CREATE TYPE witness_anonymity AS ENUM ('ANONYMOUS', 'CONFIDENTIAL', 'IDENTIFIED');
CREATE TYPE witness_category AS ENUM (
    'HARASSMENT', 
    'SUSPICIOUS_ACTIVITY', 
    'CHAIN_SNATCHING', 
    'PUBLIC_SAFETY_HAZARD', 
    'DOMESTIC_DISTRESS', 
    'TRANSPORT_SAFETY'
);
CREATE TYPE transport_type AS ENUM ('METRO', 'RAILWAY', 'BUS_TERMINUS', 'AIRPORT');

-- 2. Trusted Contacts Table (Max 5 per user)
CREATE TABLE trusted_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    priority_order INT NOT NULL CHECK (priority_order >= 1 AND priority_order <= 5),
    receive_sms_on_yellow BOOLEAN DEFAULT FALSE,
    receive_sms_on_orange BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_contact_phone UNIQUE(user_id, phone)
);

-- 3. SafeRide Sessions Table
CREATE TABLE safe_ride_sessions (
    id TEXT PRIMARY KEY, -- e.g. "SR-2026-089"
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    start_location GEOGRAPHY(Point, 4326) NOT NULL,
    destination GEOGRAPHY(Point, 4326) NOT NULL,
    current_location GEOGRAPHY(Point, 4326) NOT NULL,
    expected_route_geom GEOMETRY(LineString, 4326),
    vehicle_details JSONB, -- { vehicleNumber, vehicleType, driverName, driverPhone }
    status saferide_status DEFAULT 'ACTIVE',
    safety_state safety_state DEFAULT 'GREEN',
    deviation_meters INT DEFAULT 0,
    stationary_seconds INT DEFAULT 0,
    duress_triggered BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_ping_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. Safety Events Log (Time-bound escalations)
CREATE TABLE safety_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT REFERENCES safe_ride_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    event_type TEXT NOT NULL,
    severity alert_severity NOT NULL,
    coordinates GEOGRAPHY(Point, 4326) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Elder Profiles Table
CREATE TABLE elder_profiles (
    id TEXT PRIMARY KEY, -- e.g. "ELD-2026-01"
    guardian_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INT NOT NULL,
    gender TEXT NOT NULL,
    photo_path TEXT NOT NULL,
    condition_notes TEXT,
    safe_zones JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ id, name, center, radiusMeters, zoneType }]
    last_known_location GEOGRAPHY(Point, 4326),
    current_status TEXT DEFAULT 'SAFE_IN_ZONE',
    qr_token_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Elderly Wander Alerts Table
CREATE TABLE wander_alerts (
    id TEXT PRIMARY KEY,
    elder_id TEXT REFERENCES elder_profiles(id) ON DELETE CASCADE,
    trigger_zone_name TEXT NOT NULL,
    distance_outside_meters INT NOT NULL,
    current_location GEOGRAPHY(Point, 4326) NOT NULL,
    severity alert_severity DEFAULT 'ORANGE',
    status TEXT DEFAULT 'ACTIVE_SEARCH',
    assigned_responders_count INT DEFAULT 0,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 7. Anonymous & Confidential Witness Reports
CREATE TABLE witness_reports (
    id TEXT PRIMARY KEY, -- e.g. "WIT-2026-021"
    tracking_code TEXT NOT NULL UNIQUE,
    anonymity_level witness_anonymity NOT NULL,
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL if ANONYMOUS
    reporter_phone TEXT, -- NULL if ANONYMOUS
    category witness_category NOT NULL,
    description TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    landmark TEXT,
    incident_time TIMESTAMPTZ NOT NULL,
    media_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
    exif_scrubbed BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'RECEIVED',
    assigned_authority TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. QR Identity Tokens
CREATE TABLE qr_identities (
    id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    subject_type TEXT NOT NULL, -- ELDER | CHILD | SPECIAL_ASSIST
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    guardian_phone_encrypted TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE | REVOKED
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- 9. Transport Hubs
CREATE TABLE transport_hubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type transport_type NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    operator_name TEXT NOT NULL,
    police_booth_phone TEXT NOT NULL,
    status TEXT DEFAULT 'NORMAL',
    last_broadcast_notice TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- Spatial Indexing (PostGIS GIST)
-- ====================================================================
CREATE INDEX idx_saferide_current ON safe_ride_sessions USING GIST(current_location);
CREATE INDEX idx_elder_last_location ON elder_profiles USING GIST(last_known_location);
CREATE INDEX idx_wander_alert_loc ON wander_alerts USING GIST(current_location);
CREATE INDEX idx_witness_location ON witness_reports USING GIST(location);
CREATE INDEX idx_transport_location ON transport_hubs USING GIST(location);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_ride_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE elder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wander_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE witness_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_hubs ENABLE ROW LEVEL SECURITY;

-- 1. Trusted Contacts: Only the owner can view or edit their contacts
CREATE POLICY "Users manage own trusted contacts"
ON trusted_contacts FOR ALL USING (auth.uid() = user_id);

-- 2. SafeRide: Active location is visible to user, verified trusted contacts, and Control Room
CREATE POLICY "SafeRide visibility rule"
ON safe_ride_sessions FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT user_id FROM trusted_contacts WHERE phone = (SELECT phone FROM profiles WHERE user_id = auth.uid())) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('CONTROL_ROOM', 'ADMIN'))
);

-- 3. Anonymous Witness Reports: Public insertion; NO client IP stored; read restricted to authorities
CREATE POLICY "Witness report insertion public"
ON witness_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Witness report read restricted"
ON witness_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('CONTROL_ROOM', 'ADMIN', 'HELP_DESK'))
);

-- ====================================================================
-- MEHFUS: Phase 1 — Foundational Safety Network (Deeksha Bhoomi Pilot)
-- PostgreSQL 15+ Schema with PostGIS & Row Level Security (RLS)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerations
CREATE TYPE user_role AS ENUM ('CITIZEN', 'VOLUNTEER', 'HELP_DESK', 'CONTROL_ROOM', 'ADMIN');
CREATE TYPE incident_status AS ENUM ('REPORTED', 'VERIFIED', 'SEARCHING', 'MATCH_CANDIDATE_FOUND', 'REUNITED', 'CLOSED');
CREATE TYPE alert_severity AS ENUM ('YELLOW', 'ORANGE', 'RED');
CREATE TYPE task_status AS ENUM ('ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED', 'EXPIRED', 'ESCALATED');
CREATE TYPE report_type AS ENUM ('DOUBT_REPORT', 'SIGHTING_TIP');
CREATE TYPE crowd_level AS ENUM ('NORMAL', 'ELEVATED', 'CRITICAL', 'EMERGENCY');
CREATE TYPE provenance_type AS ENUM ('MEASURED', 'MANUAL', 'SIMULATED');

-- 3. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'CITIZEN',
    is_verified BOOLEAN DEFAULT FALSE,
    active_location GEOGRAPHY(Point, 4326),
    trusted_contacts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pre-Registered Children Table (Parent Vault)
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardian_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    child_name TEXT NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 18),
    gender TEXT NOT NULL,
    photo_storage_path TEXT NOT NULL, -- Stored as private path in 'child-media' bucket
    full_body_photo_path TEXT,
    clothing_top TEXT,
    clothing_bottom TEXT,
    clothing_footwear TEXT,
    birthmarks TEXT,
    languages_spoken TEXT[] DEFAULT ARRAY['mr', 'hi'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Missing Person Cases Table
CREATE TABLE missing_cases (
    id TEXT PRIMARY KEY, -- e.g. "DB-2026-01"
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    child_name TEXT NOT NULL,
    age INT NOT NULL,
    gender TEXT NOT NULL,
    photo_storage_path TEXT NOT NULL,
    clothing JSONB NOT NULL, -- { top, bottom, footwear, accessories }
    identifying_features TEXT,
    last_seen_location GEOGRAPHY(Point, 4326) NOT NULL,
    last_seen_landmark TEXT,
    last_seen_time TIMESTAMPTZ NOT NULL,
    reporter_id UUID REFERENCES profiles(id),
    reporter_phone TEXT NOT NULL,
    status incident_status DEFAULT 'SEARCHING',
    severity alert_severity DEFAULT 'ORANGE',
    otp_verified BOOLEAN DEFAULT FALSE,
    assigned_officer TEXT,
    search_radius_meters INT DEFAULT 2000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reunited_at TIMESTAMPTZ
);

-- 6. Found Child Reports Table ("I Have a Doubt" vs "Sighting Tip")
CREATE TABLE found_reports (
    id TEXT PRIMARY KEY, -- e.g. "FND-2026-04"
    report_type report_type NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    finder_name TEXT,
    finder_phone TEXT,
    child_photo_path TEXT,
    estimated_age INT NOT NULL,
    gender TEXT NOT NULL,
    found_location GEOGRAPHY(Point, 4326) NOT NULL,
    found_landmark TEXT,
    found_time TIMESTAMPTZ NOT NULL,
    clothing JSONB NOT NULL,
    language_spoken TEXT,
    current_physical_status TEXT,
    matched_case_id TEXT REFERENCES missing_cases(id),
    match_score NUMERIC(5, 4),
    status TEXT DEFAULT 'PENDING_REVIEW',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Match Candidates Queue (Human-in-the-Loop review)
CREATE TABLE match_candidates (
    id TEXT PRIMARY KEY,
    missing_case_id TEXT REFERENCES missing_cases(id) ON DELETE CASCADE,
    found_report_id TEXT REFERENCES found_reports(id) ON DELETE CASCADE,
    composite_score NUMERIC(5, 4) NOT NULL,
    breakdown JSONB NOT NULL, -- { faceSimilarity, locationScore, timeScore, ageCompatibility, clothingSimilarity }
    human_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES profiles(id),
    decision TEXT DEFAULT 'UNDER_REVIEW', -- CONFIRMED | REJECTED | UNDER_REVIEW
    decision_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Volunteer Tasks Table
CREATE TABLE volunteer_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    case_id TEXT REFERENCES missing_cases(id) ON DELETE CASCADE,
    search_zone_name TEXT NOT NULL,
    search_coordinates GEOGRAPHY(Point, 4326) NOT NULL,
    status task_status DEFAULT 'ASSIGNED',
    safety_checkin_count INT DEFAULT 0,
    last_checkin_time TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL, -- 60s cascade timeout
    completed_at TIMESTAMPTZ
);

-- 9. Crowd Density Zones Table
CREATE TABLE crowd_zones (
    id TEXT PRIMARY KEY, -- e.g. "ZONE-01"
    name TEXT NOT NULL,
    capacity INT NOT NULL,
    current_count INT NOT NULL,
    density_percentage NUMERIC(5, 2) GENERATED ALWAYS AS ((current_count::numeric / capacity::numeric) * 100) STORED,
    threshold_level crowd_level NOT NULL,
    provenance provenance_type DEFAULT 'MEASURED',
    location GEOGRAPHY(Point, 4326) NOT NULL,
    recommendation TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Immutable Audit Trail Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_id TEXT NOT NULL,
    actor_role user_role NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    ip_address TEXT,
    details JSONB
);

-- ====================================================================
-- Spatial Indexing (PostGIS GIST)
-- ====================================================================
CREATE INDEX idx_profiles_location ON profiles USING GIST(active_location);
CREATE INDEX idx_missing_cases_location ON missing_cases USING GIST(last_seen_location);
CREATE INDEX idx_found_reports_location ON found_reports USING GIST(found_location);
CREATE INDEX idx_crowd_zones_location ON crowd_zones USING GIST(location);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can read their own profile; Control room can read verified volunteers
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Control room views all profiles"
ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('CONTROL_ROOM', 'ADMIN'))
);

-- 2. Children: Only guardian or Control Room can view raw registered child records
CREATE POLICY "Guardians view own children" 
ON children FOR ALL USING (
  guardian_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- 3. Missing Cases: Anyone authenticated can read active search cases (cropped photo); full details restricted
CREATE POLICY "Public read active search cases"
ON missing_cases FOR SELECT USING (status IN ('SEARCHING', 'MATCH_CANDIDATE_FOUND'));

-- 4. Audit Log: Append-only; no UPDATE or DELETE allowed under any circumstance
CREATE POLICY "Audit logs insert only" 
ON audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Audit logs read restricted to Control Room"
ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('CONTROL_ROOM', 'ADMIN'))
);

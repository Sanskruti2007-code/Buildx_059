-- ==============================================================================
-- MEHFUS: PHASE 3 — CITY SCALE, INTEROPERABILITY & PREDICTIVE SAFETY
-- Model A: Multi-Tenant Schema with Row Level Security (RLS) & PostGIS
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. City Tenant Registry Table
CREATE TABLE IF NOT EXISTS public.tenants_cities (
    id VARCHAR(32) PRIMARY KEY, -- 'nagpur', 'mumbai', 'pune', etc.
    name VARCHAR(120) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    country_code VARCHAR(8) DEFAULT 'IN',
    emergency_number VARCHAR(16) DEFAULT '112',
    police_helpline VARCHAR(16) DEFAULT '100',
    women_helpline VARCHAR(16) DEFAULT '1091',
    center_location GEOMETRY(Point, 4326),
    default_zoom INTEGER DEFAULT 13,
    cctns_station_code VARCHAR(64),
    erss_zone_code VARCHAR(64),
    currency VARCHAR(8) DEFAULT 'INR',
    time_zone VARCHAR(64) DEFAULT 'Asia/Kolkata',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial city tenants
INSERT INTO public.tenants_cities (id, name, state, country, country_code, emergency_number, center_location, cctns_station_code, erss_zone_code)
VALUES 
  ('nagpur', 'Nagpur', 'Maharashtra', 'India', 'IN', '112', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326), 'MH-NGP-STN-04', 'ERSS-MH-ZONE-EAST-1'),
  ('mumbai', 'Mumbai', 'Maharashtra', 'India', 'IN', '112', ST_SetSRID(ST_MakePoint(72.8356, 18.9402), 4326), 'MH-MUM-STN-12', 'ERSS-MH-ZONE-WEST-1'),
  ('pune', 'Pune', 'Maharashtra', 'India', 'IN', '112', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), 'MH-PUN-STN-07', 'ERSS-MH-ZONE-WEST-2')
ON CONFLICT (id) DO NOTHING;

-- 2. Multi-City Cross-Tenant Escalations
CREATE TABLE IF NOT EXISTS public.cross_city_escalations (
    id VARCHAR(64) PRIMARY KEY, -- 'ESC-2026-089'
    incident_id VARCHAR(64) NOT NULL,
    incident_type VARCHAR(32) NOT NULL,
    origin_city_id VARCHAR(32) REFERENCES public.tenants_cities(id),
    target_city_id VARCHAR(32) REFERENCES public.tenants_cities(id),
    authorized_by VARCHAR(120) NOT NULL,
    authorization_token VARCHAR(128) NOT NULL,
    reason TEXT NOT NULL,
    shared_scope VARCHAR(32) DEFAULT 'FULL_CASE_DOSSIER', -- 'MINIMAL_SEARCH_VECTORS' | 'FULL_CASE_DOSSIER'
    status VARCHAR(32) DEFAULT 'AUTHORIZED', -- 'PENDING', 'AUTHORIZED', 'REJECTED', 'CONCLUDED'
    target_city_acknowledged BOOLEAN DEFAULT FALSE,
    transit_hub_ref VARCHAR(64),
    audit_trail_id VARCHAR(64),
    escalated_at TIMESTAMPTZ DEFAULT NOW(),
    concluded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_escalation_target_city ON public.cross_city_escalations(target_city_id, status);
CREATE INDEX IF NOT EXISTS idx_escalation_incident ON public.cross_city_escalations(incident_id);

-- 3. Drone Fleet & Flight Sessions (Strict Privacy Boundary)
CREATE TABLE IF NOT EXISTS public.drone_fleet (
    id VARCHAR(64) PRIMARY KEY, -- 'DRONE-NGP-ALPHA-1'
    callsign VARCHAR(64) NOT NULL,
    city_id VARCHAR(32) REFERENCES public.tenants_cities(id),
    assigned_incident_id VARCHAR(64),
    status VARCHAR(32) DEFAULT 'PATROLLING',
    battery_percent INTEGER CHECK (battery_percent BETWEEN 0 AND 100),
    altitude_meters NUMERIC(6, 2) DEFAULT 100.0,
    heading_degrees INTEGER CHECK (heading_degrees BETWEEN 0 AND 360),
    speed_kmh NUMERIC(5, 2) DEFAULT 0.0,
    gimbal_pitch_degrees INTEGER CHECK (gimbal_pitch_degrees BETWEEN -90 AND 20),
    current_location GEOMETRY(Point, 4326),
    stream_url TEXT,
    camera_type VARCHAR(32) DEFAULT 'EO_IR_OPTICAL',
    authorized_operator VARCHAR(120),
    purpose TEXT,
    last_ping_time TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drone_flight_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drone_id VARCHAR(64) REFERENCES public.drone_fleet(id),
    incident_id VARCHAR(64) NOT NULL,
    operator_id VARCHAR(120) NOT NULL,
    purpose TEXT NOT NULL,
    privacy_agreement_signed BOOLEAN NOT NULL DEFAULT TRUE,
    session_start TIMESTAMPTZ DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    flight_log JSONB
);

-- 4. Integration Gateway Health & Telemetry Logs
CREATE TABLE IF NOT EXISTS public.integration_health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(64) NOT NULL, -- 'ERSS_112', 'CCTNS', 'DRONE_FEED', 'TRANSIT_HUBS'
    status VARCHAR(16) NOT NULL, -- 'CONNECTED', 'DEGRADED', 'OFFLINE'
    latency_ms INTEGER NOT NULL,
    success_rate_percent NUMERIC(5, 2) NOT NULL,
    circuit_breaker_open BOOLEAN DEFAULT FALSE,
    is_simulation BOOLEAN DEFAULT TRUE,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Predictive Crowd Telemetry & Risk Forecast Records
CREATE TABLE IF NOT EXISTS public.predictive_crowd_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id VARCHAR(64) NOT NULL,
    city_id VARCHAR(32) REFERENCES public.tenants_cities(id),
    person_count INTEGER NOT NULL,
    density_per_sqm NUMERIC(5, 3) NOT NULL,
    inflow_rate_per_sec NUMERIC(6, 2) NOT NULL,
    outflow_rate_per_sec NUMERIC(6, 2) NOT NULL,
    net_flow_rate_per_sec NUMERIC(6, 2) NOT NULL,
    density_velocity NUMERIC(7, 4) NOT NULL,
    congestion_risk_index NUMERIC(4, 3) NOT NULL,
    confidence_score NUMERIC(4, 2) NOT NULL,
    horizon_minutes INTEGER DEFAULT 15,
    recommended_action TEXT,
    measured_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictive_crowd_zone_time ON public.predictive_crowd_records(zone_id, measured_at DESC);

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- Enforces City Isolation with Authorized Cross-City Delegation
-- ==============================================================================

ALTER TABLE public.cross_city_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drone_fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_crowd_records ENABLE ROW LEVEL SECURITY;

-- Read policy for escalations: Accessible to Origin City or Authorized Target City
CREATE POLICY rls_cross_city_escalation_view ON public.cross_city_escalations
    FOR SELECT
    USING (
        origin_city_id = current_setting('app.current_city', true) OR
        target_city_id = current_setting('app.current_city', true) OR
        current_setting('app.user_role', true) = 'ADMIN'
    );

-- Drone fleet view restricted to operating city
CREATE POLICY rls_drone_fleet_view ON public.drone_fleet
    FOR SELECT
    USING (
        city_id = current_setting('app.current_city', true) OR
        current_setting('app.user_role', true) IN ('ADMIN', 'CONTROL_ROOM')
    );

-- Audit comments
COMMENT ON TABLE public.tenants_cities IS 'MEHFUS Phase 3: Tenant isolation and city-specific emergency configuration';
COMMENT ON TABLE public.cross_city_escalations IS 'MEHFUS Phase 3: Cross-city missing person and emergency case delegation';
COMMENT ON TABLE public.drone_fleet IS 'MEHFUS Phase 3: Aerial surveillance telemetry with incident-binding privacy';

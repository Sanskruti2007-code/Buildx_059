-- ==============================================================================
-- MEHFUS: PHASE 4 — PROACTIVE SAFETY, INTELLIGENCE & OPERATIONAL OPTIMIZATION
-- Model A: Multi-Tenant Schema with PostGIS, pgvector, and Model Governance
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Incident Prioritization Log with Floor Tracking
CREATE TABLE IF NOT EXISTS public.incident_priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(64) NOT NULL,
    city_id VARCHAR(32) REFERENCES public.tenants_cities(id),
    raw_score NUMERIC(5, 2) NOT NULL,
    effective_score NUMERIC(5, 2) NOT NULL, -- P_score
    safety_floor NUMERIC(5, 2) NOT NULL, -- P_floor
    is_floor_enforced BOOLEAN NOT NULL DEFAULT FALSE,
    severity_score NUMERIC(5, 2),
    urgency_score NUMERIC(5, 2),
    vulnerability_score NUMERIC(5, 2),
    time_decay_score NUMERIC(5, 2),
    reason_codes TEXT[] DEFAULT '{}',
    model_version VARCHAR(64) DEFAULT 'v4.2-calibrated',
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_priority_score ON public.incident_priorities(city_id, effective_score DESC);

-- 2. Safety Patterns & Recurring Hotspots
CREATE TABLE IF NOT EXISTS public.safety_patterns (
    id VARCHAR(64) PRIMARY KEY, -- 'PAT-NGP-01'
    city_id VARCHAR(32) REFERENCES public.tenants_cities(id),
    pattern_type VARCHAR(64) NOT NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    center_location GEOMETRY(Point, 4326) NOT NULL,
    radius_meters NUMERIC(7, 2) NOT NULL,
    incident_count INTEGER NOT NULL,
    time_window_description VARCHAR(120),
    trend VARCHAR(32) DEFAULT 'STABLE', -- 'INCREASING', 'STABLE', 'DECREASING'
    confidence_score NUMERIC(4, 3) NOT NULL,
    suggested_mitigation TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Human-in-the-Loop Operator Recommendations & Feedback
CREATE TABLE IF NOT EXISTS public.operator_recommendation_feedback (
    id VARCHAR(64) PRIMARY KEY, -- 'REC-NGP-01'
    city_id VARCHAR(32) REFERENCES public.tenants_cities(id),
    target_zone_id VARCHAR(64) NOT NULL,
    recommendation_type VARCHAR(64) NOT NULL,
    headline TEXT NOT NULL,
    rationale TEXT NOT NULL,
    confidence_score NUMERIC(4, 3) NOT NULL,
    decision VARCHAR(32) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'MODIFIED'
    operator_id VARCHAR(120),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    suggested_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Post-Incident Learning & Operational Response-Time Analytics
CREATE TABLE IF NOT EXISTS public.post_incident_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(64) NOT NULL,
    city_id VARCHAR(32) REFERENCES public.tenants_cities(id),
    case_type VARCHAR(64) NOT NULL,
    mtta_seconds INTEGER NOT NULL, -- Mean Time to Acknowledge
    mttd_seconds INTEGER NOT NULL, -- Mean Time to Dispatch
    mtt_arrival_seconds INTEGER NOT NULL, -- Mean Time to Arrival
    mttr_seconds INTEGER NOT NULL, -- Mean Time to Resolution
    total_volunteers_engaged INTEGER DEFAULT 0,
    external_latency_ms INTEGER DEFAULT 0,
    policy_triggered VARCHAR(120),
    identified_bottlenecks TEXT[] DEFAULT '{}',
    resolution_status VARCHAR(32) DEFAULT 'REUNITED',
    closed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Model Governance Registry & Drift Telemetry
CREATE TABLE IF NOT EXISTS public.model_governance_registry (
    model_id VARCHAR(64) PRIMARY KEY, -- 'mdl-incident-priority-v4'
    name VARCHAR(120) NOT NULL,
    version VARCHAR(32) NOT NULL,
    purpose TEXT NOT NULL,
    algorithm_type VARCHAR(64) NOT NULL,
    baseline_accuracy NUMERIC(5, 3) NOT NULL,
    is_drift_detected BOOLEAN DEFAULT FALSE,
    drift_metric_value NUMERIC(5, 4),
    operator_acceptance_rate NUMERIC(5, 2) DEFAULT 90.0,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- 'ACTIVE', 'DEGRADED', 'ROLLED_BACK'
    last_audited_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial model governance records
INSERT INTO public.model_governance_registry (model_id, name, version, purpose, algorithm_type, baseline_accuracy, operator_acceptance_rate)
VALUES 
  ('mdl-p-score-v4', 'Multi-Factor Incident Prioritizer', 'v4.2', 'Continuous emergency ranking with safety floor override', 'DETERMINISTIC_RULES', 0.985, 94.2),
  ('mdl-crowd-physics-v3', 'Predictive Logistic Crowd Forecaster', 'v3.1', '15m Lookahead Fruin LOS stampede risk estimation', 'MULTIVARIATE_LOGISTIC', 0.940, 91.5),
  ('mdl-pattern-cluster-v4', 'Spatio-Temporal Pattern Clustering', 'v4.0', 'Identifies recurring routes, transit hubs, and duplicate reports', 'SPATIO_TEMPORAL_CLUSTERING', 0.890, 88.0),
  ('mdl-case-summary-v4', 'Grounded Case Timeline Synthesizer', 'v1.5', 'Source-attributed operational briefs via Gemini 1.5 Flash', 'GEMINI_ASSISTIVE_NLP', 0.960, 96.0)
ON CONFLICT (model_id) DO NOTHING;

-- 6. Incident Semantic Embedding Table (pgvector)
CREATE TABLE IF NOT EXISTS public.incident_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(64) NOT NULL,
    city_id VARCHAR(32) REFERENCES public.tenants_cities(id),
    category VARCHAR(64) NOT NULL,
    embedding vector(384), -- 384-dimensional vector embedding
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.incident_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_incident_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_incident_priorities_view ON public.incident_priorities
    FOR SELECT
    USING (
        city_id = current_setting('app.current_city', true) OR
        current_setting('app.user_role', true) IN ('ADMIN', 'CONTROL_ROOM')
    );

CREATE POLICY rls_safety_patterns_view ON public.safety_patterns
    FOR SELECT
    USING (
        city_id = current_setting('app.current_city', true) OR
        current_setting('app.user_role', true) IN ('ADMIN', 'CONTROL_ROOM')
    );

COMMENT ON TABLE public.incident_priorities IS 'MEHFUS Phase 4: Continuous multi-factor priority scores with safety floors';
COMMENT ON TABLE public.operator_recommendation_feedback IS 'MEHFUS Phase 4: Human-in-the-loop decision auditing and feedback';
COMMENT ON TABLE public.model_governance_registry IS 'MEHFUS Phase 4: AI/ML model metadata and drift monitoring';

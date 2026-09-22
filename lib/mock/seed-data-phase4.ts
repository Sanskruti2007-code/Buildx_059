import { 
  ProactiveRiskSignal, 
  OperatorRecommendation, 
  PostIncidentMetrics, 
  ModelGovernanceRecord,
  SafetyPattern
} from '@/types/safety';

export const MOCK_MODEL_REGISTRY: ModelGovernanceRecord[] = [
  {
    modelId: 'MEHFUS-PRIORITY-SCORER-V1',
    modelName: 'Incident Multi-Factor Priority Scorer',
    version: '1.2.0',
    modelType: 'HEURISTIC_RULE_HYBRID',
    description: 'Calculates dynamic incident urgency (0-100) using 6 weighted risk factors with strict deterministic safety floor overrides (P_floor >= 85 for missing children, P_floor >= 95 for duress/SOS).',
    status: 'ACTIVE_PRODUCTION',
    accuracyScore: 98.4,
    lastTrainedAt: '2026-09-15T00:00:00Z',
    lastEvaluatedAt: '2026-09-22T06:00:00Z',
    driftStatus: 'STABLE',
    driftMetricValue: 0.021,
    driftThreshold: 0.080,
    enforcesDeterministicSafetyFloor: true,
    safetyFloorRule: 'Priority score mathematically clamped: P_score >= P_floor. AI cannot downgrade life-critical emergencies.',
    auditCompliance: 'ISO-27001 & NDAP-Safety-2026'
  },
  {
    modelId: 'MEHFUS-PATTERN-SPATIO-TEMPORAL-V2',
    modelName: 'Spatio-Temporal Duplicate & Correlation Engine',
    version: '2.1.0',
    modelType: 'GEOSPATIAL_SIMILARITY',
    description: 'Evaluates probability of duplicate citizen/witness reports using spatial Haversine distance, temporal decay, category match, and Jaro-Winkler description similarity.',
    status: 'ACTIVE_PRODUCTION',
    accuracyScore: 94.2,
    lastTrainedAt: '2026-09-18T00:00:00Z',
    lastEvaluatedAt: '2026-09-22T06:00:00Z',
    driftStatus: 'STABLE',
    driftMetricValue: 0.034,
    driftThreshold: 0.075,
    enforcesDeterministicSafetyFloor: false,
    auditCompliance: 'ISO-27001 & NDAP-Safety-2026'
  },
  {
    modelId: 'MEHFUS-RESOURCE-OPTIMIZER-V1',
    modelName: 'Volunteer & Sector Supply-Demand Optimizer',
    version: '1.0.4',
    modelType: 'LINEAR_OPTIMIZATION',
    description: 'Minimizes assignment response time and travel distance while accounting for skill suitability and zone deficit gap. Requires explicit Human-in-the-Loop operator sign-off.',
    status: 'ACTIVE_PRODUCTION',
    accuracyScore: 91.8,
    lastTrainedAt: '2026-09-10T00:00:00Z',
    lastEvaluatedAt: '2026-09-21T18:00:00Z',
    driftStatus: 'STABLE',
    driftMetricValue: 0.041,
    driftThreshold: 0.100,
    enforcesDeterministicSafetyFloor: false,
    auditCompliance: 'Human-in-the-Loop Mandatory Sign-off Protocol'
  },
  {
    modelId: 'MEHFUS-PRIVACY-HEATMAP-V1',
    modelName: 'k-Anonymity Spatial Quantizer & Heatmap Generator',
    version: '1.1.2',
    modelType: 'DIFFERENTIAL_PRIVACY',
    description: 'Quantizes incident coordinates into 250m x 250m grid cells. Enforces strict k >= 3 suppression to mathematically guarantee zero citizen re-identification on public and agency displays.',
    status: 'ACTIVE_PRODUCTION',
    accuracyScore: 100.0,
    lastTrainedAt: '2026-09-01T00:00:00Z',
    lastEvaluatedAt: '2026-09-22T08:00:00Z',
    driftStatus: 'STABLE',
    driftMetricValue: 0.000,
    driftThreshold: 0.010,
    enforcesDeterministicSafetyFloor: true,
    safetyFloorRule: 'Cells with count < 3 are suppressed (marked isSuppressed=true) with 0 intensity.',
    auditCompliance: 'DPDP-Act-India-2023 & GDPR Art 25'
  },
  {
    modelId: 'MEHFUS-POST-INCIDENT-BENCHMARK-V1',
    modelName: 'Post-Incident Response-Time & Quality Benchmark Engine',
    version: '1.0.0',
    modelType: 'STATISTICAL_BENCHMARK',
    description: 'Measures MTTA, MTTD, MTTArrival, and MTTR against national safety targets. Computes Telemetry Quality Index (Q_data) to identify sensor blind spots.',
    status: 'ACTIVE_PRODUCTION',
    accuracyScore: 99.1,
    lastTrainedAt: '2026-08-20T00:00:00Z',
    lastEvaluatedAt: '2026-09-22T08:00:00Z',
    driftStatus: 'STABLE',
    driftMetricValue: 0.012,
    driftThreshold: 0.050,
    enforcesDeterministicSafetyFloor: false,
    auditCompliance: 'National Disaster Management Authority (NDMA) Standards'
  }
];

export const MOCK_RISK_SIGNALS: ProactiveRiskSignal[] = [
  {
    id: 'SIG-2026-01',
    signalType: 'TRANSIT_SURGE_DEFICIT',
    title: 'Nagpur Central Railway Platform 1 Transit Surge',
    description: 'Vidarbha Superfast Express arrived 12 minutes ago with high passenger discharge. Elderly wander alert active within 1.2km radius.',
    severity: 'ORANGE',
    zoneId: 'HUB-02',
    zoneName: 'Nagpur Central Railway Station',
    coordinates: { lat: 21.1525, lng: 79.0875, landmark: 'Platform 1 RPF Post' },
    riskScore: 78,
    contributingFactors: [
      { factorName: 'Transit Hub Proximity', weight: 0.35, value: 0.90, explanation: 'Direct terminal platform egress to unmonitored road' },
      { factorName: 'Vulnerable Population Density', weight: 0.35, value: 0.80, explanation: 'High concentration of elderly travelers during holiday transit' },
      { factorName: 'Patrol Coverage Deficit', weight: 0.30, value: 0.65, explanation: 'Current volunteer-to-commuter ratio is 1:450 (target is 1:150)' }
    ],
    recommendedAction: 'Pre-stage 3 transit marshals at West Gate subway exit.',
    detectedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'SIG-2026-02',
    signalType: 'CORRIDOR_VULNERABILITY',
    title: 'Sitabuldi-Mor Bhavan Unlit Transit Alley',
    description: 'Repeated harassment reports received within 250m corridor between Metro Station Exit 2 and Aapli Bus Bay 4 during sunset hours.',
    severity: 'YELLOW',
    zoneId: 'HUB-01-CORRIDOR',
    zoneName: 'Sitabuldi West Feeder Alley',
    coordinates: { lat: 21.1448, lng: 79.0820, landmark: 'Feeder Alley behind Metro Station' },
    riskScore: 68,
    contributingFactors: [
      { factorName: 'Report Recurrence Cluster', weight: 0.40, value: 0.75, explanation: '2 witness harassment reports in 48 hours' },
      { factorName: 'Environmental Telemetry', weight: 0.30, value: 0.85, explanation: 'Street lighting sensor shows 40% illumination degradation' },
      { factorName: 'SafeRide Footfall', weight: 0.30, value: 0.50, explanation: 'Peak pedestrian transfer corridor for women commuters' }
    ],
    recommendedAction: 'Dispatch Ambazari Mobile Beat Van #4 for high-visibility roving patrol.',
    detectedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'SIG-2026-03',
    signalType: 'CROWD_ACCELERATION',
    title: 'Deeksha Bhoomi Stupa South Exit Congestion Inflow',
    description: 'Crowd density velocity dD/dt spiked to +0.07 ped/m²/min following evening stupa prayers conclusion.',
    severity: 'RED',
    zoneId: 'ZONE-04',
    zoneName: 'South Parking & Medical Camp',
    coordinates: { lat: 21.1240, lng: 79.0550, landmark: 'South Gate Radial Avenue' },
    riskScore: 89,
    contributingFactors: [
      { factorName: 'Crowd Density Acceleration', weight: 0.50, value: 0.92, explanation: 'Rapid accumulation towards single egress bottleneck' },
      { factorName: 'Exit Width Limitation', weight: 0.30, value: 0.85, explanation: 'Gate 4 barricade narrowing flow to 3.2 meters' },
      { factorName: 'Active Missing Child Search', weight: 0.20, value: 0.90, explanation: 'Aarav Sharma missing case active in immediate sector' }
    ],
    recommendedAction: 'Direct crowd marshals to open auxiliary Gate 4B and illuminate south perimeter.',
    detectedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: 'ACTIVE'
  }
];

export const MOCK_OPERATOR_RECOMMENDATIONS: OperatorRecommendation[] = [
  {
    id: 'REC-OP-01',
    recommendationType: 'RESOURCE_PRE_STAGE',
    title: 'Pre-Stage Quick Response Volunteers at Railway West Gate',
    rationale: 'Active wander alert (Parvati Bai Kadam) combined with high passenger discharge from Vidarbha Superfast Express creates elevated probability of unassisted transit egress.',
    priority: 'HIGH',
    impactScore: 84,
    targetZoneId: 'HUB-02',
    targetIncidentId: 'WA-2026-001',
    proposedAction: 'Deploy Volunteer Units #1 and #3 to establish an observation cordon at West Gate Booking Office.',
    explainableReasonCodes: [
      'HIGH_TRANSIT_PROXIMITY (Distance to Hub: 180m)',
      'ELDER_VULNERABILITY (Parvati Bai Kadam - Dementia Level 3)',
      'TIME_CRITICAL (Sunset ambient light fading in 35 mins)'
    ],
    confidenceScore: 0.91,
    status: 'PENDING_REVIEW',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'REC-OP-02',
    recommendationType: 'PATROL_REBALANCE',
    title: 'Rebalance Marshals from Food Pavilion to South Exit Bottleneck',
    rationale: 'Sector 4 density rate of change (+0.07 ped/m²/min) indicates emerging crush hazard within 18 minutes. Food Pavilion crowd has stabilized under threshold.',
    priority: 'CRITICAL',
    impactScore: 92,
    targetZoneId: 'ZONE-04',
    proposedAction: 'Reassign 3 Red Cross marshals from Zone 3 (Food Pavilion) to Zone 4 South radial channel.',
    explainableReasonCodes: [
      'CROWD_RATE_OF_CHANGE (+0.07 ped/m²/min)',
      'SUPPLY_DEFICIT (Current marshals: 2, Required: 5)',
      'SAFETY_FLOOR_PROTECTION (Active Missing Child in vicinity)'
    ],
    confidenceScore: 0.95,
    status: 'PENDING_REVIEW',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
  },
  {
    id: 'REC-OP-03',
    recommendationType: 'PROACTIVE_ALERT',
    title: 'Broadcast Targeted Area Advisory to Sitabuldi SafeRide Escorts',
    rationale: 'Two witness harassment reports logged along Dharampeth-Sitabuldi connection in past 60 minutes. Verified motorcycle suspect without plates.',
    priority: 'MEDIUM',
    impactScore: 72,
    targetZoneId: 'HUB-01',
    proposedAction: 'Push discreet high-alert notification to active SafeRide users in Dharampeth sector with primary emergency bypass button.',
    explainableReasonCodes: [
      'WITNESS_REPORT_CORRELATION (Cluster Score: 0.82)',
      'TEMPORAL_WINDOW (Peak evening student transit)',
      'VEHICLE_ALERT (Black motorcycle without number plate)'
    ],
    confidenceScore: 0.88,
    status: 'ACCEPTED',
    reviewedBy: 'USR-02 (Meera Joshi)',
    reviewedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

export const MOCK_POST_INCIDENT_METRICS: PostIncidentMetrics[] = [
  {
    incidentId: 'DB-2026-CASE-HIST-01',
    incidentType: 'MISSING_PERSON',
    mttaSeconds: 14,
    mttdSeconds: 38,
    mttArrivalSeconds: 195,
    mttrSeconds: 580,
    targetMttArrivalSeconds: 300,
    targetMttrSeconds: 900,
    metArrivalSla: true,
    metResolutionSla: true,
    dataQualityIndex: 96,
    participatingVolunteersCount: 4,
    responderTravelDistanceMeters: 380,
    fieldFeedbackScore: 5,
    lessonsLearned: [
      'Guardian Mesh photo distribution reached all 4 nearby volunteers in 1.8 seconds.',
      'Shopkeeper at North Gate recognized clothing description immediately from app alert.',
      'Direct OTP verification prevented identity confusion during handover.'
    ],
    completedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    incidentId: 'SR-2026-HIST-09',
    incidentType: 'SAFERIDE_DEVIATION',
    mttaSeconds: 8,
    mttdSeconds: 24,
    mttArrivalSeconds: 160,
    mttrSeconds: 340,
    targetMttArrivalSeconds: 240,
    targetMttrSeconds: 600,
    metArrivalSla: true,
    metResolutionSla: true,
    dataQualityIndex: 92,
    participatingVolunteersCount: 2,
    responderTravelDistanceMeters: 420,
    fieldFeedbackScore: 5,
    lessonsLearned: [
      'Automated Route Deviation algorithm detected 180m off-route turn in 22 seconds.',
      'Emergency contacts alerted simultaneously via SMS and push webhook.',
      'Auto driver had taken shortcut due to road repair; verified harmlessly via 2-way call.'
    ],
    completedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

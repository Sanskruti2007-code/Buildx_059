export type Role = 'CITIZEN' | 'VOLUNTEER' | 'HELP_DESK' | 'CONTROL_ROOM' | 'ADMIN';

export type IncidentStatus = 
  | 'REPORTED' 
  | 'VERIFIED' 
  | 'SEARCHING' 
  | 'MATCH_CANDIDATE_FOUND' 
  | 'REUNITED' 
  | 'CLOSED';

export type AlertSeverity = 'YELLOW' | 'ORANGE' | 'RED';

export type VolunteerStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type TaskStatus = 
  | 'ASSIGNED' 
  | 'ACCEPTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'DECLINED' 
  | 'EXPIRED' 
  | 'ESCALATED';

export type CrowdThresholdLevel = 'NORMAL' | 'ELEVATED' | 'CRITICAL' | 'EMERGENCY';

export type DataProvenance = 'MEASURED' | 'MANUAL' | 'SIMULATED';

export interface Coordinates {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  landmark?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  isVerified: boolean;
  activeLocation?: Coordinates;
  trustedContacts?: string[];
  createdAt: string;
}

export interface ChildProfile {
  id: string;
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  photoUrl: string;
  fullBodyPhotoUrl?: string;
  clothingTop: string;
  clothingBottom: string;
  clothingFootwear?: string;
  birthmarks?: string;
  heightCm?: number;
  languagesSpoken: string[];
  createdAt: string;
}

export interface MissingChildCase {
  id: string; // e.g. "DB-2026-CASE-01"
  childId?: string;
  childName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  photoUrl: string;
  fullBodyPhotoUrl?: string;
  clothing: {
    top: string;
    bottom: string;
    footwear?: string;
    accessories?: string;
  };
  identifyingFeatures?: string;
  lastSeenLocation: Coordinates;
  lastSeenTime: string;
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  status: IncidentStatus;
  severity: AlertSeverity;
  otpVerified: boolean;
  assignedOfficer?: string;
  searchRadiusMeters: number; // default 2000m
  assignedVolunteersCount: number;
  reunitedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoundChildReport {
  id: string; // e.g. "DB-2026-FOUND-04"
  reportType: 'DOUBT_REPORT' | 'SIGHTING_TIP'; // Distinction: Doubt = finder has child; Sighting = saw child
  isAnonymous: boolean;
  finderName?: string;
  finderPhone?: string;
  childPhotoUrl?: string;
  estimatedAge: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  foundLocation: Coordinates;
  foundTime: string;
  clothing: {
    top: string;
    bottom: string;
    notes?: string;
  };
  languageSpoken?: string;
  currentPhysicalStatus?: string; // e.g. "Safe at Help Desk 2", "Wandering near Gate 1"
  matchedCaseId?: string;
  matchScore?: number;
  status: 'PENDING_REVIEW' | 'MATCH_CANDIDATE' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface MatchBreakdown {
  faceSimilarity: number;     // 0.0 - 1.0 (weight 0.40)
  locationScore: number;      // 0.0 - 1.0 (weight 0.25)
  timeScore: number;          // 0.0 - 1.0 (weight 0.15)
  ageCompatibility: number;   // 0.0 - 1.0 (weight 0.10)
  clothingSimilarity: number; // 0.0 - 1.0 (weight 0.10)
  genderGatePassed: boolean;
}

export interface MatchCandidate {
  id: string;
  missingCaseId: string;
  foundReportId: string;
  compositeScore: number; // 0.0 - 1.0
  breakdown: MatchBreakdown;
  humanVerified: boolean;
  verifiedBy?: string;
  decision?: 'CONFIRMED' | 'REJECTED' | 'UNDER_REVIEW';
  decisionNotes?: string;
  createdAt: string;
}

export interface GuardianAlert {
  id: string;
  caseId: string;
  severity: AlertSeverity;
  headline: string;
  description: string;
  targetRadiusMeters: number;
  epicenter: Coordinates;
  dispatchedToCount: number;
  createdAt: string;
  expiresAt: string;
}

export interface VolunteerTask {
  id: string;
  volunteerId: string;
  volunteerName: string;
  caseId: string;
  childSummary: {
    name: string;
    age: number;
    gender: string;
    clothing: string;
    photoUrl: string;
  };
  searchZoneName: string;
  searchCoordinates: Coordinates;
  status: TaskStatus;
  safetyCheckinCount: number;
  lastCheckinTime?: string;
  assignedAt: string;
  expiresAt: string; // 60s cascade timeout
  completedAt?: string;
}

export interface CrowdZone {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  densityPercentage: number;
  thresholdLevel: CrowdThresholdLevel;
  provenance: DataProvenance;
  coordinates: Coordinates;
  polygonBoundary?: Coordinates[];
  recommendation: string;
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: Role;
  action: string;
  targetType: 'CASE' | 'FOUND_REPORT' | 'MATCH' | 'VOLUNTEER' | 'ALERT' | 'CROWD' | 'SAFERIDE' | 'WITNESS' | 'ELDERLY' | 'QR';
  targetId: string;
  ipAddress: string;
  details: Record<string, any>;
}

// ====================================================================
// PHASE 2 DOMAIN MODELS: CITY-WIDE DAILY SAFETY
// ====================================================================

export type SafeRideStatus = 'IDLE' | 'ACTIVE' | 'ANOMALY_DETECTED' | 'ESCALATED' | 'COMPLETED' | 'CANCELLED';

export type SafetyState = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'RESOLVED' | 'FALSE_ALARM';

export interface RoutePoint extends Coordinates {
  order: number;
}

export interface VehicleDetails {
  vehicleNumber: string; // e.g. "MH-31-FA-4290"
  vehicleType: 'AUTO_RICKSHAW' | 'CAB_TAXI' | 'BUS' | 'PRIVATE_CAR' | 'TWO_WHEELER';
  driverName?: string;
  driverPhone?: string;
  driverPhotoUrl?: string;
  rideServiceProvider?: string; // e.g. "Ola", "Uber", "Nagpur Auto"
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: 'FAMILY' | 'FRIEND' | 'COLLEAGUE' | 'GUARDIAN';
  isVerified: boolean;
  priorityOrder: number; // 1 to 5
  receiveSmsOnYellow: boolean;
  receiveSmsOnOrange: boolean;
}

export interface SafeRideSession {
  id: string; // e.g. "SR-2026-089"
  userId: string;
  userName: string;
  userPhone: string;
  startLocation: Coordinates;
  destination: Coordinates;
  currentLocation: Coordinates;
  expectedRoute: RoutePoint[];
  vehicleDetails?: VehicleDetails;
  status: SafeRideStatus;
  safetyState: SafetyState;
  deviationMeters: number;
  stationarySeconds: number;
  anomalyReason?: string;
  countdownSecondsRemaining?: number;
  duressTriggered: boolean;
  startedAt: string;
  lastPingAt: string;
  completedAt?: string;
}

export type WitnessAnonymityLevel = 'ANONYMOUS' | 'CONFIDENTIAL' | 'IDENTIFIED';

export type WitnessCategory = 
  | 'HARASSMENT' 
  | 'SUSPICIOUS_ACTIVITY' 
  | 'CHAIN_SNATCHING' 
  | 'PUBLIC_SAFETY_HAZARD' 
  | 'DOMESTIC_DISTRESS' 
  | 'TRANSPORT_SAFETY';

export interface WitnessReport {
  id: string; // e.g. "WIT-2026-021"
  trackingCode: string; // e.g. "WR-X892-K"
  anonymityLevel: WitnessAnonymityLevel;
  reporterName?: string;
  reporterPhone?: string;
  category: WitnessCategory;
  description: string;
  location: Coordinates;
  incidentTime: string;
  mediaUrls: string[];
  exifScrubbed: boolean;
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'VERIFIED' | 'RESOLVED' | 'DISMISSED';
  assignedAuthority?: string;
  createdAt: string;
}

export interface SafeZone {
  id: string;
  name: string;
  center: Coordinates;
  radiusMeters: number; // e.g. 400m
  zoneType: 'HOME' | 'COMMUNITY' | 'HEALTHCARE' | 'RELATIVE';
}

export interface ElderProfile {
  id: string; // e.g. "ELD-2026-01"
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  photoUrl: string;
  conditionNotes?: string; // e.g. "Mild memory loss, speaks Marathi"
  safeZones: SafeZone[];
  lastKnownLocation: Coordinates;
  currentStatus: 'SAFE_IN_ZONE' | 'WANDERING_DETECTED' | 'OFFLINE';
  qrTokenId: string;
  lastCheckinTime: string;
}

export interface WanderAlert {
  id: string;
  elderId: string;
  elderName: string;
  guardianPhone: string;
  triggerZoneName: string;
  distanceFromSafeZoneMeters?: number;
  distanceOutsideMeters: number;
  currentLocation: Coordinates;
  severity: AlertSeverity;
  status: 'ACTIVE_SEARCH' | 'LOCATED' | 'RESOLVED';
  assignedRespondersCount: number;
  triggeredAt: string;
  resolvedAt?: string;
}

export interface QRIdentity {
  id: string;
  token: string; // Opaque signed token: "MEHFUS-QR:v1:..."
  subjectType: 'ELDER' | 'CHILD' | 'SPECIAL_ASSIST';
  subjectId: string;
  subjectName: string;
  guardianPhoneEncrypted: string;
  status: 'ACTIVE' | 'REVOKED';
  issuedAt: string;
  revokedAt?: string;
}

export type TransportType = 'METRO' | 'RAILWAY' | 'BUS_TERMINUS' | 'AIRPORT';

export interface TransportHub {
  id: string;
  name: string;
  type: TransportType;
  coordinates: Coordinates;
  operatorName: string;
  policeBoothPhone: string;
  activeIncidentsCount: number;
  lastBroadcastNotice?: string;
  status: 'NORMAL' | 'HIGH_ALERT' | 'STANDBY';
}

// ==========================================
// PHASE 3 — CITY SCALE & PREDICTIVE SAFETY
// ==========================================

export interface CityConfig {
  id: string; // e.g. 'nagpur', 'mumbai', 'pune'
  name: string;
  state: string;
  country: string;
  countryCode: string; // 'IN', 'GB', 'KE'
  emergencyNumber: string; // '112', '999'
  policeHelpline: string;
  womenHelpline: string;
  centerCoordinates: Coordinates;
  defaultZoom: number;
  geoFences?: Coordinates[][];
  transportHubCount: number;
  activeRespondersCount: number;
  cctnsStationCode: string;
  erssZoneCode: string;
  droneBaseCount: number;
  currency: string;
  timeZone: string;
  locale: string;
}

export type TriStateDataCategory = 'OBSERVED' | 'DERIVED' | 'PREDICTED';

export interface PredictiveCrowdMetrics {
  zoneId: string;
  zoneName: string;
  areaSqMeters: number;
  currentCount: number;
  densityPeoplePerSqMeter: number; // rho = N / A
  inflowRatePerSec: number;
  outflowRatePerSec: number;
  netFlowRatePerSec: number; // q_net = in - out
  densityVelocity: number; // v_rho = d(rho)/dt
  congestionRiskIndex: number; // R_cong in [0, 1]
  confidenceScore: number; // C_pred in [0, 1]
  predictionHorizonMinutes: number; // e.g. 15
  category: TriStateDataCategory;
  recommendedAction: string;
  lastCalculatedAt: string;
}

export type EscalationScope = 'MINIMAL_SEARCH_VECTORS' | 'FULL_CASE_DOSSIER';
export type EscalationStatus = 'PENDING_APPROVAL' | 'AUTHORIZED' | 'REJECTED' | 'CONCLUDED';

export interface CrossCityEscalation {
  id: string; // e.g. "ESC-2026-089"
  incidentId: string;
  incidentType: 'MISSING_PERSON' | 'WOMEN_SAFETY' | 'WANDER_ALERT' | 'HIGH_ALERT';
  originCityId: string;
  targetCityId: string;
  authorizedBy: string;
  authorizationToken: string;
  reason: string;
  escalatedAt: string;
  status: EscalationStatus;
  sharedScope: EscalationScope;
  auditTrailId: string;
  targetCityAcknowledged: boolean;
  transitHubRef?: string;
}

export type DroneStatus = 'AIRBORNE' | 'PATROLLING' | 'HOVERING_INCIDENT' | 'RETURNING' | 'DOCKED';
export type DroneCameraType = 'EO_IR_OPTICAL' | 'NIGHT_VISION' | 'THERMAL';

export interface DroneTelemetry {
  id: string; // e.g. "DRONE-NGP-ALPHA-1"
  callsign: string;
  cityId: string;
  assignedIncidentId?: string;
  status: DroneStatus;
  batteryPercent: number;
  altitudeMeters: number;
  headingDegrees: number;
  speedKmh: number;
  gimbalPitchDegrees: number;
  coordinates: Coordinates;
  streamUrl: string;
  flightTrail: Coordinates[];
  authorizedOperator: string;
  purpose: string;
  cameraType: DroneCameraType;
  lastPingTime: string;
}

export type IntegrationStatus = 'CONNECTED' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN';

export interface AdapterHealth {
  id: string;
  name: string;
  serviceType: 'ERSS_112' | 'CCTNS' | 'DRONE_FEED' | 'TRANSIT_HUBS' | 'CARTO_MAPS' | 'SMS_GATEWAY';
  status: IntegrationStatus;
  latencyMs: number;
  successRatePercent: number;
  circuitBreakerOpen: boolean;
  lastCheckedAt: string;
  endpointUrl: string;
  isSimulation: boolean;
}

export interface DispatchCandidate {
  responderId: string;
  name: string;
  phone: string;
  role: 'POLICE' | 'MEDICAL' | 'VOLUNTEER' | 'RAPID_ACTION';
  cityId: string;
  policeStationZone: string;
  distanceKm: number;
  capabilityMatch: number; // 0.0 - 1.0
  activeWorkload: number;
  jurisdictionAffinity: number; // 0.0 - 1.0
  compositeDispatchScore: number; // 0.0 - 1.0
  isCrossCity: boolean;
}

// ==============================================================================
// PHASE 4 — PROACTIVE SAFETY, INTELLIGENCE & OPERATIONAL OPTIMIZATION
// ==============================================================================

export interface PriorityRecommendation {
  incidentId: string;
  rawScore: number; // 0 - 100
  effectiveScore: number; // P_score in [0, 100]
  safetyFloor: number; // P_floor in [0, 100]
  isFloorEnforced: boolean;
  contributingFactors: {
    severityScore: number;
    urgencyScore: number;
    vulnerabilityScore: number;
    timeDecayScore: number;
    populationImpactScore: number;
    responderScarcityScore: number;
  };
  reasonCodes: string[];
  modelVersion: string;
  evaluatedAt: string;
}

export type PatternType = 
  | 'REPEATED_ROUTE_DEVIATION' 
  | 'TRANSIT_HOTSPOT_SURGE' 
  | 'RECURRENT_ELDER_WANDER' 
  | 'WITNESS_CONCENTRATION' 
  | 'RESPONDER_DEFICIT_ZONE';

export interface SafetyPattern {
  id: string; // e.g. "PAT-2026-01"
  cityId: string;
  type: PatternType;
  title: string;
  description: string;
  centerCoordinates: Coordinates;
  radiusMeters: number;
  incidentCount: number;
  timeWindowDescription: string; // e.g. "Past 7 days, 18:00 - 22:00"
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  confidenceScore: number; // 0.0 - 1.0
  suggestedMitigation: string;
  detectedAt: string;
}

export type SafetyPostureLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface ProactiveRiskSignal {
  id: string;
  cityId?: string;
  zoneId?: string;
  zoneName?: string;
  signalType?: string;
  level?: SafetyPostureLevel;
  severity?: SafetyPostureLevel;
  title: string;
  evidenceSummary?: string;
  description?: string;
  contributingFactors?: (string | { factorName: string; weight: number; value: number; explanation: string })[];
  riskScore?: number;
  dataFreshnessQuality?: number; // Q_data in [0.0, 1.0]
  confidence?: number;
  actionGuidance?: string;
  recommendedAction?: string;
  coordinates?: Coordinates;
  timestamp?: string;
  detectedAt?: string;
  status?: string;
}

export interface GroundedTimelineEvent {
  id?: string;
  timestamp: string;
  source?: 'FAMILY_REPORT' | 'MESH_BROADCAST' | 'WITNESS_REPORT' | 'CAD_112' | 'VOLUNTEER_TASK' | 'CITIZEN_REPORT' | 'CCTNS_FIR' | 'DRONE_PATROL' | 'CONTROL_ROOM' | string;
  sourceType?: 'CAD_112' | 'VOLUNTEER_TASK' | 'CITIZEN_REPORT' | 'CCTNS_FIR' | 'DRONE_PATROL' | 'CONTROL_ROOM' | string;
  event?: string;
  description?: string;
  recordRefId?: string;
  reliability?: number;
  confidence?: number;
  coordinates?: Coordinates;
  corroboratingEvidenceIds?: string[];
  verified?: boolean;
}

export interface CorroboratedHypothesis {
  hypothesis: string;
  confidence: number;
  supportingEvidenceCount: number;
  conflictingEvidenceCount: number;
  rationale: string;
}

export interface CaseConfidenceMetrics {
  timelineCoverageScore: number;
  sourceDiversityScore: number;
  spatialConsistencyScore: number;
  overallConfidence: number;
}

export interface CaseIntelligenceSummary {
  caseId: string;
  incidentType?: string;
  summaryText?: string;
  groundedTimeline: GroundedTimelineEvent[];
  corroboratedHypotheses: CorroboratedHypothesis[];
  confidenceMetrics: CaseConfidenceMetrics;
  keyVerifiedFacts?: string[];
  outstandingActionItems?: string[];
  recommendedNextSteps: string[];
  associatedWitnessReportIds?: string[];
  potentialDuplicateIds?: string[];
  relatedCaseIds?: string[];
  cctnsFirNumber?: string;
  cadDispatchRef?: string;
  modelVersion?: string;
  generatedAt?: string;
  lastSynthesizedAt: string;
}

export type RecommendationType = 
  | 'REPOSITION_VOLUNTEERS' 
  | 'OPEN_AUXILIARY_GATE' 
  | 'DISPATCH_MOBILE_PATROL' 
  | 'HEIGHTEN_MONITORING' 
  | 'MERGE_DUPLICATE_DOSSIERS'
  | 'RESOURCE_PRE_STAGE'
  | 'PATROL_REBALANCE'
  | 'PROACTIVE_ALERT';

export type OperatorDecision = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'MODIFIED' | 'PENDING_REVIEW';

export interface OperatorRecommendation {
  id: string;
  cityId?: string;
  targetZoneId?: string;
  targetZoneName?: string;
  targetIncidentId?: string;
  type?: RecommendationType;
  recommendationType?: RecommendationType;
  headline?: string;
  title?: string;
  rationale: string;
  proposedAction?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impactScore?: number;
  dataPoints?: string[];
  explainableReasonCodes?: string[];
  confidenceScore: number; // 0.0 - 1.0
  decision?: OperatorDecision;
  status?: OperatorDecision;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  suggestedActionPayload?: Record<string, any>;
  createdAt: string;
}


export interface PrivacyHeatmapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface PrivacyHeatmapCell {
  cellId: string;
  gridX: number;
  gridY: number;
  centerCoordinates: Coordinates;
  bounds: PrivacyHeatmapBounds;
  rawCount: number;
  incidentCount: number;
  intensity: number; // 0.0 - 1.0
  isSuppressed: boolean; // k-anonymity suppressed if rawCount < 3
  dominantCategory: string;
}

export interface PostIncidentMetrics {
  caseId?: string;
  incidentId?: string;
  caseType?: string;
  incidentType?: string;
  mttaSeconds: number; // Mean Time to Acknowledge
  mttdSeconds: number; // Mean Time to Dispatch
  mttArrivalSeconds: number; // Mean Time to Arrival
  mttrSeconds: number; // Mean Time to Resolution
  targetMttArrivalSeconds?: number;
  targetMttrSeconds?: number;
  metArrivalSla?: boolean;
  metResolutionSla?: boolean;
  dataQualityIndex?: number;
  participatingVolunteersCount?: number;
  totalVolunteersEngaged?: number;
  responderTravelDistanceMeters?: number;
  externalDependencyLatencyMs?: number;
  policyTriggered?: string;
  identifiedBottlenecks?: string[];
  fieldFeedbackScore?: number;
  lessonsLearned?: string[];
  resolutionStatus?: 'REUNITED' | 'RESOLVED' | 'CLOSED' | string;
  completedAt?: string;
  closedAt?: string;
}

export interface ModelGovernanceRecord {
  modelId: string;
  name?: string;
  modelName?: string;
  version: string;
  purpose?: string;
  description?: string;
  modelType?: string;
  algorithmType?: 'MULTIVARIATE_LOGISTIC' | 'SPATIO_TEMPORAL_CLUSTERING' | 'DETERMINISTIC_RULES' | 'GEMINI_ASSISTIVE_NLP' | string;
  baselineAccuracy?: number;
  accuracyScore?: number;
  isDriftDetected?: boolean;
  driftStatus?: 'STABLE' | 'WARNING' | 'CRITICAL' | string;
  driftMetricValue?: number;
  driftThreshold?: number;
  lastAuditedAt?: string;
  lastTrainedAt?: string;
  lastEvaluatedAt?: string;
  operatorAcceptanceRate?: number;
  status: 'ACTIVE' | 'DEGRADED_MANUAL_REVIEW' | 'ROLLED_BACK' | 'ACTIVE_PRODUCTION' | string;
  enforcesDeterministicSafetyFloor?: boolean;
  safetyFloorRule?: string;
  auditCompliance?: string;
}



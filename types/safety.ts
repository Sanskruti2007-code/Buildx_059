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
  targetType: 'CASE' | 'FOUND_REPORT' | 'MATCH' | 'VOLUNTEER' | 'ALERT' | 'CROWD';
  targetId: string;
  ipAddress: string;
  details: Record<string, any>;
}

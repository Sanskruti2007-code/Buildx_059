'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  MissingChildCase, 
  FoundChildReport, 
  MatchCandidate, 
  VolunteerTask, 
  CrowdZone, 
  AuditLog, 
  Role, 
  Coordinates, 
  AlertSeverity,
  SafeRideSession,
  TrustedContact,
  ElderProfile,
  WanderAlert,
  WitnessReport,
  TransportHub,
  VehicleDetails,
  CityConfig,
  PredictiveCrowdMetrics,
  CrossCityEscalation,
  EscalationScope,
  DroneTelemetry,
  AdapterHealth,
  PriorityRecommendation,
  SafetyPattern,
  ProactiveRiskSignal,
  CaseIntelligenceSummary,
  OperatorRecommendation,
  PrivacyHeatmapCell,
  PostIncidentMetrics,
  ModelGovernanceRecord
} from '@/types/safety';
import { 
  MOCK_MISSING_CASES, 
  MOCK_FOUND_REPORTS, 
  MOCK_VOLUNTEER_TASKS, 
  MOCK_CROWD_ZONES, 
  MOCK_AUDIT_LOGS,
  MOCK_ACTIVE_SAFERIDE,
  MOCK_TRUSTED_CONTACTS,
  MOCK_ELDER_PROFILES,
  MOCK_WANDER_ALERTS,
  MOCK_WITNESS_REPORTS,
  MOCK_TRANSPORT_HUBS
} from '@/lib/mock/seed-data';
import {
  MOCK_MODEL_REGISTRY,
  MOCK_RISK_SIGNALS,
  MOCK_OPERATOR_RECOMMENDATIONS,
  MOCK_POST_INCIDENT_METRICS
} from '@/lib/mock/seed-data-phase4';
import { evaluateCandidateMatch, HIGH_PRIORITY_CANDIDATE_THRESHOLD } from '@/lib/matching/engine';
import { evaluatePinDisarm } from '@/lib/geo/saferide-math';
import { Locale } from '@/lib/i18n/dictionaries';
import { CITIES_REGISTRY, DEFAULT_CITY_ID, getCityConfig } from '@/lib/config/cities';
import { processPredictiveCrowdAnalytics } from '@/lib/math/predictive-crowd';
import { calculateIncidentPriority } from '@/lib/math/incident-priority';
import { detectSafetyPatterns, evaluateDuplicateProbability } from '@/lib/math/pattern-detection';
import { analyzeResourceGaps, generateResourceRecommendations } from '@/lib/math/resource-optimizer';
import { generatePrivacyPreservingHeatmap } from '@/lib/math/privacy-heatmap';
import { computeIncidentMetrics, calculateDataQualityIndex } from '@/lib/math/response-metrics';
import { erss112Adapter } from '@/lib/integrations/erss-adapter';
import { cctnsAdapter, CCTNSSyncResult } from '@/lib/integrations/cctns-adapter';
import { droneGatewayAdapter, INITIAL_DRONE_FLEET, DroneSessionGrant } from '@/lib/integrations/drone-adapter';
import { generateIdempotencyKey, IntegrationResult } from '@/lib/integrations/gateway-contract';
import { enqueueOfflineSync } from '@/lib/supabase/client';

interface SafetyStoreContextType {
  role: Role;
  setRole: (role: Role) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  
  // Phase 1 State
  missingCases: MissingChildCase[];
  foundReports: FoundChildReport[];
  matchCandidates: MatchCandidate[];
  volunteerTasks: VolunteerTask[];
  crowdZones: CrowdZone[];
  auditLogs: AuditLog[];
  activeNotification: { title: string; message: string; severity: AlertSeverity } | null;
  clearNotification: () => void;

  // Phase 2 State: City-Wide Daily Safety
  activeSafeRide: SafeRideSession | null;
  trustedContacts: TrustedContact[];
  elderProfiles: ElderProfile[];
  wanderAlerts: WanderAlert[];
  witnessReports: WitnessReport[];
  transportHubs: TransportHub[];

  // Phase 3 State: Multi-City, Interoperability, Predictive Safety
  currentCityId: string;
  currentCityConfig: CityConfig;
  setCurrentCityId: (cityId: string) => void;
  crossCityEscalations: CrossCityEscalation[];
  droneFeeds: DroneTelemetry[];
  integrationHealth: Record<string, AdapterHealth>;
  predictiveCrowdMetrics: Record<string, PredictiveCrowdMetrics>;

  // Phase 4 State: Proactive Intelligence & Resource Optimization
  incidentPriorities: Record<string, PriorityRecommendation>;
  riskSignals: ProactiveRiskSignal[];
  safetyPatterns: SafetyPattern[];
  operatorRecommendations: OperatorRecommendation[];
  caseIntelligenceSummaries: Record<string, CaseIntelligenceSummary>;
  privacyHeatmapCells: PrivacyHeatmapCell[];
  postIncidentMetrics: PostIncidentMetrics[];
  modelRegistry: ModelGovernanceRecord[];

  // Phase 1 Actions
  reportMissingChild: (data: Omit<MissingChildCase, 'id' | 'status' | 'severity' | 'otpVerified' | 'assignedVolunteersCount' | 'createdAt' | 'updatedAt'>) => { caseId: string; otp: string };
  verifyCaseOtp: (caseId: string, otp: string) => boolean;
  reportFoundChild: (data: Omit<FoundChildReport, 'id' | 'status' | 'createdAt'>) => { reportId: string; topMatch?: MatchCandidate };
  verifyCandidateMatch: (candidateId: string, decision: 'CONFIRMED' | 'REJECTED', notes: string) => void;
  escalateCaseToRed: (caseId: string, reason: string) => void;
  resolveCaseReunited: (caseId: string) => void;
  acceptVolunteerTask: (taskId: string) => void;
  startVolunteerTask: (taskId: string) => void;
  volunteerCheckin: (taskId: string) => void;
  completeVolunteerTask: (taskId: string) => void;
  declineVolunteerTask: (taskId: string) => void;
  simulateCrowdSpike: (zoneId: string, newCount: number) => void;
  addAuditLog: (action: string, targetType: AuditLog['targetType'], targetId: string, details: Record<string, any>) => void;

  // Phase 2 Actions
  startSafeRide: (destination: Coordinates, vehicle?: VehicleDetails) => void;
  simulateRouteDeviation: () => void;
  simulateStationaryStop: () => void;
  disarmSafeRide: (pin: string) => { success: boolean; isDuress: boolean; message: string };
  triggerSilentSOS: () => void;
  addTrustedContact: (contact: Omit<TrustedContact, 'id' | 'userId' | 'isVerified'>) => void;
  removeTrustedContact: (contactId: string) => void;
  submitWitnessReport: (report: Omit<WitnessReport, 'id' | 'trackingCode' | 'status' | 'exifScrubbed' | 'createdAt'>) => { trackingCode: string };
  triggerElderWander: (elderId: string) => void;
  resolveWanderAlert: (alertId: string) => void;

  // Phase 3 Actions
  escalateCrossCity: (caseId: string, targetCityId: string, reason: string, scope?: EscalationScope) => CrossCityEscalation;
  requestDroneFeed: (droneId: string, incidentId: string, purpose: string) => DroneSessionGrant;
  updateDroneLocation: (droneId: string, coords: Coordinates, battery: number) => void;
  dispatch112Emergency: (incidentId: string, type: 'SILENT_SOS' | 'SAFERIDE_DURESS' | 'MISSING_PERSON' | 'CROWD_CRUSH_HAZARD', notes: string) => Promise<IntegrationResult>;
  syncCCTNSCase: (caseId: string) => Promise<CCTNSSyncResult>;

  // Phase 4 Actions
  acceptOperatorRecommendation: (recId: string) => void;
  rejectOperatorRecommendation: (recId: string, reason: string) => void;
  generateCaseIntelligenceSummary: (caseId: string) => CaseIntelligenceSummary;
}

const SafetyStoreContext = createContext<SafetyStoreContextType | undefined>(undefined);

export function SafetyStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('CONTROL_ROOM');
  const [locale, setLocale] = useState<Locale>('en');

  // Phase 1 State
  const [missingCases, setMissingCases] = useState<MissingChildCase[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_cases');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_MISSING_CASES;
  });

  const [foundReports, setFoundReports] = useState<FoundChildReport[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_found');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_FOUND_REPORTS;
  });

  const [volunteerTasks, setVolunteerTasks] = useState<VolunteerTask[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_tasks');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_VOLUNTEER_TASKS;
  });

  const [crowdZones, setCrowdZones] = useState<CrowdZone[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_crowd');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_CROWD_ZONES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_audit');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_AUDIT_LOGS;
  });

  const [matchCandidates, setMatchCandidates] = useState<MatchCandidate[]>([]);
  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string; severity: AlertSeverity } | null>(null);

  // Phase 2 State
  const [activeSafeRide, setActiveSafeRide] = useState<SafeRideSession | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_saferide');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_ACTIVE_SAFERIDE;
  });

  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_contacts');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_TRUSTED_CONTACTS;
  });

  const [elderProfiles, setElderProfiles] = useState<ElderProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_elders');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_ELDER_PROFILES;
  });

  const [wanderAlerts, setWanderAlerts] = useState<WanderAlert[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_wander');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_WANDER_ALERTS;
  });

  const [witnessReports, setWitnessReports] = useState<WitnessReport[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_witness');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_WITNESS_REPORTS;
  });

  const [transportHubs, setTransportHubs] = useState<TransportHub[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_hubs');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_TRANSPORT_HUBS;
  });

  // Phase 3 State: Multi-City, Interoperability, Predictive Safety
  const [currentCityId, setCurrentCityId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_city_id');
      if (saved) return saved;
    }
    return DEFAULT_CITY_ID;
  });

  const [crossCityEscalations, setCrossCityEscalations] = useState<CrossCityEscalation[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_escalations');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 'ESC-2026-089',
        incidentId: 'DB-2026-CASE-01',
        incidentType: 'MISSING_PERSON',
        originCityId: 'nagpur',
        targetCityId: 'mumbai',
        authorizedBy: 'ACP-GUPTA-CRIMEBRA-MH',
        authorizationToken: 'AUTH-MH-ESC-X992',
        reason: 'Sighting reported at Nagpur Central Railway Station boarding Vidarbha Superfast Express towards Mumbai CSMT.',
        escalatedAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'AUTHORIZED',
        sharedScope: 'FULL_CASE_DOSSIER',
        auditTrailId: 'AUDIT-CROSS-01',
        targetCityAcknowledged: true,
        transitHubRef: 'MUM-CSMT-RAILWAY'
      }
    ];
  });

  const [droneFeeds, setDroneFeeds] = useState<DroneTelemetry[]>(INITIAL_DRONE_FLEET);

  const [integrationHealth, setIntegrationHealth] = useState<Record<string, AdapterHealth>>({
    erss: {
      id: 'int-112',
      name: 'Emergency Response Support (112 ERSS)',
      serviceType: 'ERSS_112',
      status: 'CONNECTED',
      latencyMs: 92,
      successRatePercent: 99.4,
      circuitBreakerOpen: false,
      lastCheckedAt: new Date().toISOString(),
      endpointUrl: 'https://erss.gov.in/cad/api/v1 (Simulation)',
      isSimulation: true
    },
    cctns: {
      id: 'int-cctns',
      name: 'CCTNS National Police Case Sync',
      serviceType: 'CCTNS',
      status: 'CONNECTED',
      latencyMs: 148,
      successRatePercent: 98.6,
      circuitBreakerOpen: false,
      lastCheckedAt: new Date().toISOString(),
      endpointUrl: 'https://cctns.gov.in/api/v2 (Simulation)',
      isSimulation: true
    },
    drone: {
      id: 'int-drone',
      name: 'Garuda Drone Network Telemetry',
      serviceType: 'DRONE_FEED',
      status: 'CONNECTED',
      latencyMs: 28,
      successRatePercent: 99.9,
      circuitBreakerOpen: false,
      lastCheckedAt: new Date().toISOString(),
      endpointUrl: 'rtsp://drone-mesh.mehfus.gov.in (Simulation)',
      isSimulation: true
    },
    transit: {
      id: 'int-transit',
      name: 'MahaMetro & Central Railway Transit API',
      serviceType: 'TRANSIT_HUBS',
      status: 'CONNECTED',
      latencyMs: 56,
      successRatePercent: 99.2,
      circuitBreakerOpen: false,
      lastCheckedAt: new Date().toISOString(),
      endpointUrl: 'https://transit.internal.gov.in/telemetry (Simulation)',
      isSimulation: true
    },
    maps: {
      id: 'int-maps',
      name: 'OpenStreetMap CartoDB Tiles',
      serviceType: 'CARTO_MAPS',
      status: 'CONNECTED',
      latencyMs: 44,
      successRatePercent: 100.0,
      circuitBreakerOpen: false,
      lastCheckedAt: new Date().toISOString(),
      endpointUrl: 'https://cartodb-basemaps.global.ssl.fastly.net',
      isSimulation: false
    }
  });

  const [predictiveCrowdMetrics, setPredictiveCrowdMetrics] = useState<Record<string, PredictiveCrowdMetrics>>(() => {
    const initMetrics: Record<string, PredictiveCrowdMetrics> = {};
    MOCK_CROWD_ZONES.forEach(zone => {
      const area = zone.capacity * 0.75;
      initMetrics[zone.id] = processPredictiveCrowdAnalytics({
        zoneId: zone.id,
        zoneName: zone.name,
        areaSqMeters: area,
        currentCount: zone.currentCount,
        previousCount: Math.round(zone.currentCount * 0.92),
        deltaSeconds: 60,
        inflowCount: Math.round(zone.currentCount * 0.08),
        outflowCount: Math.round(zone.currentCount * 0.05),
        exitCapacityPerSec: Math.max(10, Math.round(zone.capacity * 0.01)),
        eventScheduleFactor: 0.35,
        activeSensors: 8,
        totalSensors: 8,
        lastUpdatedSecondsAgo: 12
      });
    });
    return initMetrics;
  });

  const currentCityConfig = getCityConfig(currentCityId);

  // Phase 4 State: Proactive Intelligence & Resource Optimization
  const [incidentPriorities, setIncidentPriorities] = useState<Record<string, PriorityRecommendation>>({});
  const [riskSignals, setRiskSignals] = useState<ProactiveRiskSignal[]>(MOCK_RISK_SIGNALS);
  const [safetyPatterns, setSafetyPatterns] = useState<SafetyPattern[]>([]);
  const [operatorRecommendations, setOperatorRecommendations] = useState<OperatorRecommendation[]>(MOCK_OPERATOR_RECOMMENDATIONS);
  const [caseIntelligenceSummaries, setCaseIntelligenceSummaries] = useState<Record<string, CaseIntelligenceSummary>>({});
  const [privacyHeatmapCells, setPrivacyHeatmapCells] = useState<PrivacyHeatmapCell[]>([]);
  const [postIncidentMetrics, setPostIncidentMetrics] = useState<PostIncidentMetrics[]>(MOCK_POST_INCIDENT_METRICS);
  const [modelRegistry, setModelRegistry] = useState<ModelGovernanceRecord[]>(MOCK_MODEL_REGISTRY);

  // Phase 4: Dynamic Incident Priority Calculation (with Deterministic Safety Floors)
  useEffect(() => {
    const newPriorities: Record<string, PriorityRecommendation> = {};

    // 1. Missing Child Cases (Life Safety Floor >= 85)
    missingCases.forEach((mCase) => {
      if (mCase.status !== 'REUNITED') {
        const timeElapsedMinutes = Math.max(1, Math.round((Date.now() - new Date(mCase.createdAt).getTime()) / 60000));
        newPriorities[mCase.id] = calculateIncidentPriority({
          incidentId: mCase.id,
          incidentType: 'MISSING_CHILD',
          severity: mCase.severity,
          timeElapsedMinutes,
          subjectAge: mCase.age,
          isSpecialVulnerability: mCase.age <= 8,
          activeLocalRespondersCount: mCase.assignedVolunteersCount || 2,
          requiredRespondersCount: 4
        });
      }
    });

    // 2. Elderly Wander Alerts (Safety Floor >= 75)
    wanderAlerts.forEach((alert) => {
      if (alert.status !== 'RESOLVED') {
        const timeElapsedMinutes = Math.max(1, Math.round((Date.now() - new Date(alert.triggeredAt).getTime()) / 60000));
        newPriorities[alert.id] = calculateIncidentPriority({
          incidentId: alert.id,
          incidentType: 'ELDER_WANDER',
          severity: alert.severity,
          timeElapsedMinutes,
          isSpecialVulnerability: true,
          activeLocalRespondersCount: alert.assignedRespondersCount || 1,
          requiredRespondersCount: 3
        });
      }
    });

    // 3. Active SafeRide Duress/Alert (Life Safety Floor >= 95)
    if (activeSafeRide && (activeSafeRide.status === 'ESCALATED' || activeSafeRide.status === 'ANOMALY_DETECTED' || activeSafeRide.duressTriggered)) {
      newPriorities[activeSafeRide.id] = calculateIncidentPriority({
        incidentId: activeSafeRide.id,
        incidentType: activeSafeRide.duressTriggered ? 'SAFERIDE_DURESS' : 'SILENT_SOS',
        severity: 'RED',
        timeElapsedMinutes: 5,
        isSpecialVulnerability: true,
        activeLocalRespondersCount: 1,
        requiredRespondersCount: 2
      });
    }

    setIncidentPriorities(newPriorities);
  }, [missingCases, wanderAlerts, activeSafeRide]);

  // Phase 4: Privacy-Preserving Heatmap Sync (k >= 3 suppression)
  useEffect(() => {
    const rawIncidents = [
      ...witnessReports.map(w => ({
        id: w.id,
        coordinates: w.location,
        timestamp: w.createdAt,
        type: w.category,
        weight: w.category === 'HARASSMENT' ? 2.0 : 1.0
      })),
      ...missingCases.map(c => ({
        id: c.id,
        coordinates: c.lastSeenLocation,
        timestamp: c.createdAt,
        type: 'MISSING_PERSON',
        weight: 3.0
      })),
      ...wanderAlerts.map(w => ({
        id: w.id,
        coordinates: w.currentLocation,
        timestamp: w.triggeredAt,
        type: 'ELDER_WANDER',
        weight: 2.5
      }))
    ];

    const cells = generatePrivacyPreservingHeatmap(rawIncidents, 3, 250);
    setPrivacyHeatmapCells(cells);

    // Run pattern detection on witness reports
    const patterns = detectSafetyPatterns('nagpur', missingCases.map(c => ({
      id: c.id,
      coordinates: c.lastSeenLocation,
      timestamp: c.createdAt,
      type: 'MISSING_PERSON',
      category: 'MISSING_PERSON',
      description: `${c.childName} last seen near ${c.lastSeenLocation.landmark || 'sector'}`
    })));
    setSafetyPatterns(patterns);
  }, [witnessReports, missingCases, wanderAlerts]);

  // LocalStorage sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mehfus_cases', JSON.stringify(missingCases));
      localStorage.setItem('mehfus_found', JSON.stringify(foundReports));
      localStorage.setItem('mehfus_tasks', JSON.stringify(volunteerTasks));
      localStorage.setItem('mehfus_crowd', JSON.stringify(crowdZones));
      localStorage.setItem('mehfus_audit', JSON.stringify(auditLogs));
      localStorage.setItem('mehfus_saferide', JSON.stringify(activeSafeRide));
      localStorage.setItem('mehfus_contacts', JSON.stringify(trustedContacts));
      localStorage.setItem('mehfus_elders', JSON.stringify(elderProfiles));
      localStorage.setItem('mehfus_wander', JSON.stringify(wanderAlerts));
      localStorage.setItem('mehfus_witness', JSON.stringify(witnessReports));
      localStorage.setItem('mehfus_hubs', JSON.stringify(transportHubs));
      localStorage.setItem('mehfus_city_id', currentCityId);
      localStorage.setItem('mehfus_escalations', JSON.stringify(crossCityEscalations));
    }
  }, [missingCases, foundReports, volunteerTasks, crowdZones, auditLogs, activeSafeRide, trustedContacts, elderProfiles, wanderAlerts, witnessReports, transportHubs, currentCityId, crossCityEscalations]);

  // Phase 1 Candidate matching sync
  useEffect(() => {
    const candidates: MatchCandidate[] = [];
    missingCases.forEach((mCase) => {
      if (mCase.status === 'SEARCHING' || mCase.status === 'MATCH_CANDIDATE_FOUND') {
        foundReports.forEach((fReport) => {
          if (fReport.status !== 'RESOLVED' && fReport.status !== 'DISMISSED') {
            const candidate = evaluateCandidateMatch(mCase, fReport);
            candidates.push(candidate);
          }
        });
      }
    });
    candidates.sort((a, b) => b.compositeScore - a.compositeScore);
    setMatchCandidates(candidates);
  }, [missingCases, foundReports]);

  const addAuditLog = (action: string, targetType: AuditLog['targetType'], targetId: string, details: Record<string, any>) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId: role === 'CONTROL_ROOM' ? 'USR-02 (Meera Joshi)' : 'CITIZEN_APP_CLIENT',
      actorRole: role,
      action,
      targetType,
      targetId,
      ipAddress: '103.21.125.88 (TLS Client)',
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const clearNotification = () => setActiveNotification(null);

  // Phase 1 Actions
  const reportMissingChild = (data: Omit<MissingChildCase, 'id' | 'status' | 'severity' | 'otpVerified' | 'assignedVolunteersCount' | 'createdAt' | 'updatedAt'>) => {
    const caseId = `DB-2026-0${missingCases.length + 1}`;
    const otp = "492015";
    const newCase: MissingChildCase = {
      ...data,
      id: caseId,
      status: 'SEARCHING',
      severity: 'ORANGE',
      otpVerified: true,
      assignedVolunteersCount: 4,
      searchRadiusMeters: data.searchRadiusMeters || 2000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMissingCases((prev) => [newCase, ...prev]);

    // Cross-Role Cascade: Automatically dispatch a high-priority VolunteerTask to the Guardian Mesh
    const newVolunteerTask: VolunteerTask = {
      id: `TSK-${Date.now().toString(36).toUpperCase()}`,
      volunteerId: 'VOL-01',
      volunteerName: 'Rajesh Deshmukh',
      caseId: caseId,
      childSummary: {
        name: newCase.childName,
        age: newCase.age,
        gender: newCase.gender,
        clothing: `${newCase.clothing?.top || 'Shirt'}, ${newCase.clothing?.bottom || 'Pants'}`,
        photoUrl: newCase.photoUrl,
      },
      searchZoneName: newCase.lastSeenLocation.landmark || 'Search Sector 1',
      searchCoordinates: newCase.lastSeenLocation,
      status: 'ASSIGNED',
      safetyCheckinCount: 0,
      assignedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };
    setVolunteerTasks((prev) => [newVolunteerTask, ...prev]);

    // Supabase resilient offline enqueue
    enqueueOfflineSync('missing_child_cases', 'INSERT', newCase);
    enqueueOfflineSync('volunteer_tasks', 'INSERT', newVolunteerTask);

    addAuditLog('MISSING_CASE_CREATED_ORANGE', 'CASE', caseId, { childName: newCase.childName });
    setActiveNotification({
      title: 'ORANGE ALERT: Missing Child Case Registered',
      message: `Guardian Mesh activated for ${newCase.childName}. 4 volunteers notified in 2.0 km zone.`,
      severity: 'ORANGE',
    });
    return { caseId, otp };
  };

  const verifyCaseOtp = (caseId: string, otp: string) => {
    if (otp === '492015' || otp.length === 6) {
      setMissingCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, otpVerified: true } : c))
      );
      addAuditLog('OTP_VERIFIED_ALERT_ACTIVATED', 'CASE', caseId, { otpEntered: otp });
      return true;
    }
    return false;
  };

  const reportFoundChild = (data: Omit<FoundChildReport, 'id' | 'status' | 'createdAt'>) => {
    const reportId = `FND-2026-0${foundReports.length + 1}`;
    const newReport: FoundChildReport = {
      ...data,
      id: reportId,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
    };
    setFoundReports((prev) => [newReport, ...prev]);
    enqueueOfflineSync('found_child_reports', 'INSERT', newReport);
    addAuditLog('FOUND_CHILD_REPORTED', 'FOUND_REPORT', reportId, { reportType: newReport.reportType });

    let topMatchCandidate: MatchCandidate | undefined;
    let highestScore = 0;
    missingCases.forEach((mCase) => {
      if (mCase.status === 'SEARCHING') {
        const candidate = evaluateCandidateMatch(mCase, newReport);
        if (candidate.compositeScore > highestScore) {
          highestScore = candidate.compositeScore;
          topMatchCandidate = candidate;
        }
      }
    });

    if (topMatchCandidate && topMatchCandidate.compositeScore >= HIGH_PRIORITY_CANDIDATE_THRESHOLD) {
      setActiveNotification({
        title: 'HIGH CONFIDENCE MATCH CANDIDATE!',
        message: `Found report ${reportId} matches ${topMatchCandidate.missingCaseId} with ${(topMatchCandidate.compositeScore * 100).toFixed(1)}% confidence.`,
        severity: 'RED',
      });
    }
    return { reportId, topMatch: topMatchCandidate };
  };

  const verifyCandidateMatch = (candidateId: string, decision: 'CONFIRMED' | 'REJECTED', notes: string) => {
    setMatchCandidates((prev) =>
      prev.map((cand) =>
        cand.id === candidateId
          ? { ...cand, humanVerified: true, decision, decisionNotes: notes }
          : cand
      )
    );
    const targetCand = matchCandidates.find((c) => c.id === candidateId);
    if (targetCand && decision === 'CONFIRMED') {
      resolveCaseReunited(targetCand.missingCaseId);
    }
  };

  const escalateCaseToRed = (caseId: string, reason: string) => {
    setMissingCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, severity: 'RED', searchRadiusMeters: 3500 } : c))
    );
    addAuditLog('CASE_ESCALATED_TO_RED', 'CASE', caseId, { reason });
    setActiveNotification({
      title: 'RED ALERT ESCALATION',
      message: `Case ${caseId} escalated to RED ALERT. Search perimeter expanded to 3.5 km.`,
      severity: 'RED',
    });
  };

  const resolveCaseReunited = (caseId: string) => {
    const targetCase = missingCases.find(c => c.id === caseId);
    const reunitedAt = new Date().toISOString();
    setMissingCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: 'REUNITED', reunitedAt } : c))
    );

    // Auto-complete any active volunteer tasks for this case
    setVolunteerTasks(prev => prev.map(t => t.caseId === caseId ? { ...t, status: 'COMPLETED' } : t));

    // Dynamic Post-Incident Metrics computation & telemetry persistence
    if (targetCase) {
      const createdTime = new Date(targetCase.createdAt).getTime();
      const resolvedTime = new Date(reunitedAt).getTime();
      
      const newMetric = computeIncidentMetrics({
        caseId: caseId,
        caseType: 'MISSING_PERSON',
        reportedAt: targetCase.createdAt,
        acknowledgedAt: new Date(createdTime + 45000).toISOString(),
        dispatchedAt: new Date(createdTime + 120000).toISOString(),
        arrivedAt: new Date(createdTime + 360000).toISOString(),
        resolvedAt: reunitedAt,
        volunteersEngaged: 4,
        externalLatencyMs: 142,
        policyTriggered: 'RAPID_REUNION_GUARDIAN_MESH'
      });
      setPostIncidentMetrics(prev => [newMetric, ...prev]);
    }

    enqueueOfflineSync('missing_child_cases', 'UPDATE', { id: caseId, status: 'REUNITED', reunitedAt });

    addAuditLog('CHILD_REUNITED_SUCCESS', 'CASE', caseId, {});
    setActiveNotification({
      title: 'REUNITED: Child Safely Recovered!',
      message: `Case ${caseId} marked as successfully reunited. Post-incident telemetry recorded.`,
      severity: 'YELLOW'
    });
  };

  const acceptVolunteerTask = (taskId: string) => {
    setVolunteerTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'ACCEPTED' } : t)));
    addAuditLog('VOLUNTEER_TASK_ACCEPTED', 'VOLUNTEER', taskId, {});
  };

  const startVolunteerTask = (taskId: string) => {
    setVolunteerTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'IN_PROGRESS' } : t)));
    addAuditLog('VOLUNTEER_TASK_STARTED', 'VOLUNTEER', taskId, {});
  };

  const volunteerCheckin = (taskId: string) => {
    setVolunteerTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, safetyCheckinCount: t.safetyCheckinCount + 1, lastCheckinTime: new Date().toISOString() }
          : t
      )
    );
    addAuditLog('VOLUNTEER_SAFETY_CHECKIN', 'VOLUNTEER', taskId, {});
  };

  const completeVolunteerTask = (taskId: string) => {
    const targetTask = volunteerTasks.find(t => t.id === taskId);
    setVolunteerTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'COMPLETED' } : t)));
    addAuditLog('VOLUNTEER_TASK_COMPLETED', 'VOLUNTEER', taskId, {});
    enqueueOfflineSync('volunteer_tasks', 'UPDATE', { id: taskId, status: 'COMPLETED' });

    // Cross-Role Cascade: If volunteer successfully finishes a missing child task, reunite the linked case
    if (targetTask && targetTask.caseId) {
      resolveCaseReunited(targetTask.caseId);
    }
  };

  const declineVolunteerTask = (taskId: string) => {
    setVolunteerTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'DECLINED' } : t)));
    addAuditLog('VOLUNTEER_TASK_DECLINED_CASCADING', 'VOLUNTEER', taskId, {});
  };

  const simulateCrowdSpike = (zoneId: string, newCount: number) => {
    let updatedZone: CrowdZone | undefined;
    setCrowdZones((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          const density = parseFloat(((newCount / zone.capacity) * 100).toFixed(1));
          const modified = {
            ...zone,
            currentCount: newCount,
            densityPercentage: density,
            thresholdLevel: density >= 95 ? ('EMERGENCY' as const) : density >= 85 ? ('CRITICAL' as const) : density >= 70 ? ('ELEVATED' as const) : ('NORMAL' as const),
            lastUpdated: new Date().toISOString(),
          };
          updatedZone = modified;
          return modified;
        }
        return zone;
      })
    );

    // Recompute predictive physics metrics for this zone with high velocity
    const targetZone = crowdZones.find(z => z.id === zoneId);
    if (targetZone) {
      const area = targetZone.capacity * 0.75;
      const metrics = processPredictiveCrowdAnalytics({
        zoneId: targetZone.id,
        zoneName: targetZone.name,
        areaSqMeters: area,
        currentCount: newCount,
        previousCount: targetZone.currentCount,
        deltaSeconds: 30, // 30s surge window
        inflowCount: Math.max(25, newCount - targetZone.currentCount),
        outflowCount: 6,
        exitCapacityPerSec: Math.max(8, Math.round(targetZone.capacity * 0.01)),
        eventScheduleFactor: 0.85, // Active religious/assembly event peak
        activeSensors: 8,
        totalSensors: 8,
        lastUpdatedSecondsAgo: 0
      });

      setPredictiveCrowdMetrics(prev => ({
        ...prev,
        [zoneId]: metrics
      }));
    }
  };

  // ====================================================================
  // Phase 2 Actions: SafeRide, Silent SOS, Duress PIN, Witness, Elders
  // ====================================================================

  const startSafeRide = (destination: Coordinates, vehicle?: VehicleDetails) => {
    const newRide: SafeRideSession = {
      id: `SR-2026-0${Math.floor(100 + Math.random() * 900)}`,
      userId: 'USR-CITIZEN-01',
      userName: 'Snehal Deshpande',
      userPhone: '+91 98220 54321',
      startLocation: { lat: 21.1458, lng: 79.0882, landmark: 'Sitabuldi Metro Station' },
      destination,
      currentLocation: { lat: 21.1458, lng: 79.0882, landmark: 'Sitabuldi Metro Station' },
      expectedRoute: MOCK_ACTIVE_SAFERIDE.expectedRoute,
      vehicleDetails: vehicle || {
        vehicleNumber: 'MH-31-FA-4290',
        vehicleType: 'AUTO_RICKSHAW',
        driverName: 'Santosh Mankar',
        rideServiceProvider: 'Nagpur Prepaid Auto',
      },
      status: 'ACTIVE',
      safetyState: 'GREEN',
      deviationMeters: 0,
      stationarySeconds: 0,
      duressTriggered: false,
      startedAt: new Date().toISOString(),
      lastPingAt: new Date().toISOString(),
    };

    setActiveSafeRide(newRide);
    addAuditLog('SAFERIDE_SESSION_STARTED', 'SAFERIDE', newRide.id, { destination: destination.landmark });
  };

  const simulateRouteDeviation = () => {
    if (!activeSafeRide) return;

    setActiveSafeRide((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'ANOMALY_DETECTED',
        safetyState: 'YELLOW',
        deviationMeters: 680, // > 500m threshold
        anomalyReason: 'Route Deviation Detected (680m off expected corridor towards Seminary Hills)',
        countdownSecondsRemaining: 60, // 60s to Orange escalation
        currentLocation: { lat: 21.1550, lng: 79.0620, landmark: 'Seminary Hills Bypass (Off Route)' },
        lastPingAt: new Date().toISOString(),
      };
    });

    addAuditLog('SAFERIDE_ANOMALY_DEVIATION', 'SAFERIDE', activeSafeRide.id, { deviationMeters: 680 });

    setActiveNotification({
      title: 'SAFERIDE YELLOW ALERT: Route Deviation (680m)',
      message: 'Vehicle deviated from expected corridor. Soft check-in countdown active (60s).',
      severity: 'YELLOW',
    });
  };

  const simulateStationaryStop = () => {
    if (!activeSafeRide) return;

    setActiveSafeRide((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'ANOMALY_DETECTED',
        safetyState: 'YELLOW',
        stationarySeconds: 210, // > 180s (3 minutes)
        anomalyReason: 'Unscheduled Stationary Stop (3m 30s) in low-density sector',
        countdownSecondsRemaining: 60,
        lastPingAt: new Date().toISOString(),
      };
    });

    addAuditLog('SAFERIDE_ANOMALY_STOP', 'SAFERIDE', activeSafeRide.id, { stationarySeconds: 210 });

    setActiveNotification({
      title: 'SAFERIDE YELLOW ALERT: Stationary Stop (3m 30s)',
      message: 'Unscheduled stop detected. User check-in countdown initiated.',
      severity: 'YELLOW',
    });
  };

  const disarmSafeRide = (pin: string) => {
    const result = evaluatePinDisarm(pin);

    if (!result.valid) {
      return { success: false, isDuress: false, message: 'Invalid PIN. Please enter your 4-digit code.' };
    }

    if (result.isDuress) {
      // DURESS TRIGGERED: Deceptively set ride status to COMPLETED on user screen,
      // but generate an immediate Level 3 RED ALERT in the Control Room and notify police!
      setActiveSafeRide((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'ESCALATED',
          safetyState: 'RED',
          duressTriggered: true,
          anomalyReason: 'CRITICAL: User entered DURESS PIN (9876) under coercion',
        };
      });

      addAuditLog('DURESS_PIN_DISARM_SILENT_RED', 'SAFERIDE', activeSafeRide?.id || 'UNKNOWN', {
        coercionFlag: true,
        policeDispatched: true,
      });

      setActiveNotification({
        title: 'CRITICAL EMERGENCY: DURESS SIGNAL DETECTED',
        message: `User entered Duress PIN. Coercion suspected. Law Enforcement Patrol auto-dispatched to ${activeSafeRide?.currentLocation.landmark}.`,
        severity: 'RED',
      });

      return {
        success: true,
        isDuress: true,
        message: 'Session safely disarmed.', // Shows standard safe message to aggressor
      };
    }

    // Normal Safe PIN: Disarm safely
    setActiveSafeRide((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'COMPLETED',
        safetyState: 'RESOLVED',
        completedAt: new Date().toISOString(),
      };
    });

    addAuditLog('SAFERIDE_DISARMED_SAFE', 'SAFERIDE', activeSafeRide?.id || 'UNKNOWN', {});

    return {
      success: true,
      isDuress: false,
      message: 'SafeRide session completed safely. Trusted contacts notified.',
    };
  };

  const triggerSilentSOS = () => {
    const alertId = `SOS-${Date.now()}`;
    addAuditLog('SILENT_SOS_TRIGGERED', 'SAFERIDE', alertId, {
      silentMode: true,
      location: activeSafeRide?.currentLocation || { lat: 21.1415, lng: 79.0650, landmark: 'Jhansi Rani Square' },
    });

    setActiveNotification({
      title: 'SILENT SOS BROADCAST ACTIVE',
      message: 'Emergency responders and nearest police patrol routed to your live GPS coordinates.',
      severity: 'RED',
    });
  };

  const addTrustedContact = (contact: Omit<TrustedContact, 'id' | 'userId' | 'isVerified'>) => {
    if (trustedContacts.length >= 5) {
      alert('Maximum 5 trusted contacts allowed under safety policy.');
      return;
    }
    const newContact: TrustedContact = {
      ...contact,
      id: `TC-0${trustedContacts.length + 1}`,
      userId: 'USR-CITIZEN-01',
      isVerified: true,
    };
    setTrustedContacts((prev) => [...prev, newContact]);
    addAuditLog('TRUSTED_CONTACT_ADDED', 'SAFERIDE', newContact.id, { name: newContact.name, phone: newContact.phone });
  };

  const removeTrustedContact = (contactId: string) => {
    setTrustedContacts((prev) => prev.filter((c) => c.id !== contactId));
    addAuditLog('TRUSTED_CONTACT_REMOVED', 'SAFERIDE', contactId, {});
  };

  const submitWitnessReport = (report: Omit<WitnessReport, 'id' | 'trackingCode' | 'status' | 'exifScrubbed' | 'createdAt'>) => {
    const reportId = `WIT-2026-0${witnessReports.length + 1}`;
    const trackingCode = `WR-${Math.floor(1000 + Math.random() * 9000)}-${report.category.charAt(0)}`;

    const newReport: WitnessReport = {
      ...report,
      id: reportId,
      trackingCode,
      status: 'RECEIVED',
      exifScrubbed: true,
      reporterName: report.anonymityLevel === 'ANONYMOUS' ? undefined : report.reporterName,
      reporterPhone: report.anonymityLevel === 'ANONYMOUS' ? undefined : report.reporterPhone,
      createdAt: new Date().toISOString(),
    };

    setWitnessReports((prev) => [newReport, ...prev]);
    enqueueOfflineSync('witness_reports', 'INSERT', newReport);

    addAuditLog('WITNESS_REPORT_SUBMITTED', 'WITNESS', reportId, {
      anonymityLevel: newReport.anonymityLevel,
      category: newReport.category,
      landmark: newReport.location.landmark,
    });

    setActiveNotification({
      title: 'WITNESS REPORT RECEIVED',
      message: `Report ${trackingCode} (${newReport.category}) received. Anonymity preserved under DPDP rules.`,
      severity: 'YELLOW',
    });

    return { trackingCode };
  };

  const triggerElderWander = (elderId: string) => {
    const targetElder = elderProfiles.find((e) => e.id === elderId);
    if (!targetElder) return;

    const alertId = `WND-${Date.now()}`;
    const newAlert: WanderAlert = {
      id: alertId,
      elderId: targetElder.id,
      elderName: targetElder.name,
      guardianPhone: targetElder.guardianPhone,
      triggerZoneName: targetElder.safeZones[0]?.name || 'Home Zone',
      distanceOutsideMeters: 550,
      currentLocation: { lat: 21.1410, lng: 79.0710, landmark: 'Shankar Nagar Square (Outside Zone)' },
      severity: 'ORANGE',
      status: 'ACTIVE_SEARCH',
      assignedRespondersCount: 3,
      triggeredAt: new Date().toISOString(),
    };

    setWanderAlerts((prev) => [newAlert, ...prev]);
    setElderProfiles((prev) =>
      prev.map((e) => (e.id === elderId ? { ...e, currentStatus: 'WANDERING_DETECTED' } : e))
    );

    addAuditLog('ELDERLY_WANDER_ALERT_TRIGGERED', 'ELDERLY', alertId, {
      elderName: targetElder.name,
      distanceOutside: 550,
    });

    setActiveNotification({
      title: 'ORANGE ALERT: Elderly Wander Geofence Breach',
      message: `${targetElder.name} has moved 550m outside their Ramdaspeth Safe Zone. Guardian Mesh alerted.`,
      severity: 'ORANGE',
    });
  };

  const resolveWanderAlert = (alertId: string) => {
    setWanderAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : a))
    );
    addAuditLog('ELDERLY_WANDER_ALERT_RESOLVED', 'ELDERLY', alertId, {});
  };

  // ====================================================================
  // Phase 3 Actions: Cross-City Escalation, Drones, 112 & CCTNS Integrations
  // ====================================================================

  const escalateCrossCity = (
    caseId: string, 
    targetCityId: string, 
    reason: string, 
    scope: EscalationScope = 'FULL_CASE_DOSSIER'
  ): CrossCityEscalation => {
    const targetCase = missingCases.find(c => c.id === caseId);
    const newEscalation: CrossCityEscalation = {
      id: `ESC-2026-0${Math.floor(100 + Math.random() * 900)}`,
      incidentId: caseId,
      incidentType: 'MISSING_PERSON',
      originCityId: currentCityId,
      targetCityId,
      authorizedBy: 'CONTROL-ROOM-SUPV-01',
      authorizationToken: `TOKEN-${Date.now().toString(36).toUpperCase()}`,
      reason,
      escalatedAt: new Date().toISOString(),
      status: 'AUTHORIZED',
      sharedScope: scope,
      auditTrailId: `AUDIT-ESC-${Date.now()}`,
      targetCityAcknowledged: true,
      transitHubRef: targetCityId === 'mumbai' ? 'MUM-CSMT-RAILWAY' : 'PUN-SHIVAJI-METRO'
    };

    setCrossCityEscalations(prev => [newEscalation, ...prev]);
    addAuditLog('CROSS_CITY_ESCALATION_DISPATCHED', 'CASE', caseId, {
      originCity: currentCityId,
      targetCity: targetCityId,
      reason,
      authorizationToken: newEscalation.authorizationToken
    });

    setActiveNotification({
      title: `CROSS-CITY ESCALATION: Authorized for ${getCityConfig(targetCityId).name}`,
      message: `Case ${caseId} (${targetCase?.childName || 'Child'}) dispatched to ${getCityConfig(targetCityId).name} Police & Guardian Mesh.`,
      severity: 'ORANGE'
    });

    return newEscalation;
  };

  const requestDroneFeed = (droneId: string, incidentId: string, purpose: string): DroneSessionGrant => {
    const grant = droneGatewayAdapter.authorizeDroneSession({
      droneId,
      incidentId,
      operatorId: 'CTRL-ROOM-OFFICER-01',
      operatorRole: 'CONTROL_ROOM',
      purpose
    });

    setDroneFeeds(droneGatewayAdapter.getAllDrones());
    addAuditLog('DRONE_SURVEILLANCE_SESSION_GRANTED', 'ALERT', incidentId, {
      droneId,
      purpose,
      sessionId: grant.sessionId
    });

    return grant;
  };

  const updateDroneLocation = (droneId: string, coords: Coordinates, battery: number) => {
    droneGatewayAdapter.updateTelemetry(droneId, coords, battery);
    setDroneFeeds(droneGatewayAdapter.getAllDrones());
  };

  const dispatch112Emergency = async (
    incidentId: string, 
    type: 'SILENT_SOS' | 'SAFERIDE_DURESS' | 'MISSING_PERSON' | 'CROWD_CRUSH_HAZARD', 
    notes: string
  ): Promise<IntegrationResult> => {
    const idempotencyKey = generateIdempotencyKey(incidentId);
    const result = await erss112Adapter.dispatchEmergency({
      incidentId,
      incidentType: type,
      cityId: currentCityId,
      sourceJurisdiction: `${getCityConfig(currentCityId).name} Control Central`,
      severity: 'RED',
      coordinates: { lat: 21.1458, lng: 79.0882, landmark: 'City Sector 1' },
      notes,
      idempotencyKey
    });

    addAuditLog('ERSS_112_CAD_DISPATCH', 'ALERT', incidentId, {
      cadToken: result.externalReferenceId,
      watermark: result.watermark,
      latencyMs: result.latencyMs
    });

    return result;
  };

  const syncCCTNSCase = async (caseId: string): Promise<CCTNSSyncResult> => {
    const targetCase = missingCases.find(c => c.id === caseId);
    const result = await cctnsAdapter.syncMissingPersonCase({
      caseId,
      cityId: currentCityId,
      caseType: 'MISSING_PERSON',
      personName: targetCase?.childName || 'Unknown Child',
      age: targetCase?.age || 8,
      gender: targetCase?.gender || 'UNKNOWN',
      lastSeenLocation: targetCase?.lastSeenLocation || { lat: 21.1275, lng: 79.0669 },
      stationCode: getCityConfig(currentCityId).cctnsStationCode
    });

    addAuditLog('CCTNS_POLICE_RECORD_SYNCHRONIZED', 'CASE', caseId, {
      cctnsRecordId: result.cctnsRecordId,
      auditToken: result.auditToken
    });

    return result;
  };

  // Phase 4 Actions: Human-in-the-Loop Governance & Case Intelligence
  const acceptOperatorRecommendation = (recId: string) => {
    setOperatorRecommendations(prev => prev.map(rec => {
      if (rec.id === recId) {
        return {
          ...rec,
          status: 'ACCEPTED',
          reviewedBy: role === 'CONTROL_ROOM' ? 'USR-02 (Lead Meera Joshi)' : 'OPERATOR_DESK',
          reviewedAt: new Date().toISOString()
        };
      }
      return rec;
    }));

    addAuditLog('OPERATOR_RECOMMENDATION_ACCEPTED', 'ALERT', recId, {
      recId,
      acceptedAt: new Date().toISOString(),
      action: 'HUMAN_OPERATOR_AFFIRMED'
    });

    setActiveNotification({
      title: 'Recommendation Implemented',
      message: `Operational action approved and dispatched to sector field team.`,
      severity: 'YELLOW'
    });
  };

  const rejectOperatorRecommendation = (recId: string, reason: string) => {
    setOperatorRecommendations(prev => prev.map(rec => {
      if (rec.id === recId) {
        return {
          ...rec,
          status: 'REJECTED',
          rejectionReason: reason,
          reviewedBy: role === 'CONTROL_ROOM' ? 'USR-02 (Lead Meera Joshi)' : 'OPERATOR_DESK',
          reviewedAt: new Date().toISOString()
        };
      }
      return rec;
    }));

    addAuditLog('OPERATOR_RECOMMENDATION_REJECTED', 'ALERT', recId, {
      recId,
      reason,
      rejectedAt: new Date().toISOString(),
      action: 'HUMAN_OPERATOR_FEEDBACK_LOGGED'
    });

    setActiveNotification({
      title: 'Recommendation Dismissed',
      message: `Model feedback recorded: "${reason}". Continuous learning pipeline updated.`,
      severity: 'YELLOW'
    });
  };

  const generateCaseIntelligenceSummary = (caseId: string): CaseIntelligenceSummary => {
    const targetCase = missingCases.find(c => c.id === caseId);
    const relatedWitnesses = witnessReports.filter(w => {
      if (!targetCase) return false;
      const dLat = Math.abs(w.location.lat - targetCase.lastSeenLocation.lat);
      const dLng = Math.abs(w.location.lng - targetCase.lastSeenLocation.lng);
      return (dLat < 0.02 && dLng < 0.02);
    });

    const summary: CaseIntelligenceSummary = {
      caseId,
      incidentType: 'MISSING_PERSON',
      groundedTimeline: [
        {
          id: `TL-01`,
          timestamp: targetCase?.createdAt || new Date().toISOString(),
          source: 'FAMILY_REPORT',
          event: `Missing child report filed by guardian (${targetCase?.reporterPhone || 'Primary Contact'}). Photo and clothing description authenticated.`,
          reliability: 1.0,
          confidence: 1.0,
          coordinates: targetCase?.lastSeenLocation,
          corroboratingEvidenceIds: [caseId]
        },
        {
          id: `TL-02`,
          timestamp: new Date(new Date(targetCase?.createdAt || Date.now()).getTime() + 180000).toISOString(),
          source: 'MESH_BROADCAST',
          event: `Guardian Mesh peer-to-peer alert delivered to ${targetCase?.assignedVolunteersCount || 4} volunteers within 500m geofence.`,
          reliability: 0.98,
          confidence: 0.95
        },
        ...relatedWitnesses.map((w, idx) => ({
          id: `TL-WIT-${idx}`,
          timestamp: w.createdAt,
          source: 'WITNESS_REPORT' as const,
          event: `Correlated witness sighting (${w.category}): ${w.description.substring(0, 90)}...`,
          reliability: 0.85,
          confidence: 0.82,
          coordinates: w.location,
          corroboratingEvidenceIds: [w.id]
        }))
      ],
      corroboratedHypotheses: [
        {
          hypothesis: `Subject remained on foot within 600m perimeter around ${targetCase?.lastSeenLocation.landmark || 'initial point'}.`,
          confidence: 0.88,
          supportingEvidenceCount: 3,
          conflictingEvidenceCount: 0,
          rationale: 'No public transit egress logged with matching facial/clothing features; density cameras show localized foot traffic.'
        },
        {
          hypothesis: 'Subject may have sought shelter in adjacent food stall or commercial kiosk due to crowd surge.',
          confidence: 0.74,
          supportingEvidenceCount: 2,
          conflictingEvidenceCount: 1,
          rationale: 'Witness report WR-9482-D noted disoriented child in food stall corridor.'
        }
      ],
      associatedWitnessReportIds: relatedWitnesses.map(w => w.id),
      confidenceMetrics: {
        timelineCoverageScore: 0.91,
        sourceDiversityScore: 0.84,
        spatialConsistencyScore: 0.94,
        overallConfidence: 0.89
      },
      recommendedNextSteps: [
        'Dispatch volunteer pair to verify Food Pavilion Kiosk #3 with physical clothing swatch.',
        'Request Garuda Drone #GD-01 thermal scan over South Radial Avenue tree canopy.',
        'Authorize CCTNS Police Sync if unconfirmed after 45 minutes.'
      ],
      lastSynthesizedAt: new Date().toISOString()
    };

    setCaseIntelligenceSummaries(prev => ({ ...prev, [caseId]: summary }));
    return summary;
  };

  return (
    <SafetyStoreContext.Provider
      value={{
        role,
        setRole,
        locale,
        setLocale,
        missingCases,
        foundReports,
        matchCandidates,
        volunteerTasks,
        crowdZones,
        auditLogs,
        activeNotification,
        clearNotification,
        activeSafeRide,
        trustedContacts,
        elderProfiles,
        wanderAlerts,
        witnessReports,
        transportHubs,
        currentCityId,
        currentCityConfig,
        setCurrentCityId,
        crossCityEscalations,
        droneFeeds,
        integrationHealth,
        predictiveCrowdMetrics,
        incidentPriorities,
        riskSignals,
        safetyPatterns,
        operatorRecommendations,
        caseIntelligenceSummaries,
        privacyHeatmapCells,
        postIncidentMetrics,
        modelRegistry,
        reportMissingChild,
        verifyCaseOtp,
        reportFoundChild,
        verifyCandidateMatch,
        escalateCaseToRed,
        resolveCaseReunited,
        acceptVolunteerTask,
        startVolunteerTask,
        volunteerCheckin,
        completeVolunteerTask,
        declineVolunteerTask,
        simulateCrowdSpike,
        addAuditLog,
        startSafeRide,
        simulateRouteDeviation,
        simulateStationaryStop,
        disarmSafeRide,
        triggerSilentSOS,
        addTrustedContact,
        removeTrustedContact,
        submitWitnessReport,
        triggerElderWander,
        resolveWanderAlert,
        escalateCrossCity,
        requestDroneFeed,
        updateDroneLocation,
        dispatch112Emergency,
        syncCCTNSCase,
        acceptOperatorRecommendation,
        rejectOperatorRecommendation,
        generateCaseIntelligenceSummary,
      }}
    >
      {children}
    </SafetyStoreContext.Provider>
  );
}

export function useSafetyStore() {
  const context = useContext(SafetyStoreContext);
  if (!context) {
    throw new Error('useSafetyStore must be used within a SafetyStoreProvider');
  }
  return context;
}

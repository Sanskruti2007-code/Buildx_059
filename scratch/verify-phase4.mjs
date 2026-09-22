import { calculateIncidentPriority } from '../lib/math/incident-priority.js';
import { evaluateDuplicateProbability, detectSafetyPatterns } from '../lib/math/pattern-detection.js';
import { generateResourceRecommendations, analyzeResourceGaps } from '../lib/math/resource-optimizer.js';
import { generatePrivacyPreservingHeatmap } from '../lib/math/privacy-heatmap.js';
import { computeIncidentMetrics, calculateDataQualityIndex } from '../lib/math/response-metrics.js';

console.log('=====================================================');
console.log('🧪 MEHFUS PHASE 4 MATHEMATICAL ENGINES VERIFICATION');
console.log('=====================================================');

let passes = 0;
let failures = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passes++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failures++;
  }
}

// ----------------------------------------------------
// 1. FORMULA 1: INCIDENT PRIORITY & DETERMINISTIC SAFETY FLOOR OVERRIDE
// ----------------------------------------------------
console.log('\n--- 1. Testing Incident Multi-Factor Priority & Safety Floor ---');

// Test A: Normal missing child case
const childPriority = calculateIncidentPriority({
  incidentId: 'TEST-CHILD-01',
  incidentType: 'MISSING_CHILD',
  severity: 'ORANGE',
  timeElapsedMinutes: 30,
  subjectAge: 7,
  isSpecialVulnerability: true,
  activeLocalRespondersCount: 2,
  requiredRespondersCount: 4
});

assert(childPriority.effectiveScore >= 85, `Missing child score (${childPriority.effectiveScore}) must obey P_floor >= 85`);
assert(childPriority.isFloorEnforced === true || childPriority.rawScore >= 85, 'Safety floor evaluation active');
assert(childPriority.reasonCodes.length > 0, 'Explainable reason codes provided');

// Test B: Low-risk input with life-safety floor test (Deterministic Floor Invariant)
const lowRiskChild = calculateIncidentPriority({
  incidentId: 'TEST-CHILD-LOW',
  incidentType: 'MISSING_CHILD',
  severity: 'GREEN',
  timeElapsedMinutes: 1,
  subjectAge: 12,
  isSpecialVulnerability: false,
  activeLocalRespondersCount: 5,
  requiredRespondersCount: 2
});

assert(lowRiskChild.effectiveScore === 85, `Deterministic Floor Override enforced: effectiveScore=${lowRiskChild.effectiveScore} must equal floor 85 even with low raw score (${lowRiskChild.rawScore})`);
assert(lowRiskChild.isFloorEnforced === true, 'Deterministic floor enforced flag must be true');

// Test C: Silent SOS / Duress floor test (Floor >= 95)
const duressPriority = calculateIncidentPriority({
  incidentId: 'TEST-SOS-01',
  incidentType: 'SILENT_SOS',
  severity: 'RED',
  timeElapsedMinutes: 2,
  isSpecialVulnerability: true
});

assert(duressPriority.effectiveScore >= 95, `Silent SOS effective score (${duressPriority.effectiveScore}) must obey P_floor >= 95`);
assert(duressPriority.isFloorEnforced === true || duressPriority.rawScore >= 95, 'Silent SOS floor constraint verified');

// ----------------------------------------------------
// 2. FORMULA 2: SPATIO-TEMPORAL PATTERN & DUPLICATE PROBABILITY
// ----------------------------------------------------
console.log('\n--- 2. Testing Spatio-Temporal Duplicate Probability ---');

const baseCoord = { lat: 21.1420, lng: 79.0620 };
const nearbyCoord = { lat: 21.1425, lng: 79.0624 }; // ~60m away
const now = Date.now();

const dupProbHigh = evaluateDuplicateProbability(
  {
    id: 'INC-A',
    coordinates: baseCoord,
    timestamp: new Date(now - 15 * 60000).toISOString(),
    category: 'HARASSMENT',
    description: 'Two men on black motorcycle near bus stand shouting'
  },
  {
    id: 'INC-B',
    coordinates: nearbyCoord,
    timestamp: new Date(now - 10 * 60000).toISOString(),
    category: 'HARASSMENT',
    description: 'Black bike two riders harassing college girls at bus stop'
  }
);

assert(dupProbHigh.duplicateProbability >= 0.70, `Duplicate probability for identical cluster (${(dupProbHigh.duplicateProbability * 100).toFixed(1)}%) >= 70%`);
assert(dupProbHigh.textSimilarity >= 0.60, `Jaro-Winkler similarity (${(dupProbHigh.textSimilarity * 100).toFixed(1)}%) captures semantic match`);
assert(dupProbHigh.spatialDistanceMeters < 100, `Haversine distance (${dupProbHigh.spatialDistanceMeters.toFixed(1)}m) is accurate`);

// ----------------------------------------------------
// 3. FORMULA 3: RESOURCE OPTIMIZER & ZONE DEFICIT
// ----------------------------------------------------
console.log('\n--- 3. Testing Resource Gap Analysis & Allocation Optimizer ---');

const zones = [
  {
    zoneId: 'ZONE-A',
    zoneName: 'Sector 1',
    coordinates: { lat: 21.1458, lng: 79.0882 },
    currentRespondersCount: 2,
    activeIncidentsCount: 3,
    crowdRiskPercent: 80,
    minimumRecommendedResponders: 5
  },
  {
    zoneId: 'ZONE-B',
    zoneName: 'Sector 2',
    coordinates: { lat: 21.1200, lng: 79.0500 },
    currentRespondersCount: 8,
    activeIncidentsCount: 0,
    crowdRiskPercent: 15,
    minimumRecommendedResponders: 2
  }
];

const gaps = analyzeResourceGaps(zones);
assert(gaps.length === 2, 'Resource gaps evaluated for all zones');
const deficitZone = gaps.find(g => g.zoneId === 'ZONE-A');
assert(deficitZone && deficitZone.deficit > 0, `Deficit correctly detected for Zone A (deficit: ${deficitZone?.deficit})`);
assert(deficitZone?.severityLevel === 'CRITICAL_DEFICIT' || deficitZone?.severityLevel === 'ELEVATED_DEMAND', `Zone A severity level verified: ${deficitZone?.severityLevel}`);

const recommendations = generateResourceRecommendations('NAGPUR', gaps);
assert(recommendations.length > 0, `Generated ${recommendations.length} operator recommendations`);
assert(recommendations[0].decision === 'PENDING', 'Recommendations are initialized as PENDING for human review');

// ----------------------------------------------------
// 4. FORMULA 4: PRIVACY-PRESERVING HEATMAP (k >= 3)
// ----------------------------------------------------
console.log('\n--- 4. Testing Privacy-Preserving Heatmap & k-Anonymity ---');

const incidents = [
  // 3 incidents clustered near Sitabuldi (should pass k >= 3)
  { id: '1', coordinates: { lat: 21.1458, lng: 79.0882 }, timestamp: new Date().toISOString(), category: 'HARASSMENT' },
  { id: '2', coordinates: { lat: 21.1460, lng: 79.0885 }, timestamp: new Date().toISOString(), category: 'HARASSMENT' },
  { id: '3', coordinates: { lat: 21.1456, lng: 79.0880 }, timestamp: new Date().toISOString(), category: 'THEFT' },
  // 1 isolated incident far away (must be suppressed, count < 3)
  { id: '4', coordinates: { lat: 21.2000, lng: 79.1500 }, timestamp: new Date().toISOString(), category: 'HARASSMENT' }
];

const cells = generatePrivacyPreservingHeatmap(incidents);
assert(cells.length >= 2, `Quantized grid generated (${cells.length} cells)`);

const activeCells = cells.filter(c => !c.isSuppressed);
const suppressedCells = cells.filter(c => c.isSuppressed);

assert(activeCells.length >= 1, `Active non-suppressed cells exist (${activeCells.length})`);
assert(activeCells.every(c => c.rawCount >= 3), 'Every active cell satisfies k >= 3');
assert(suppressedCells.length >= 1, `Low density cell suppressed (${suppressedCells.length})`);
assert(suppressedCells.every(c => c.rawCount === 0 && c.intensity === 0), 'Every suppressed cell has rawCount=0 and intensity=0');

// ----------------------------------------------------
// 5. FORMULA 5: POST-INCIDENT LEARNING & DATA QUALITY INDEX
// ----------------------------------------------------
console.log('\n--- 5. Testing Post-Incident Response-Time & Quality Benchmark ---');

const telemetry = {
  caseId: 'TEST-INC-99',
  caseType: 'MISSING_PERSON',
  reportedAt: new Date(now - 1200000).toISOString(),
  acknowledgedAt: new Date(now - 1185000).toISOString(), // 15s MTTA
  dispatchedAt: new Date(now - 1150000).toISOString(),     // 35s MTTD
  arrivedAt: new Date(now - 960000).toISOString(),        // 190s MTTArrival
  resolvedAt: new Date(now - 400000).toISOString(),        // 560s MTTR
  volunteersEngaged: 3,
  externalLatencyMs: 145,
  policyTriggered: 'HIGH_PRIORITY_VOLUNTEER_CASCADE'
};

const metrics = computeIncidentMetrics(telemetry);
assert(metrics.mttaSeconds === 15, `MTTA correctly computed: ${metrics.mttaSeconds}s`);
assert(metrics.mttdSeconds === 35, `MTTD correctly computed: ${metrics.mttdSeconds}s`);
assert(metrics.mttArrivalSeconds === 190, `MTTArrival correctly computed: ${metrics.mttArrivalSeconds}s`);
assert(metrics.mttrSeconds === 800, `MTTR correctly computed: ${metrics.mttrSeconds}s`);
assert(metrics.identifiedBottlenecks.length === 0, 'Zero bottlenecks flagged for fast response under SLAs');

const freshness = calculateDataQualityIndex(15, 10, 0.0);
assert(freshness.qualityIndex >= 0.90, `Data Quality Index (${freshness.qualityIndex}) >= 0.90`);
assert(freshness.qualityState === 'FRESH', 'Telemetry marked FRESH for recent ping');

console.log('\n=====================================================');
console.log(`🏁 VERIFICATION COMPLETE: ${passes} PASSED, ${failures} FAILED`);
console.log('=====================================================');

if (failures > 0) process.exit(1);


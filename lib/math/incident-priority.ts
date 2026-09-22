import { PriorityRecommendation, AlertSeverity } from '@/types/safety';

export interface PriorityEvaluationInput {
  incidentId: string;
  incidentType: 'MISSING_CHILD' | 'SILENT_SOS' | 'SAFERIDE_DURESS' | 'ELDER_WANDER' | 'WITNESS_REPORT' | 'CROWD_CRUSH';
  severity: AlertSeverity;
  timeElapsedMinutes: number;
  subjectAge?: number;
  isSpecialVulnerability?: boolean;
  affectedPopulationCount?: number;
  activeLocalRespondersCount?: number;
  requiredRespondersCount?: number;
}

const W_SEVERITY = 0.30;
const W_URGENCY = 0.20;
const W_VULNERABILITY = 0.20;
const W_TIME_DECAY = 0.15;
const W_POPULATION = 0.08;
const W_SCARCITY = 0.07;

const MODEL_VERSION = 'v4.2-calibrated-deterministic-floor';

/**
 * Computes deterministic safety priority floor.
 * AI or statistical ranking CANNOT reduce priority below this minimum.
 */
export function getDeterministicSafetyFloor(type: string, severity: AlertSeverity, age?: number): number {
  if (type === 'SAFERIDE_DURESS' || type === 'SILENT_SOS') {
    return 95; // Extreme Life Safety Floor
  }
  if (type === 'MISSING_CHILD') {
    if (age !== undefined && age <= 10) return 90;
    return 85; // Standard Child Safety Floor
  }
  if (type === 'ELDER_WANDER') {
    return 75; // Elder Safe Zone Breach Floor
  }
  if (severity === 'RED') {
    return 80;
  }
  if (severity === 'ORANGE') {
    return 60;
  }
  return 30; // Baseline floor
}

/**
 * Evaluates continuous multi-factor priority score with floor protection
 */
export function calculateIncidentPriority(input: PriorityEvaluationInput): PriorityRecommendation {
  // 1. Severity Score (0 - 100)
  const severityScore = input.severity === 'RED' ? 95 : input.severity === 'ORANGE' ? 70 : 40;

  // 2. Urgency Score (0 - 100)
  let urgencyScore = 50;
  if (input.incidentType === 'SAFERIDE_DURESS' || input.incidentType === 'SILENT_SOS') urgencyScore = 98;
  else if (input.incidentType === 'MISSING_CHILD') urgencyScore = 88;
  else if (input.incidentType === 'CROWD_CRUSH') urgencyScore = 92;

  // 3. Vulnerability Score (0 - 100)
  let vulnerabilityScore = 40;
  if (input.subjectAge !== undefined && input.subjectAge <= 8) vulnerabilityScore = 95;
  else if (input.subjectAge !== undefined && input.subjectAge <= 14) vulnerabilityScore = 80;
  else if (input.incidentType === 'ELDER_WANDER') vulnerabilityScore = 85;
  else if (input.isSpecialVulnerability) vulnerabilityScore = 90;

  // 4. Time Decay Penalty (0 - 100)
  // Hazard escalates rapidly during the first 60 minutes ("Golden Hour")
  const goldenHourMinutes = 60;
  const timeDecayScore = Math.min(100, Math.round((input.timeElapsedMinutes / goldenHourMinutes) * 100));

  // 5. Population Impact Score (0 - 100)
  const popCount = input.affectedPopulationCount || 1;
  const populationImpactScore = Math.min(100, Math.round(Math.log10(Math.max(1, popCount)) * 33.3));

  // 6. Responder Scarcity Score (0 - 100)
  const avail = input.activeLocalRespondersCount ?? 2;
  const req = Math.max(1, input.requiredRespondersCount ?? 3);
  const scarcityRatio = Math.max(0, 1 - (avail / req));
  const responderScarcityScore = Math.round(scarcityRatio * 100);

  // Raw weighted composite
  const rawScore = Number((
    (W_SEVERITY * severityScore) +
    (W_URGENCY * urgencyScore) +
    (W_VULNERABILITY * vulnerabilityScore) +
    (W_TIME_DECAY * timeDecayScore) +
    (W_POPULATION * populationImpactScore) +
    (W_SCARCITY * responderScarcityScore)
  ).toFixed(1));

  // Enforce Deterministic Safety Floor
  const floor = getDeterministicSafetyFloor(input.incidentType, input.severity, input.subjectAge);
  const effectiveScore = Math.max(floor, Math.min(100, rawScore));
  const isFloorEnforced = effectiveScore === floor && rawScore < floor;

  // Generate explainable reason codes
  const reasonCodes: string[] = [];
  if (isFloorEnforced) {
    reasonCodes.push(`MANDATORY_SAFETY_FLOOR_ENFORCED: Policy ${input.incidentType} requires min priority ${floor}`);
  }
  if (severityScore >= 80) reasonCodes.push(`HIGH_SEVERITY_${input.severity}`);
  if (vulnerabilityScore >= 80) reasonCodes.push(`VULNERABLE_SUBJECT_PROTECTED (Age: ${input.subjectAge ?? 'N/A'})`);
  if (timeDecayScore >= 60) reasonCodes.push(`GOLDEN_HOUR_WINDOW_ACTIVE (${input.timeElapsedMinutes}m elapsed)`);
  if (responderScarcityScore >= 50) reasonCodes.push('LOCAL_RESPONDER_DEFICIT');

  return {
    incidentId: input.incidentId,
    rawScore,
    effectiveScore,
    safetyFloor: floor,
    isFloorEnforced,
    contributingFactors: {
      severityScore,
      urgencyScore,
      vulnerabilityScore,
      timeDecayScore,
      populationImpactScore,
      responderScarcityScore
    },
    reasonCodes,
    modelVersion: MODEL_VERSION,
    evaluatedAt: new Date().toISOString()
  };
}

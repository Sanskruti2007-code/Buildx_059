import { PredictiveCrowdMetrics, TriStateDataCategory } from '@/types/safety';

export interface RawZoneTelemetry {
  zoneId: string;
  zoneName: string;
  areaSqMeters: number;
  currentCount: number;
  previousCount: number;
  deltaSeconds: number; // delta t
  inflowCount: number;
  outflowCount: number;
  exitCapacityPerSec: number; // C_exits
  eventScheduleFactor?: number; // S_sched in [0, 1]
  activeSensors: number;
  totalSensors: number;
  lastUpdatedSecondsAgo: number;
}

// Model weights approved in Phase 3 Architecture Review
const WEIGHT_DENSITY = 3.0;      // w1
const WEIGHT_VELOCITY = 2.5;     // w2
const WEIGHT_NET_FLUX = 2.0;     // w3
const WEIGHT_SCHEDULE = 1.5;     // w4
const MODEL_BIAS = 4.0;          // theta

const CRITICAL_DENSITY_THRESHOLD = 3.0; // rho_crit = 3.0 people/m^2 (Fruin LOS F)
const CRITICAL_VELOCITY_THRESHOLD = 0.05; // v_crit = 0.05 people/(m^2*s)

/**
 * Standard Sigmoid activation: 1 / (1 + e^-z)
 */
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Computes deterministic crowd density: rho = N / A
 */
export function calculateDensity(count: number, areaSqMeters: number): number {
  if (areaSqMeters <= 0) return 0;
  return Number((count / areaSqMeters).toFixed(3));
}

/**
 * Computes net inflow/outflow rate: q_net = (N_in - N_out) / delta_t
 */
export function calculateNetFlowRate(inflow: number, outflow: number, deltaSeconds: number): number {
  const dt = Math.max(1, deltaSeconds);
  return Number(((inflow - outflow) / dt).toFixed(2));
}

/**
 * Computes density velocity (temporal derivative): v_rho = (rho_t - rho_prev) / delta_t
 */
export function calculateDensityVelocity(currentDensity: number, previousDensity: number, deltaSeconds: number): number {
  const dt = Math.max(1, deltaSeconds);
  return Number(((currentDensity - previousDensity) / dt).toFixed(4));
}

/**
 * Computes Predictive Congestion Risk Index: R_cong(t + tau) in [0, 1]
 */
export function calculateCongestionRiskIndex(
  density: number,
  densityVelocity: number,
  netFlowRate: number,
  exitCapacityPerSec: number,
  eventScheduleFactor: number = 0.2
): number {
  const normDensity = density / CRITICAL_DENSITY_THRESHOLD;
  const normVelocity = densityVelocity / CRITICAL_VELOCITY_THRESHOLD;
  const normFlux = netFlowRate / Math.max(1, exitCapacityPerSec);
  const normSched = Math.min(1, Math.max(0, eventScheduleFactor));

  const z = 
    (WEIGHT_DENSITY * normDensity) +
    (WEIGHT_VELOCITY * normVelocity) +
    (WEIGHT_NET_FLUX * normFlux) +
    (WEIGHT_SCHEDULE * normSched) -
    MODEL_BIAS;

  const rawRisk = sigmoid(z);
  return Number(Math.min(1.0, Math.max(0.0, rawRisk)).toFixed(3));
}

/**
 * Computes Prediction Confidence Metric: C_pred in [0, 1]
 * Decays exponentially with stale sensor updates.
 */
export function calculatePredictionConfidence(
  lastUpdatedSecondsAgo: number,
  activeSensors: number,
  totalSensors: number,
  historicalVariance: number = 0.15
): number {
  const lambda = 0.01; // exponential freshness decay rate
  const freshnessTerm = Math.exp(-lambda * Math.max(0, lastUpdatedSecondsAgo));
  const coverageRatio = totalSensors > 0 ? activeSensors / totalSensors : 0.5;
  const varianceStability = Math.max(0, 1 - Math.min(1, historicalVariance));

  const compositeConfidence = 
    (0.50 * freshnessTerm) +
    (0.30 * coverageRatio) +
    (0.20 * varianceStability);

  return Number(Math.min(1.0, Math.max(0.1, compositeConfidence)).toFixed(2));
}

/**
 * Synthesizes human-in-the-loop operational recommendations
 */
export function getRecommendedCrowdAction(riskIndex: number, velocity: number, density: number): string {
  if (riskIndex >= 0.85 || density >= 2.8) {
    return 'CRITICAL SURGE IMMINENT: Open auxiliary emergency gates 3 & 4. Deploy Rapid Action volunteers for perimeter diversion.';
  }
  if (riskIndex >= 0.70 || velocity > 0.04) {
    return 'HIGH CONGESTION WARNING: Activate dynamic queue pulsation at entry portals. Slow inbound transit hub arrivals.';
  }
  if (riskIndex >= 0.40 || density >= 1.5) {
    return 'MODERATE INFLUX: Monitor camera feeds. Prepare volunteer cordons for one-way directional pedestrian circulation.';
  }
  return 'NORMAL FLOW: All egress and ingress conduits operating within standard safety thresholds.';
}

/**
 * End-to-end predictive analytics processing pipeline
 */
export function processPredictiveCrowdAnalytics(telemetry: RawZoneTelemetry): PredictiveCrowdMetrics {
  const currentDensity = calculateDensity(telemetry.currentCount, telemetry.areaSqMeters);
  const previousDensity = calculateDensity(telemetry.previousCount, telemetry.areaSqMeters);
  const netFlow = calculateNetFlowRate(telemetry.inflowCount, telemetry.outflowCount, telemetry.deltaSeconds);
  const velocity = calculateDensityVelocity(currentDensity, previousDensity, telemetry.deltaSeconds);
  
  const riskIndex = calculateCongestionRiskIndex(
    currentDensity,
    velocity,
    netFlow,
    telemetry.exitCapacityPerSec,
    telemetry.eventScheduleFactor ?? 0.3
  );

  const confidence = calculatePredictionConfidence(
    telemetry.lastUpdatedSecondsAgo,
    telemetry.activeSensors,
    telemetry.totalSensors
  );

  const action = getRecommendedCrowdAction(riskIndex, velocity, currentDensity);

  return {
    zoneId: telemetry.zoneId,
    zoneName: telemetry.zoneName,
    areaSqMeters: telemetry.areaSqMeters,
    currentCount: telemetry.currentCount,
    densityPeoplePerSqMeter: currentDensity,
    inflowRatePerSec: Number((telemetry.inflowCount / Math.max(1, telemetry.deltaSeconds)).toFixed(2)),
    outflowRatePerSec: Number((telemetry.outflowCount / Math.max(1, telemetry.deltaSeconds)).toFixed(2)),
    netFlowRatePerSec: netFlow,
    densityVelocity: velocity,
    congestionRiskIndex: riskIndex,
    confidenceScore: confidence,
    predictionHorizonMinutes: 15,
    category: 'PREDICTED',
    recommendedAction: action,
    lastCalculatedAt: new Date().toISOString()
  };
}

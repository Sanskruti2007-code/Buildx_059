import { Coordinates, RoutePoint, SafeZone, AlertSeverity } from '@/types/safety';
import { calculateHaversineDistance } from '@/lib/geo/haversine';

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculates bearing from start to end in radians.
 */
function calculateBearingRadians(start: Coordinates, end: Coordinates): number {
  const phi1 = toRadians(start.lat);
  const phi2 = toRadians(end.lat);
  const deltaLambda = toRadians(end.lng - start.lng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  return Math.atan2(y, x);
}

/**
 * Calculates spherical cross-track distance d_xt from user position Pu to geodesic segment (P1 -> P2).
 * Formula: d_xt = R * |asin( sin(delta_1u) * sin(theta_1u - theta_12) )|
 */
export function calculateCrossTrackDistance(
  userPos: Coordinates,
  p1: Coordinates,
  p2: Coordinates
): number {
  const dist1u = calculateHaversineDistance(p1, userPos);
  if (dist1u === 0) return 0;

  const delta1u = dist1u / EARTH_RADIUS_METERS;
  const theta1u = calculateBearingRadians(p1, userPos);
  const theta12 = calculateBearingRadians(p1, p2);

  // Perpendicular cross-track distance
  const dXt = Math.abs(
    Math.asin(Math.sin(delta1u) * Math.sin(theta1u - theta12)) * EARTH_RADIUS_METERS
  );

  // Along-track distance to verify if point projection lies within segment endpoints
  const dAt = Math.acos(Math.cos(delta1u) / Math.cos(dXt / EARTH_RADIUS_METERS)) * EARTH_RADIUS_METERS;
  const segLength = calculateHaversineDistance(p1, p2);

  // If projection falls before P1 or after P2, clamp to endpoint distance
  if (isNaN(dAt) || dAt < 0) {
    return calculateHaversineDistance(userPos, p1);
  }
  if (dAt > segLength) {
    return calculateHaversineDistance(userPos, p2);
  }

  return Math.round(dXt);
}

/**
 * Calculates minimum distance from user position to a complete piecewise polyline route.
 */
export function calculateDistanceToRouteCorridor(
  userPos: Coordinates,
  routePoints: RoutePoint[]
): number {
  if (routePoints.length === 0) return 0;
  if (routePoints.length === 1) {
    return calculateHaversineDistance(userPos, routePoints[0]);
  }

  let minDistance = Infinity;

  for (let i = 0; i < routePoints.length - 1; i++) {
    const p1 = routePoints[i];
    const p2 = routePoints[i + 1];
    const d = calculateCrossTrackDistance(userPos, p1, p2);
    if (d < minDistance) {
      minDistance = d;
    }
  }

  return minDistance === Infinity ? 0 : minDistance;
}

/**
 * Evaluates whether an elderly person has crossed a safe zone perimeter with a 35m hysteresis buffer.
 * Eliminates ping-pong alert spamming on zone perimeters caused by GPS jitter.
 */
export function evaluateHysteresisGeofence(
  currentPos: Coordinates,
  safeZone: SafeZone,
  previousState: 'INSIDE' | 'OUTSIDE',
  hysteresisBufferMeters: number = 35
): { isOutside: boolean; distanceToBorder: number } {
  const distFromCenter = calculateHaversineDistance(currentPos, safeZone.center);
  const r = safeZone.radiusMeters;

  let isOutside = previousState === 'OUTSIDE';

  if (distFromCenter > r + hysteresisBufferMeters) {
    isOutside = true;
  } else if (distFromCenter < r - hysteresisBufferMeters) {
    isOutside = false;
  }

  const distanceToBorder = Math.abs(distFromCenter - r);

  return { isOutside, distanceToBorder };
}

/**
 * Multi-Factor Responder Dispatch Scorer for SafeRide & Silent SOS emergencies.
 * S_resp = I_eligible * [0.45 * S_dist + 0.25 * S_auth + 0.20 * S_avail + 0.10 * S_load]
 * Strict gate: Civilian volunteers are NEVER dispatched to high-risk RED emergencies.
 */
export function calculateResponderDispatchScore(params: {
  responderLocation: Coordinates;
  incidentLocation: Coordinates;
  authorityRole: 'POLICE' | 'VERIFIED_PATROL' | 'VOLUNTEER';
  alertSeverity: AlertSeverity;
  isAvailable: boolean;
  activeWorkload: number;
}): { score: number; eligible: boolean; rejectionReason?: string } {
  const { responderLocation, incidentLocation, authorityRole, alertSeverity, isAvailable, activeWorkload } = params;

  // Strict Safety Gate
  if (alertSeverity === 'RED' && authorityRole === 'VOLUNTEER') {
    return { score: 0, eligible: false, rejectionReason: 'Civilian volunteers barred from high-risk RED alerts (Safety Protocol)' };
  }

  const distMeters = calculateHaversineDistance(responderLocation, incidentLocation);

  // Proximity score (decay over 5km)
  const sDist = Math.exp(-(distMeters * distMeters) / (2 * 2500 * 2500));

  // Authority score
  const sAuth = authorityRole === 'POLICE' ? 1.0 : authorityRole === 'VERIFIED_PATROL' ? 0.8 : 0.5;

  // Availability score
  const sAvail = isAvailable ? 1.0 : 0.3;

  // Workload penalty
  const sLoad = 1.0 / (1.0 + activeWorkload);

  const compositeScore = 0.45 * sDist + 0.25 * sAuth + 0.20 * sAvail + 0.10 * sLoad;

  return {
    score: parseFloat(compositeScore.toFixed(4)),
    eligible: true,
  };
}

/**
 * Evaluates Safety PIN vs Duress PIN.
 * Normal PIN: 1234 -> Cancels false alarm safely.
 * Duress PIN: 9876 -> Deceptively shows "Session Ended Safely" while firing a SILENT RED ALERT.
 */
export function evaluatePinDisarm(inputPin: string): {
  valid: boolean;
  isDuress: boolean;
  action: 'SAFE_DISARM' | 'SILENT_DURESS_RED_ALERT' | 'INVALID_PIN';
} {
  const trimmed = inputPin.trim();

  if (trimmed === '9876') {
    return { valid: true, isDuress: true, action: 'SILENT_DURESS_RED_ALERT' };
  }
  if (trimmed === '1234') {
    return { valid: true, isDuress: false, action: 'SAFE_DISARM' };
  }

  return { valid: false, isDuress: false, action: 'INVALID_PIN' };
}

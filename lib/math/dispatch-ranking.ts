import { Coordinates, DispatchCandidate } from '@/types/safety';
import { calculateHaversineDistance } from '@/lib/geo/haversine';

export interface RawResponderProfile {
  id: string;
  name: string;
  phone: string;
  role: 'POLICE' | 'MEDICAL' | 'VOLUNTEER' | 'RAPID_ACTION';
  cityId: string;
  policeStationZone: string;
  currentCoordinates: Coordinates;
  activeCasesCount: number;
}

export interface IncidentContext {
  id: string;
  cityId: string;
  policeStationZone: string;
  coordinates: Coordinates;
  requiredRole?: 'POLICE' | 'MEDICAL' | 'VOLUNTEER' | 'RAPID_ACTION';
  isCrossCityAuthorized?: boolean;
}

const ALPHA_DISTANCE = 0.40;
const BETA_CAPABILITY = 0.25;
const GAMMA_WORKLOAD = 0.20;
const DELTA_JURISDICTION = 0.15;

const MAX_SEARCH_DISTANCE_KM = 12.0;
const MAX_ACTIVE_WORKLOAD = 4;

/**
 * Evaluates capability match between incident requirement and responder role
 */
function evaluateCapabilityMatch(requiredRole?: string, responderRole?: string): number {
  if (!requiredRole) return 1.0;
  if (requiredRole === responderRole) return 1.0;
  if (requiredRole === 'POLICE' && responderRole === 'RAPID_ACTION') return 0.85;
  if (requiredRole === 'MEDICAL' && responderRole === 'VOLUNTEER') return 0.40;
  return 0.50;
}

/**
 * Evaluates jurisdiction affinity score
 */
function evaluateJurisdictionAffinity(
  incidentCityId: string,
  incidentZone: string,
  responderCityId: string,
  responderZone: string,
  isCrossCityAuthorized: boolean = false
): number {
  if (incidentCityId === responderCityId) {
    if (incidentZone === responderZone) return 1.0; // Same city & same police zone
    return 0.70; // Same city, adjacent zone
  }
  // Cross-city scenario
  return isCrossCityAuthorized ? 0.40 : 0.10;
}

/**
 * Computes multi-factor dispatch ranking for all candidate responders
 */
export function rankRespondersForIncident(
  responders: RawResponderProfile[],
  incident: IncidentContext
): DispatchCandidate[] {
  return responders
    .map(resp => {
      const distanceMeters = calculateHaversineDistance(
        incident.coordinates,
        resp.currentCoordinates
      );
      const distanceKm = Number((distanceMeters / 1000).toFixed(2));

      // 1. Distance score (1 - d/d_max)
      const distanceScore = Math.max(0, 1 - (distanceKm / MAX_SEARCH_DISTANCE_KM));

      // 2. Capability score
      const capScore = evaluateCapabilityMatch(incident.requiredRole, resp.role);

      // 3. Workload score (1 - W/W_max)
      const workloadScore = Math.max(0, 1 - (resp.activeCasesCount / MAX_ACTIVE_WORKLOAD));

      // 4. Jurisdiction affinity
      const jurScore = evaluateJurisdictionAffinity(
        incident.cityId,
        incident.policeStationZone,
        resp.cityId,
        resp.policeStationZone,
        incident.isCrossCityAuthorized
      );

      // Composite dispatch score
      const composite = 
        (ALPHA_DISTANCE * distanceScore) +
        (BETA_CAPABILITY * capScore) +
        (GAMMA_WORKLOAD * workloadScore) +
        (DELTA_JURISDICTION * jurScore);

      const isCrossCity = resp.cityId !== incident.cityId;

      return {
        responderId: resp.id,
        name: resp.name,
        phone: resp.phone,
        role: resp.role,
        cityId: resp.cityId,
        policeStationZone: resp.policeStationZone,
        distanceKm,
        capabilityMatch: capScore,
        activeWorkload: resp.activeCasesCount,
        jurisdictionAffinity: jurScore,
        compositeDispatchScore: Number(composite.toFixed(3)),
        isCrossCity
      };
    })
    .sort((a, b) => b.compositeDispatchScore - a.compositeDispatchScore);
}

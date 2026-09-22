import { Coordinates } from '@/types/safety';

const EARTH_RADIUS_METERS = 6371000; // Mean Earth radius in meters

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculates great-circle distance between two geographic coordinates using the Haversine formula.
 * Precision: within ~0.3% error over typical operational radiuses (< 10km).
 * Avoids planar Euclidean distortion on non-equatorial latitudes.
 */
export function calculateHaversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const phi1 = toRadians(coord1.lat);
  const phi2 = toRadians(coord2.lat);
  const deltaPhi = toRadians(coord2.lat - coord1.lat);
  const deltaLambda = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Calculates spatial decay score S_loc in [0.0, 1.0].
 * Uses Gaussian decay over distance d relative to radius sigma_d.
 * For distance 0: S_loc = 1.0
 * For distance = maxRadius: S_loc ~ 0.135
 */
export function calculateSpatialDecayScore(distanceMeters: number, maxRadiusMeters: number = 2000): number {
  if (distanceMeters <= 0) return 1.0;
  const sigma = maxRadiusMeters / 2;
  const score = Math.exp(-(distanceMeters * distanceMeters) / (2 * sigma * sigma));
  return parseFloat(Math.min(1.0, Math.max(0.0, score)).toFixed(4));
}

/**
 * Calculates compass bearing from origin to target.
 */
export function calculateBearing(origin: Coordinates, target: Coordinates): string {
  const phi1 = toRadians(origin.lat);
  const phi2 = toRadians(target.lat);
  const deltaLambda = toRadians(target.lng - origin.lng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearingDegrees = (toDegrees(Math.atan2(y, x)) + 360) % 360;

  const cardinalPoints = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearingDegrees / 22.5) % 16;
  return cardinalPoints[index];
}

/**
 * Formats a metric distance into human-readable meters or kilometers.
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${distanceMeters} m`;
  }
  return `${(distanceMeters / 1000).toFixed(2)} km`;
}

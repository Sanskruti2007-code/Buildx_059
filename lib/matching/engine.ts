import { 
  MissingChildCase, 
  FoundChildReport, 
  MatchCandidate, 
  MatchBreakdown 
} from '@/types/safety';
import { calculateHaversineDistance, calculateSpatialDecayScore } from '@/lib/geo/haversine';

// Weights confirmed by user architectural sign-off
export const MATCH_WEIGHTS = {
  face: 0.40,
  location: 0.25,
  time: 0.15,
  age: 0.10,
  clothing: 0.10,
} as const;

export const HIGH_PRIORITY_CANDIDATE_THRESHOLD = 0.82;
export const POTENTIAL_LEAD_THRESHOLD = 0.60;

/**
 * Normalizes text tokens for comparison (e.g. "red t-shirt", "red shirt").
 */
function tokenize(text: string): Set<string> {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

/**
 * Calculates Jaccard similarity between two clothing descriptions.
 */
export function calculateClothingSimilarity(
  desc1: { top?: string; bottom?: string; footwear?: string; notes?: string },
  desc2: { top?: string; bottom?: string; footwear?: string; notes?: string }
): number {
  const str1 = `${desc1.top || ''} ${desc1.bottom || ''} ${desc1.footwear || ''} ${desc1.notes || ''}`;
  const str2 = `${desc2.top || ''} ${desc2.bottom || ''} ${desc2.footwear || ''} ${desc2.notes || ''}`;

  const tokens1 = tokenize(str1);
  const tokens2 = tokenize(str2);

  if (tokens1.size === 0 || tokens2.size === 0) return 0.5; // neutral when unspecified

  const arr1 = Array.from(tokens1);
  const arr2 = Array.from(tokens2);

  const intersection = arr1.filter((x) => tokens2.has(x));
  const union = new Set([...arr1, ...arr2]);

  return parseFloat((intersection.length / union.size).toFixed(4));
}

/**
 * Calculates age compatibility using Gaussian variance with sigma = 2.0 years.
 */
export function calculateAgeCompatibility(age1: number, age2: number): number {
  const diff = Math.abs(age1 - age2);
  const sigma = 2.0;
  const score = Math.exp(-(diff * diff) / (2 * sigma * sigma));
  return parseFloat(score.toFixed(4));
}

/**
 * Calculates temporal compatibility score.
 * Penalizes impossible timelines where found time is days before last seen time.
 */
export function calculateTimeCompatibility(lastSeenIso: string, foundIso: string, distanceMeters: number): number {
  const tSeen = new Date(lastSeenIso).getTime();
  const tFound = new Date(foundIso).getTime();

  const diffHours = (tFound - tSeen) / (1000 * 60 * 60);

  // If found significantly BEFORE last seen, timeline is highly improbable
  if (diffHours < -2.0) {
    return 0.1;
  }

  // If found within reasonable travel window (walking speed ~3km/h + 2hr buffer)
  const walkingHoursNeeded = (distanceMeters / 1000) / 3.0;
  if (diffHours >= -0.5 && diffHours <= walkingHoursNeeded + 8.0) {
    return 1.0;
  }

  // Gradual decay for longer delays
  const decay = Math.exp(-Math.abs(diffHours) / 24.0);
  return parseFloat(Math.max(0.2, decay).toFixed(4));
}

/**
 * Simulates normalized cosine similarity for face features between two images.
 * In a production deployment with FaceNet/InsightFace embeddings, this evaluates:
 * (u · v) / (||u|| ||v||)
 */
export function calculateSimulatedFaceSimilarity(photo1?: string, photo2?: string, seedCorrelation: number = 0.88): number {
  if (!photo1 || !photo2) return 0.50; // Neutral fallback when missing photo
  // If both photos reference the same subject in demo simulation
  if (photo1 === photo2) return 0.98;
  return parseFloat(seedCorrelation.toFixed(4));
}

/**
 * Computes composite two-way match candidate between a Missing Child Case and a Found Child Report.
 */
export function evaluateCandidateMatch(
  missingCase: MissingChildCase,
  foundReport: FoundChildReport,
  overrideFaceSim?: number
): MatchCandidate {
  // 1. Gender strict gate
  const g1 = missingCase.gender;
  const g2 = foundReport.gender;
  const genderMatch = g1 === g2 || g1 === 'UNKNOWN' || g2 === 'UNKNOWN';
  const genderMultiplier = genderMatch ? 1.0 : 0.25;

  // 2. Location score
  const distMeters = calculateHaversineDistance(missingCase.lastSeenLocation, foundReport.foundLocation);
  const locationScore = calculateSpatialDecayScore(distMeters, missingCase.searchRadiusMeters || 2000);

  // 3. Temporal compatibility
  const timeScore = calculateTimeCompatibility(missingCase.lastSeenTime, foundReport.foundTime, distMeters);

  // 4. Age compatibility
  const ageScore = calculateAgeCompatibility(missingCase.age, foundReport.estimatedAge);

  // 5. Clothing similarity
  const clothingScore = calculateClothingSimilarity(missingCase.clothing, foundReport.clothing);

  // 6. Facial similarity
  const faceScore = overrideFaceSim ?? calculateSimulatedFaceSimilarity(missingCase.photoUrl, foundReport.childPhotoUrl, 0.88);

  // Composite Weighted Sum
  const rawWeightedScore =
    MATCH_WEIGHTS.face * faceScore +
    MATCH_WEIGHTS.location * locationScore +
    MATCH_WEIGHTS.time * timeScore +
    MATCH_WEIGHTS.age * ageScore +
    MATCH_WEIGHTS.clothing * clothingScore;

  const compositeScore = parseFloat((rawWeightedScore * genderMultiplier).toFixed(4));

  const breakdown: MatchBreakdown = {
    faceSimilarity: faceScore,
    locationScore: locationScore,
    timeScore: timeScore,
    ageCompatibility: ageScore,
    clothingSimilarity: clothingScore,
    genderGatePassed: genderMatch,
  };

  return {
    id: `MATCH-${missingCase.id}-${foundReport.id}`,
    missingCaseId: missingCase.id,
    foundReportId: foundReport.id,
    compositeScore,
    breakdown,
    humanVerified: false,
    decision: 'UNDER_REVIEW',
    createdAt: new Date().toISOString(),
  };
}

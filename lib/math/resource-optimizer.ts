import { OperatorRecommendation, Coordinates } from '@/types/safety';

export interface ZoneResourceDemand {
  zoneId: string;
  zoneName: string;
  coordinates: Coordinates;
  activeIncidentsCount: number;
  crowdRiskPercent: number;
  currentRespondersCount: number;
  minimumRecommendedResponders: number;
}

export interface ResourceGapAnalysis {
  zoneId: string;
  zoneName: string;
  demandScore: number;
  availableResponders: number;
  deficit: number; // Positive = shortage
  severityLevel: 'OPTIMAL' | 'ELEVATED_DEMAND' | 'CRITICAL_DEFICIT';
}

/**
 * Evaluates zone-by-zone supply vs demand deficit
 */
export function analyzeResourceGaps(zones: ZoneResourceDemand[]): ResourceGapAnalysis[] {
  return zones.map(z => {
    // Demand weighting: 1 incident requires 1.5 responders; high crowd risk adds up to 3 responders
    const crowdDemand = Math.round((z.crowdRiskPercent / 100) * 3);
    const incidentDemand = Math.ceil(z.activeIncidentsCount * 1.5);
    const totalRequired = Math.max(z.minimumRecommendedResponders, crowdDemand + incidentDemand);
    const deficit = totalRequired - z.currentRespondersCount;

    let severityLevel: ResourceGapAnalysis['severityLevel'] = 'OPTIMAL';
    if (deficit >= 3) severityLevel = 'CRITICAL_DEFICIT';
    else if (deficit > 0) severityLevel = 'ELEVATED_DEMAND';

    return {
      zoneId: z.zoneId,
      zoneName: z.zoneName,
      demandScore: totalRequired,
      availableResponders: z.currentRespondersCount,
      deficit: Math.max(0, deficit),
      severityLevel
    };
  });
}

/**
 * Synthesizes proactive recommendations for human-in-the-loop control room review
 */
export function generateResourceRecommendations(
  cityId: string,
  gapAnalyses: ResourceGapAnalysis[]
): OperatorRecommendation[] {
  const recommendations: OperatorRecommendation[] = [];

  const deficitZones = gapAnalyses.filter(g => g.deficit > 0).sort((a, b) => b.deficit - a.deficit);
  const surplusZones = gapAnalyses.filter(g => g.availableResponders > g.demandScore);

  deficitZones.forEach((defZone, idx) => {
    const surplusDonor = surplusZones[0];
    const shiftCount = Math.min(defZone.deficit, surplusDonor ? surplusDonor.availableResponders - surplusDonor.demandScore : 2);

    if (shiftCount > 0 && surplusDonor) {
      recommendations.push({
        id: `REC-${cityId.toUpperCase()}-0${idx + 1}`,
        cityId,
        targetZoneId: defZone.zoneId,
        targetZoneName: defZone.zoneName,
        type: 'REPOSITION_VOLUNTEERS',
        headline: `Reposition ${shiftCount} Responders from ${surplusDonor.zoneName} to ${defZone.zoneName}`,
        rationale: `${defZone.zoneName} exhibits an active deficit of ${defZone.deficit} responders with high pending demand. ${surplusDonor.zoneName} currently has operational surplus.`,
        dataPoints: [
          `Target Zone Demand: ${defZone.demandScore} units`,
          `Current Allocation: ${defZone.availableResponders} active responders`,
          `Deficit Severity: ${defZone.severityLevel}`,
          `Donor Zone: ${surplusDonor.zoneName} (${surplusDonor.availableResponders} present, ${surplusDonor.demandScore} needed)`
        ],
        confidenceScore: 0.88,
        decision: 'PENDING',
        suggestedActionPayload: {
          donorZoneId: surplusDonor.zoneId,
          targetZoneId: defZone.zoneId,
          responderCount: shiftCount
        },
        createdAt: new Date().toISOString()
      });
    } else {
      recommendations.push({
        id: `REC-${cityId.toUpperCase()}-0${idx + 1}`,
        cityId,
        targetZoneId: defZone.zoneId,
        targetZoneName: defZone.zoneName,
        type: 'DISPATCH_MOBILE_PATROL',
        headline: `Dispatch Mobile Patrol Unit to ${defZone.zoneName}`,
        rationale: `Zero local volunteer surplus available. Deploy Police Mobile Van to cover the ${defZone.deficit}-responder deficit at ${defZone.zoneName}.`,
        dataPoints: [
          `Demand: ${defZone.demandScore} units`,
          `Local Responders: ${defZone.availableResponders}`,
          `Deficit: ${defZone.deficit} units`
        ],
        confidenceScore: 0.92,
        decision: 'PENDING',
        createdAt: new Date().toISOString()
      });
    }
  });

  return recommendations;
}

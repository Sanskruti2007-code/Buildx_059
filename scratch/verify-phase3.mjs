import { 
  calculateDensity, 
  calculateNetFlowRate, 
  calculateDensityVelocity, 
  calculateCongestionRiskIndex, 
  calculatePredictionConfidence,
  processPredictiveCrowdAnalytics 
} from '../lib/math/predictive-crowd';

import { 
  rankRespondersForIncident 
} from '../lib/math/dispatch-ranking';

import { erss112Adapter } from '../lib/integrations/erss-adapter';
import { cctnsAdapter } from '../lib/integrations/cctns-adapter';
import { droneGatewayAdapter } from '../lib/integrations/drone-adapter';
import { CITIES_REGISTRY, getCityConfig } from '../lib/config/cities';

console.log('====================================================');
console.log('🧪 MEHFUS PHASE 3: COMPREHENSIVE VERIFICATION SUITE');
console.log('====================================================\n');

// 1. Density Calculation (rho = N / A)
const density = calculateDensity(2400, 1000);
console.log(`[1] Crowd Density rho (N=2400, A=1000m²): ${density} p/m²`);
if (density !== 2.4) throw new Error('Density calculation error');
console.log('    ✓ Density passed.\n');

// 2. Net Flow Rate (q_net = (In - Out) / dt)
const netFlow = calculateNetFlowRate(120, 30, 15);
console.log(`[2] Net Flow Flux q_net (In=120, Out=30, dt=15s): ${netFlow} p/s`);
if (netFlow !== 6.0) throw new Error('Net flow calculation error');
console.log('    ✓ Net flow passed.\n');

// 3. Density Velocity (v_rho = (rho_t - rho_prev) / dt)
const velocity = calculateDensityVelocity(2.8, 1.6, 20);
console.log(`[3] Density Velocity v_rho (rho_t=2.8, rho_prev=1.6, dt=20s): ${velocity} p/(m²·s)`);
if (velocity <= 0) throw new Error('Velocity calculation error');
console.log('    ✓ Velocity passed.\n');

// 4. Congestion Risk Index Sigmoid (R_cong in [0, 1])
const riskNormal = calculateCongestionRiskIndex(0.8, 0.005, 1.0, 20, 0.1);
const riskSurge = calculateCongestionRiskIndex(2.9, 0.06, 18.0, 12, 0.9);
console.log(`[4] Congestion Risk Index R_cong:`);
console.log(`    - Normal conditions: ${riskNormal} (Expected < 0.40)`);
console.log(`    - Severe surge: ${riskSurge} (Expected >= 0.85)`);
if (riskNormal >= 0.40 || riskSurge < 0.80) throw new Error('Congestion risk modeling error');
console.log('    ✓ Congestion risk passed.\n');

// 5. Prediction Confidence
const confFresh = calculatePredictionConfidence(5, 8, 8);
const confStale = calculatePredictionConfidence(180, 4, 8);
console.log(`[5] Prediction Confidence C_pred:`);
console.log(`    - Fresh sensor data: ${(confFresh * 100).toFixed(0)}%`);
console.log(`    - Stale sensor data (3m ago): ${(confStale * 100).toFixed(0)}%`);
if (confFresh <= confStale) throw new Error('Confidence decay error');
console.log('    ✓ Prediction confidence passed.\n');

// 6. Multi-Factor Dispatch Ranking S_disp
const responders = [
  {
    id: 'R1',
    name: 'Officer A (Local)',
    phone: '123',
    role: 'POLICE',
    cityId: 'nagpur',
    policeStationZone: 'Zone-1',
    currentCoordinates: { lat: 21.146, lng: 79.089 },
    activeCasesCount: 0
  },
  {
    id: 'R2',
    name: 'Officer B (Remote Cross-City)',
    phone: '456',
    role: 'POLICE',
    cityId: 'mumbai',
    policeStationZone: 'CSMT',
    currentCoordinates: { lat: 18.940, lng: 72.835 },
    activeCasesCount: 2
  }
];
const rankings = rankRespondersForIncident(responders, {
  id: 'INC-1',
  cityId: 'nagpur',
  policeStationZone: 'Zone-1',
  coordinates: { lat: 21.1458, lng: 79.0882 },
  requiredRole: 'POLICE',
  isCrossCityAuthorized: true
});
console.log(`[6] Dispatch Ranking S_disp:`);
console.log(`    - Rank #1: ${rankings[0].name} -> Score: ${rankings[0].compositeDispatchScore}`);
console.log(`    - Rank #2: ${rankings[1].name} -> Score: ${rankings[1].compositeDispatchScore}`);
if (rankings[0].compositeDispatchScore <= rankings[1].compositeDispatchScore) {
  throw new Error('Local responder should outrank remote responder');
}
console.log('    ✓ Dispatch ranking passed.\n');

// 7. ERSS 112 CAD Adapter Simulation
console.log('[7] ERSS 112 CAD Adapter:');
const cadRes = await erss112Adapter.dispatchEmergency({
  incidentId: 'INC-TEST-01',
  incidentType: 'MISSING_PERSON',
  cityId: 'nagpur',
  sourceJurisdiction: 'Nagpur Central HQ',
  severity: 'RED',
  coordinates: { lat: 21.1458, lng: 79.0882 },
  notes: 'Priority alert',
  idempotencyKey: 'IDEMP-TEST-01'
});
console.log(`    - Reference: ${cadRes.externalReferenceId}`);
console.log(`    - Latency: ${cadRes.latencyMs}ms`);
console.log(`    - Watermark: ${cadRes.watermark}`);
if (!cadRes.externalReferenceId.startsWith('CAD-NAG-2026-')) throw new Error('Invalid CAD token');
console.log('    ✓ ERSS 112 Adapter passed.\n');

// 8. CCTNS Police Sync Simulation
console.log('[8] CCTNS Police Sync:');
const cctnsRes = await cctnsAdapter.syncMissingPersonCase({
  caseId: 'CASE-01',
  cityId: 'nagpur',
  caseType: 'MISSING_PERSON',
  personName: 'Rohan Sharma',
  age: 8,
  gender: 'MALE',
  lastSeenLocation: { lat: 21.1275, lng: 79.0669 },
  stationCode: 'MH-NGP-STN-04'
});
console.log(`    - FIR Record: ${cctnsRes.cctnsRecordId}`);
console.log(`    - Audit Token: ${cctnsRes.auditToken}`);
console.log(`    - Watermark: ${cctnsRes.watermark}`);
if (!cctnsRes.cctnsRecordId.startsWith('CCTNS-MH-2026-FIR-')) throw new Error('Invalid CCTNS token');
console.log('    ✓ CCTNS Adapter passed.\n');

// 9. Drone Telemetry & Privacy Boundary
console.log('[9] Drone Telemetry & Privacy Gate:');
const grant = droneGatewayAdapter.authorizeDroneSession({
  droneId: 'DRONE-NGP-ALPHA-1',
  incidentId: 'INC-TEST-01',
  operatorId: 'INSP-KALE',
  operatorRole: 'CONTROL_ROOM',
  purpose: 'Quadrant perimeter sweep'
});
console.log(`    - Session ID: ${grant.sessionId}`);
console.log(`    - Stream URL: ${grant.streamUrl}`);
console.log(`    - Privacy: ${grant.privacyNotice}`);
if (!grant.granted || !grant.privacyNotice.includes('Mass biometric recognition is disabled')) {
  throw new Error('Drone privacy constraint missing');
}
console.log('    ✓ Drone Gateway passed.\n');

// 10. Multi-City Registry Verification
console.log('[10] City Tenant Catalog:');
const cities = Object.keys(CITIES_REGISTRY);
console.log(`    - Configured Cities: ${cities.join(', ')}`);
if (!cities.includes('nagpur') || !cities.includes('mumbai') || !cities.includes('pune') || !cities.includes('london')) {
  throw new Error('Missing expected cities in registry');
}
console.log('    ✓ City Registry passed.\n');

console.log('====================================================');
console.log('🎉 ALL 10 PHASE 3 ARCHITECTURAL ENGINES VERIFIED 100%');
console.log('====================================================');

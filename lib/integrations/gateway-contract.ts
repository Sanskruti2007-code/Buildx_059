import { IntegrationStatus } from '@/types/safety';

export interface EmergencyPayload {
  incidentId: string;
  incidentType: 'SILENT_SOS' | 'SAFERIDE_DURESS' | 'MISSING_PERSON' | 'CROWD_CRUSH_HAZARD';
  cityId: string;
  sourceJurisdiction: string;
  callerPhone?: string;
  victimName?: string;
  coordinates: {
    lat: number;
    lng: number;
    landmark?: string;
  };
  severity: 'YELLOW' | 'ORANGE' | 'RED';
  notes: string;
  idempotencyKey: string;
}

export interface IntegrationResult {
  success: boolean;
  externalReferenceId: string; // e.g. "CAD-NGP-2026-8912"
  acknowledgementTimestamp: string;
  latencyMs: number;
  deliveryState: 'DELIVERED' | 'QUEUED' | 'RETRYING' | 'FAILED';
  isSimulation: boolean;
  watermark: string; // e.g. "SIMULATION — ERSS 112 DISPATCH"
  error?: string;
}

export interface CircuitBreakerState {
  failureCount: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export interface IEmergencyIntegration {
  readonly serviceName: string;
  readonly isSimulation: boolean;
  dispatchEmergency(payload: EmergencyPayload): Promise<IntegrationResult>;
  checkHealth(): Promise<{ status: IntegrationStatus; latencyMs: number; errorRate: number }>;
}

/**
 * Generates an idempotent transaction key
 */
export function generateIdempotencyKey(incidentId: string, timestamp: number = Date.now()): string {
  return `IDEMP-${incidentId}-${Math.floor(timestamp / 60000)}`;
}

/**
 * Calculates exponential backoff with full jitter
 */
export function calculateBackoffMs(attempt: number, baseMs: number = 200, maxMs: number = 3000): number {
  const exp = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  const jitter = Math.random() * exp;
  return Math.floor(jitter);
}

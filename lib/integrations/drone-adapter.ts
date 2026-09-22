import { DroneTelemetry, Coordinates } from '@/types/safety';

export interface DroneSessionRequest {
  droneId: string;
  incidentId: string;
  operatorId: string;
  operatorRole: string;
  purpose: string;
}

export interface DroneSessionGrant {
  granted: boolean;
  sessionId: string;
  droneId: string;
  streamUrl: string;
  watermark: string;
  privacyNotice: string;
  expiresAt: string;
}

export const INITIAL_DRONE_FLEET: DroneTelemetry[] = [
  {
    id: 'DRONE-NGP-ALPHA-1',
    callsign: 'Garuda-1',
    cityId: 'nagpur',
    assignedIncidentId: 'DB-2026-CASE-01',
    status: 'HOVERING_INCIDENT',
    batteryPercent: 82,
    altitudeMeters: 120,
    headingDegrees: 45,
    speedKmh: 14.5,
    gimbalPitchDegrees: -45,
    coordinates: { lat: 21.1275, lng: 79.0669, landmark: 'Deeksha Bhoomi Stupa Apex' },
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-crowded-city-square-41315-large.mp4',
    flightTrail: [
      { lat: 21.1265, lng: 79.0655 },
      { lat: 21.1270, lng: 79.0660 },
      { lat: 21.1275, lng: 79.0669 }
    ],
    authorizedOperator: 'INSP-KALE-NGP',
    purpose: 'Aerial crowd dispersion monitoring & missing child quadrant perimeter scan',
    cameraType: 'EO_IR_OPTICAL',
    lastPingTime: new Date().toISOString()
  },
  {
    id: 'DRONE-MUM-BETA-2',
    callsign: 'Kite-2',
    cityId: 'mumbai',
    status: 'PATROLLING',
    batteryPercent: 91,
    altitudeMeters: 150,
    headingDegrees: 180,
    speedKmh: 28.0,
    gimbalPitchDegrees: -30,
    coordinates: { lat: 18.9402, lng: 72.8356, landmark: 'CSMT Station Terminus' },
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-and-buildings-42526-large.mp4',
    flightTrail: [
      { lat: 18.9390, lng: 72.8340 },
      { lat: 18.9402, lng: 72.8356 }
    ],
    authorizedOperator: 'SUB-INSP-PATIL-MUM',
    purpose: 'Transit hub ingress crowd flow monitoring',
    cameraType: 'THERMAL',
    lastPingTime: new Date().toISOString()
  },
  {
    id: 'DRONE-PUN-GAMMA-1',
    callsign: 'Pawan-1',
    cityId: 'pune',
    status: 'AIRBORNE',
    batteryPercent: 74,
    altitudeMeters: 95,
    headingDegrees: 90,
    speedKmh: 22.0,
    gimbalPitchDegrees: -60,
    coordinates: { lat: 18.5204, lng: 73.8567, landmark: 'Shivajinagar Interchange' },
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-aerial-shot-of-a-crossroad-with-cars-42524-large.mp4',
    flightTrail: [
      { lat: 18.5190, lng: 73.8550 },
      { lat: 18.5204, lng: 73.8567 }
    ],
    authorizedOperator: 'COMM-DESHMUKH-PUN',
    purpose: 'Elderly wander tracking perimeter surveillance',
    cameraType: 'EO_IR_OPTICAL',
    lastPingTime: new Date().toISOString()
  }
];

export class DroneGatewayAdapter {
  private fleet: Map<string, DroneTelemetry> = new Map();

  constructor() {
    INITIAL_DRONE_FLEET.forEach(d => this.fleet.set(d.id, d));
  }

  getFleetByCity(cityId: string): DroneTelemetry[] {
    return Array.from(this.fleet.values()).filter(d => d.cityId === cityId);
  }

  getAllDrones(): DroneTelemetry[] {
    return Array.from(this.fleet.values());
  }

  getDrone(droneId: string): DroneTelemetry | undefined {
    return this.fleet.get(droneId);
  }

  authorizeDroneSession(req: DroneSessionRequest): DroneSessionGrant {
    const drone = this.fleet.get(req.droneId);
    if (!drone) {
      return {
        granted: false,
        sessionId: 'NONE',
        droneId: req.droneId,
        streamUrl: '',
        watermark: 'UNAUTHORIZED_DRONE',
        privacyNotice: 'Drone not found in registry',
        expiresAt: ''
      };
    }

    // Attach incident binding
    drone.assignedIncidentId = req.incidentId;
    drone.authorizedOperator = req.operatorId;
    drone.purpose = req.purpose;
    drone.status = 'HOVERING_INCIDENT';
    this.fleet.set(drone.id, drone);

    return {
      granted: true,
      sessionId: `DRONE-SESS-${Date.now().toString(36).toUpperCase()}`,
      droneId: drone.id,
      streamUrl: drone.streamUrl,
      watermark: 'AUTHORIZED EMERGENCY SURVEILLANCE FEED — MEHFUS OPS',
      privacyNotice: 'Feed is strictly linked to incident ' + req.incidentId + '. Mass biometric recognition is disabled.',
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour token
    };
  }

  updateTelemetry(droneId: string, coords: Coordinates, battery: number): void {
    const drone = this.fleet.get(droneId);
    if (drone) {
      drone.flightTrail.push(coords);
      if (drone.flightTrail.length > 20) drone.flightTrail.shift();
      drone.coordinates = coords;
      drone.batteryPercent = battery;
      drone.lastPingTime = new Date().toISOString();
      this.fleet.set(droneId, drone);
    }
  }
}

export const droneGatewayAdapter = new DroneGatewayAdapter();

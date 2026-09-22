import { CityConfig } from '@/types/safety';

export const CITIES_REGISTRY: Record<string, CityConfig> = {
  nagpur: {
    id: 'nagpur',
    name: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    emergencyNumber: '112',
    policeHelpline: '100',
    womenHelpline: '1091',
    centerCoordinates: { lat: 21.1458, lng: 79.0882 },
    defaultZoom: 14,
    transportHubCount: 3,
    activeRespondersCount: 48,
    cctnsStationCode: 'MH-NGP-STN-04',
    erssZoneCode: 'ERSS-MH-ZONE-EAST-1',
    droneBaseCount: 3,
    currency: 'INR',
    timeZone: 'Asia/Kolkata',
    locale: 'en-IN',
  },
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    emergencyNumber: '112',
    policeHelpline: '100',
    womenHelpline: '103',
    centerCoordinates: { lat: 18.9402, lng: 72.8356 },
    defaultZoom: 13,
    transportHubCount: 8,
    activeRespondersCount: 142,
    cctnsStationCode: 'MH-MUM-STN-12',
    erssZoneCode: 'ERSS-MH-ZONE-WEST-1',
    droneBaseCount: 6,
    currency: 'INR',
    timeZone: 'Asia/Kolkata',
    locale: 'en-IN',
  },
  pune: {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    emergencyNumber: '112',
    policeHelpline: '100',
    womenHelpline: '1091',
    centerCoordinates: { lat: 18.5204, lng: 73.8567 },
    defaultZoom: 13,
    transportHubCount: 4,
    activeRespondersCount: 64,
    cctnsStationCode: 'MH-PUN-STN-07',
    erssZoneCode: 'ERSS-MH-ZONE-WEST-2',
    droneBaseCount: 4,
    currency: 'INR',
    timeZone: 'Asia/Kolkata',
    locale: 'en-IN',
  },
  london: {
    id: 'london',
    name: 'London (International Demo)',
    state: 'Greater London',
    country: 'United Kingdom',
    countryCode: 'GB',
    emergencyNumber: '999',
    policeHelpline: '101',
    womenHelpline: '0808 2000 247',
    centerCoordinates: { lat: 51.5074, lng: -0.1278 },
    defaultZoom: 12,
    transportHubCount: 12,
    activeRespondersCount: 210,
    cctnsStationCode: 'MET-POL-STN-01',
    erssZoneCode: 'UK-ERSS-LON-CENTRAL',
    droneBaseCount: 8,
    currency: 'GBP',
    timeZone: 'Europe/London',
    locale: 'en-GB',
  }
};

export const DEFAULT_CITY_ID = 'nagpur';

export function getCityConfig(cityId: string): CityConfig {
  return CITIES_REGISTRY[cityId] || CITIES_REGISTRY[DEFAULT_CITY_ID];
}

export function getAllCities(): CityConfig[] {
  return Object.values(CITIES_REGISTRY);
}

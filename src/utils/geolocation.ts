export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  state?: string;
  country?: string;
  source?: 'gps' | 'ip' | 'manual';
  displayName?: string;
}

export interface LocationPreset {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

export const KNOWN_LOCATION_PRESETS: LocationPreset[] = [
  { id: 'bardoli', name: 'Bardoli', state: 'Gujarat', latitude: 21.1197, longitude: 73.1167 },
  { id: 'surat', name: 'Surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311 },
];

export function calculateDistanceKm(): number {
  return 0;
}

export function formatDistance(): string {
  return '';
}

export async function reverseGeocode(): Promise<{ city?: string; displayName?: string }> {
  return {};
}

export async function getIpBasedLocation(): Promise<Coordinates> {
  return { latitude: 0, longitude: 0 };
}

export async function searchLocationQuery(): Promise<Coordinates[]> {
  return [];
}

export async function getCurrentBrowserLocation(): Promise<Coordinates> {
  return { latitude: 0, longitude: 0 };
}

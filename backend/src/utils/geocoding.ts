/**
 * Geocoding Utility for Restaurants and Branches
 * Resolves coordinates from addresses, town names, or postal codes
 */

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

// Known coordinates for Gujarat & Maharashtra regional towns and major Indian cities
const KNOWN_CITIES: Record<string, GeoCoordinates> = {
  bardoli: { latitude: 21.1197, longitude: 73.1167 },
  surat: { latitude: 21.1702, longitude: 72.8311 },
  vyara: { latitude: 21.1105, longitude: 73.3916 },
  navsari: { latitude: 20.9500, longitude: 72.9300 },
  valsad: { latitude: 20.5992, longitude: 72.9342 },
  vapi: { latitude: 20.3893, longitude: 72.9106 },
  ankleshwar: { latitude: 21.6264, longitude: 73.0152 },
  bharuch: { latitude: 21.7051, longitude: 72.9959 },
  vadodara: { latitude: 22.3072, longitude: 73.1812 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  gandhinagar: { latitude: 23.2156, longitude: 72.6369 },
  rajkot: { latitude: 22.3039, longitude: 70.8022 },
  bhavnagar: { latitude: 21.7645, longitude: 72.1519 },
  mumbai: { latitude: 19.0760, longitude: 72.8777 },
  thane: { latitude: 19.2183, longitude: 72.9781 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  nashik: { latitude: 19.9975, longitude: 73.7898 },
  delhi: { latitude: 28.6139, longitude: 77.2090 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
};

/**
 * Resolves coordinates based on address text or outlet name
 */
export function geocodeAddress(address?: string | null, name?: string | null): GeoCoordinates | null {
  const combined = `${address || ''} ${name || ''}`.toLowerCase();

  for (const [city, coords] of Object.entries(KNOWN_CITIES)) {
    // Word boundary or containment check
    if (combined.includes(city)) {
      return coords;
    }
  }

  return null;
}

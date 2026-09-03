/**
 * Geolocation & Distance Calculation Utilities
 * Uses browser-provided coordinates and reverse geocoding.
 */

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
  { id: 'vyara', name: 'Vyara', state: 'Gujarat', latitude: 21.1105, longitude: 73.3916 },
  { id: 'navsari', name: 'Navsari', state: 'Gujarat', latitude: 20.9500, longitude: 72.9300 },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
];

/**
 * Calculates distance in kilometers between two GPS coordinates using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return 0;
  }

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Formats a distance in kilometers into a clean, human-readable label
 */
export function formatDistance(km?: number | null): string {
  if (km === undefined || km === null || !Number.isFinite(km)) return '';
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

/**
 * Resolves a friendly city/area name for given coordinates
 */
export async function reverseGeocode(lat: number, lon: number): Promise<{ city?: string; displayName?: string }> {
  // 1. Quick check against known presets (< 18km match)
  for (const preset of KNOWN_LOCATION_PRESETS) {
    const dist = calculateDistanceKm(lat, lon, preset.latitude, preset.longitude);
    if (dist <= 18) {
      return {
        city: preset.name,
        displayName: `${preset.name}, ${preset.state}`,
      };
    }
  }

  // 2. Fetch from OpenStreetMap Nominatim reverse geocode (safe fallback with timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.suburb ||
        data.address?.county ||
        data.address?.state_district;
      const state = data.address?.state;
      const displayName = [city, state].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 2).join(',');
      return { city: city || undefined, displayName: displayName || undefined };
    }
  } catch {
    // Non-fatal
  }

  return { displayName: `${lat.toFixed(3)}, ${lon.toFixed(3)}` };
}

/**
 * Fetches user location via IP-based geolocation fallback
 */
export async function getIpBasedLocation(): Promise<Coordinates> {
  const apis = [
    async () => {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3500) });
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          state: data.region,
          country: data.country_name,
          source: 'ip' as const,
          displayName: [data.city, data.region].filter(Boolean).join(', '),
        };
      }
      throw new Error('Invalid ipapi payload');
    },
    async () => {
      const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3500) });
      const data = await res.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          state: data.region,
          country: data.country,
          source: 'ip' as const,
          displayName: [data.city, data.region].filter(Boolean).join(', '),
        };
      }
      throw new Error('Invalid ipwhois payload');
    },
  ];

  for (const apiFn of apis) {
    try {
      return await apiFn();
    } catch {
      continue;
    }
  }

  throw new Error('Could not determine IP-based location.');
}

/**
 * Searches location by query string (city name, pincode, area)
 */
export async function searchLocationQuery(query: string): Promise<Coordinates[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Match local presets first
  const presetMatches = KNOWN_LOCATION_PRESETS.filter((p) =>
    p.name.toLowerCase().includes(trimmed) || p.state.toLowerCase().includes(trimmed)
  ).map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
    city: p.name,
    state: p.state,
    displayName: `${p.name}, ${p.state}`,
    source: 'manual' as const,
  }));

  if (presetMatches.length > 0) {
    return presetMatches;
  }

  // Query Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        signal: AbortSignal.timeout(4000),
        headers: { 'Accept-Language': 'en' },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.map((item: any) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        city: item.address?.city || item.address?.town || item.address?.village || item.name,
        state: item.address?.state,
        country: item.address?.country,
        displayName: item.display_name?.split(',').slice(0, 3).join(','),
        source: 'manual' as const,
      }));
    }
  } catch {
    // Return empty on error
  }

  return [];
}

/**
 * Requests a fresh browser position. IP and preset coordinates are intentionally
 * not used here because they can point to a different city than the device.
 */
export async function getCurrentBrowserLocation(): Promise<Coordinates> {
  // Ask the browser for a fresh position rather than reusing a cached fix.
  const html5Promise = new Promise<Coordinates>((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: 'gps',
        });
      },
      (_err1) => {
        // Fallback to standard accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              source: 'gps',
            });
          },
          (err2) => {
            reject(err2);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });

  try {
    const coords = await html5Promise;
    // Enrich with friendly city name
    const geo: { city?: string; displayName?: string } = await reverseGeocode(coords.latitude, coords.longitude).catch(() => ({}));
    return {
      ...coords,
      city: geo.city,
      displayName: geo.displayName || `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`,
    };
  } catch (err) {
    throw err;
  }
}

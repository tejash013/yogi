import { create } from 'zustand';
import { tenantsApi } from '@/api/endpoints';
import {
  calculateDistanceKm,
  getCurrentBrowserLocation,
  type Coordinates,
} from '@/utils/geolocation';
import type { Branch, Restaurant } from '@/types';

export const DEFAULT_RESTAURANT_ID = '000000000000000000000001';
export const DEFAULT_BRANCH_ID = '000000000000000000000002';

// Regional town coordinates for fallback matching
const REGIONAL_COORDS: Record<string, { lat: number; lng: number }> = {
  bardoli: { lat: 21.1197, lng: 73.1167 },
  surat: { lat: 21.1702, lng: 72.8311 },
  vyara: { lat: 21.1105, lng: 73.3916 },
  navsari: { lat: 20.9500, lng: 72.9300 },
  valsad: { lat: 20.5992, lng: 72.9342 },
  vapi: { lat: 20.3893, lng: 72.9106 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  'downtown-main': { lat: 19.0760, lng: 72.8777 },
  'uptown-express': { lat: 19.1136, lng: 72.8697 },
  'airport-bistro': { lat: 19.0896, lng: 72.8656 },
  'coastal-breeze': { lat: 19.0988, lng: 72.8267 },
};

function resolveFallbackCoords(item: { address?: string; name?: string; slug?: string }): { lat: number; lng: number } {
  const combined = `${item.address || ''} ${item.name || ''} ${item.slug || ''}`.toLowerCase();
  for (const [key, coords] of Object.entries(REGIONAL_COORDS)) {
    if (combined.includes(key)) {
      return coords;
    }
  }
  // Default to Bardoli / South Gujarat primary hub
  return { lat: 21.1197, lng: 73.1167 };
}

function enrichWithLocation<T extends { _id: string; slug?: string; name?: string; address?: string; latitude?: number; longitude?: number; distanceKm?: number }>(
  item: T,
  userLocation: { latitude: number; longitude: number } | null
): T {
  let lat = item.latitude;
  let lng = item.longitude;

  if (lat === undefined || lng === undefined || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    const fallback = resolveFallbackCoords(item);
    lat = fallback.lat;
    lng = fallback.lng;
  }

  let distanceKm: number | undefined;
  if (userLocation && Number.isFinite(userLocation.latitude) && Number.isFinite(userLocation.longitude)) {
    distanceKm = calculateDistanceKm(userLocation.latitude, userLocation.longitude, lat, lng);
  }

  return {
    ...item,
    latitude: lat,
    longitude: lng,
    distanceKm,
  };
}

interface TenantState {
  restaurantId: string;
  branchId: string;
  currentRestaurant: Restaurant | null;
  currentBranch: Branch | null;
  availableRestaurants: Restaurant[];
  availableBranches: Branch[];
  allBranches: Branch[];
  nearestBranch: Branch | null;
  isLoading: boolean;
  isModalOpen: boolean;

  // Geolocation & Proximity Filtering
  userLocation: Coordinates | null;
  isLocating: boolean;
  locationError: string | null;
  onlyNearby: boolean;
  maxRadiusKm: number;

  setModalOpen: (open: boolean) => void;
  setTenant: (restaurantId: string, branchId: string) => Promise<void>;
  switchRestaurant: (restaurantId: string) => Promise<void>;
  switchBranch: (branchId: string) => void;
  loadTenants: () => Promise<void>;
  requestUserLocation: () => Promise<void>;
  setManualLocation: (location: Coordinates) => void;
  setOnlyNearby: (enabled: boolean) => void;
  setMaxRadiusKm: (radius: number) => void;
}

const initialRestaurantId =
  localStorage.getItem('restaurantos-restaurant-id') || DEFAULT_RESTAURANT_ID;
const initialBranchId =
  localStorage.getItem('restaurantos-branch-id') || DEFAULT_BRANCH_ID;

// Parse stored user location from localStorage if present
function getStoredLocation(): Coordinates | null {
  try {
    const stored = localStorage.getItem('restaurantos-user-location');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number') {
        return parsed;
      }
    }
  } catch {}
  return null;
}

// Stored preferences: Default onlyNearby to true!
const storedOnlyNearby = localStorage.getItem('restaurantos-only-nearby') !== 'false';
const storedRadius = Number(localStorage.getItem('restaurantos-max-radius') || 25);

export const useTenantStore = create<TenantState>((set, get) => ({
  restaurantId: initialRestaurantId,
  branchId: initialBranchId,
  currentRestaurant: {
    _id: initialRestaurantId,
    name: 'Yogi Restaurant',
    slug: 'yogi',
    latitude: 21.1197,
    longitude: 73.1167,
    isActive: true,
  },
  currentBranch: {
    _id: initialBranchId,
    restaurantId: initialRestaurantId,
    name: 'Yogi Res (Bardoli)',
    slug: 'yogi-res',
    address: 'Bardoli',
    latitude: 21.1197,
    longitude: 73.1167,
    isActive: true,
  },
  availableRestaurants: [],
  availableBranches: [],
  allBranches: [],
  nearestBranch: null,
  isLoading: false,
  isModalOpen: false,

  // Geolocation defaults: onlyNearby is true by default
  userLocation: getStoredLocation(),
  isLocating: false,
  locationError: null,
  onlyNearby: storedOnlyNearby,
  maxRadiusKm: Number.isFinite(storedRadius) && storedRadius > 0 ? storedRadius : 25,

  setOnlyNearby: (enabled: boolean) => {
    localStorage.setItem('restaurantos-only-nearby', String(enabled));
    set({ onlyNearby: enabled });
  },

  setMaxRadiusKm: (radius: number) => {
    localStorage.setItem('restaurantos-max-radius', String(radius));
    set({ maxRadiusKm: radius });
  },

  setManualLocation: (coords: Coordinates) => {
    localStorage.setItem('restaurantos-user-location', JSON.stringify(coords));
    set({ userLocation: coords, isLocating: false, locationError: null });

    // Re-enrich and re-sort
    const { availableRestaurants, allBranches, restaurantId, branchId } = get();
    const enrichedBranches = allBranches.map((b) => enrichWithLocation(b, coords));
    enrichedBranches.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

    const enrichedRestaurants = availableRestaurants.map((r) => {
      const restBranches = enrichedBranches.filter((b) => String(b.restaurantId) === String(r._id));
      const minBranchDist = restBranches[0]?.distanceKm;
      const direct = enrichWithLocation(r, coords);
      return {
        ...direct,
        distanceKm: minBranchDist !== undefined ? minBranchDist : direct.distanceKm,
      };
    });
    enrichedRestaurants.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

    const currentRestBranches = enrichedBranches.filter((b) => String(b.restaurantId) === String(restaurantId));
    const nearest = enrichedBranches[0] || null;

    let targetBranch = currentRestBranches.find((b) => b._id === branchId) || currentRestBranches[0] || nearest;
    let targetRest = enrichedRestaurants.find((r) => r._id === restaurantId) || enrichedRestaurants[0] || null;

    set({
      userLocation: coords,
      availableRestaurants: enrichedRestaurants,
      availableBranches: currentRestBranches,
      allBranches: enrichedBranches,
      nearestBranch: nearest,
      currentBranch: targetBranch,
      currentRestaurant: targetRest,
    });
  },

  requestUserLocation: async () => {
    set({ isLocating: true, locationError: null });
    try {
      const coords = await getCurrentBrowserLocation();
      localStorage.setItem('restaurantos-user-location', JSON.stringify(coords));

      const { availableRestaurants, allBranches, restaurantId, branchId } = get();
      const enrichedBranches = allBranches.map((b) => enrichWithLocation(b, coords));
      enrichedBranches.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

      const enrichedRestaurants = availableRestaurants.map((r) => {
        const restBranches = enrichedBranches.filter((b) => String(b.restaurantId) === String(r._id));
        const minBranchDist = restBranches[0]?.distanceKm;
        const direct = enrichWithLocation(r, coords);
        return {
          ...direct,
          distanceKm: minBranchDist !== undefined ? minBranchDist : direct.distanceKm,
        };
      });
      enrichedRestaurants.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

      const currentRestBranches = enrichedBranches.filter((b) => String(b.restaurantId) === String(restaurantId));
      const nearest = enrichedBranches[0] || null;

      let targetBranch = currentRestBranches.find((b) => b._id === branchId) || currentRestBranches[0] || nearest;
      let targetRest = enrichedRestaurants.find((r) => r._id === restaurantId) || enrichedRestaurants[0] || null;

      set({
        userLocation: coords,
        isLocating: false,
        locationError: null,
        availableRestaurants: enrichedRestaurants,
        availableBranches: currentRestBranches,
        allBranches: enrichedBranches,
        nearestBranch: nearest,
        currentBranch: targetBranch,
        currentRestaurant: targetRest,
      });
    } catch (err: any) {
      set({
        isLocating: false,
        locationError: err?.message || 'Unable to access your current location.',
      });
    }
  },

  setModalOpen: (open: boolean) => set({ isModalOpen: open }),

  loadTenants: async () => {
    set({ isLoading: true });
    try {
      const userLoc = get().userLocation;

      // 1. Fetch all restaurants & all branches in parallel
      const [rRes, bRes] = await Promise.all([
        tenantsApi.getRestaurants().catch(() => ({ data: { data: [] } })),
        tenantsApi.getAllBranches().catch(() => ({ data: { data: [] } })),
      ]);

      const rawRestaurants: Restaurant[] = Array.isArray(rRes?.data?.data)
        ? rRes.data.data
        : Array.isArray(rRes?.data)
        ? (rRes.data as any)
        : [];

      const rawBranches: Branch[] = Array.isArray(bRes?.data?.data)
        ? bRes.data.data
        : Array.isArray(bRes?.data)
        ? (bRes.data as any)
        : [];

      // Enrich all branches with location & distance
      let allBranches = rawBranches.map((b) => enrichWithLocation(b, userLoc));
      if (userLoc) {
        allBranches.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      }

      // Enrich all restaurants with location & distance (min distance of its branches)
      let restaurants: Restaurant[] = rawRestaurants.map((r) => {
        const restBranches = allBranches.filter((b) => String(b.restaurantId) === String(r._id));
        const minBranchDist = restBranches[0]?.distanceKm;
        const direct = enrichWithLocation(r, userLoc);
        return {
          ...direct,
          distanceKm: minBranchDist !== undefined ? minBranchDist : direct.distanceKm,
        };
      });

      if (userLoc) {
        restaurants.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      }

      // Identify active restaurant & branch
      const currentRestId = get().restaurantId || DEFAULT_RESTAURANT_ID;
      let targetRest: Restaurant | null = restaurants.find((r) => r._id === currentRestId) || restaurants[0] || null;

      if (!targetRest && restaurants.length === 0) {
        targetRest = enrichWithLocation<Restaurant>(
          {
            _id: DEFAULT_RESTAURANT_ID,
            name: 'Yogi Grand Restaurant & Lounge',
            slug: 'yogi-grand',
            latitude: 21.1197,
            longitude: 73.1167,
            isActive: true,
          },
          userLoc
        );
      }

      const activeRestBranches = allBranches.filter(
        (b) => targetRest && String(b.restaurantId) === String(targetRest._id)
      );

      const currentBranchId = get().branchId || DEFAULT_BRANCH_ID;
      let targetBranch =
        activeRestBranches.find((b) => b._id === currentBranchId) ||
        activeRestBranches[0] ||
        allBranches[0] ||
        null;

      if (!targetBranch && allBranches.length === 0) {
        targetBranch = enrichWithLocation(
          {
            _id: DEFAULT_BRANCH_ID,
            restaurantId: targetRest?._id ?? DEFAULT_RESTAURANT_ID,
            name: 'Main Dining Hall (Bardoli)',
            slug: 'downtown-main',
            address: 'Bardoli Center',
            latitude: 21.1197,
            longitude: 73.1167,
            isActive: true,
          },
          userLoc
        );
      }

      const restId = targetRest?._id ?? DEFAULT_RESTAURANT_ID;
      const brId = targetBranch?._id ?? DEFAULT_BRANCH_ID;

      localStorage.setItem('restaurantos-restaurant-id', restId);
      localStorage.setItem('restaurantos-branch-id', brId);

      set({
        restaurantId: restId,
        branchId: brId,
        currentRestaurant: targetRest,
        currentBranch: targetBranch,
        availableRestaurants: restaurants.length > 0 ? restaurants : [targetRest],
        availableBranches: activeRestBranches.length > 0 ? activeRestBranches : allBranches,
        allBranches: allBranches.length > 0 ? allBranches : (targetBranch ? [targetBranch] : []),
        nearestBranch: allBranches[0] || targetBranch || null,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  switchRestaurant: async (restaurantId: string) => {
    // Restrict staff (non-customers) from changing restaurant
    const storedToken = localStorage.getItem('restaurantos-token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload?.role && payload.role !== 'customer') {
          return;
        }
      } catch {}
    }

    set({ isLoading: true });
    try {
      const userLoc = get().userLocation;
      const targetRest = get().availableRestaurants.find((r) => r._id === restaurantId) || null;

      // Filter from already loaded allBranches
      let branches = get().allBranches.filter((b) => String(b.restaurantId) === String(restaurantId));
      if (branches.length === 0) {
        const bRes = await tenantsApi.getBranches(restaurantId).catch(() => ({ data: { data: [] } }));
        const rawBranches: Branch[] = Array.isArray(bRes?.data?.data)
          ? bRes.data.data
          : Array.isArray(bRes?.data)
          ? (bRes.data as any)
          : [];
        branches = rawBranches.map((b) => enrichWithLocation(b, userLoc));
      }

      if (userLoc) {
        branches.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      }

      const targetBranch = branches[0] || null;
      const brId = targetBranch?._id || DEFAULT_BRANCH_ID;

      localStorage.setItem('restaurantos-restaurant-id', restaurantId);
      localStorage.setItem('restaurantos-branch-id', brId);

      set({
        restaurantId,
        branchId: brId,
        currentRestaurant: targetRest,
        currentBranch: targetBranch,
        availableBranches: branches,
        isLoading: false,
      });

      window.dispatchEvent(new CustomEvent('restaurantos:tenant:change', { detail: { restaurantId, branchId: brId } }));
    } catch {
      set({ isLoading: false });
    }
  },

  switchBranch: (branchId: string) => {
    // Restrict staff (non-customers) from changing branch
    const storedToken = localStorage.getItem('restaurantos-token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload?.role && payload.role !== 'customer') {
          return;
        }
      } catch {}
    }

    // Search in availableBranches or allBranches
    const targetBranch =
      get().availableBranches.find((b) => b._id === branchId) ||
      get().allBranches.find((b) => b._id === branchId) ||
      null;

    if (!targetBranch) return;

    localStorage.setItem('restaurantos-branch-id', branchId);

    // If branch belongs to a different restaurant, switch restaurant too
    if (targetBranch.restaurantId && String(targetBranch.restaurantId) !== String(get().restaurantId)) {
      const restId = String(targetBranch.restaurantId);
      localStorage.setItem('restaurantos-restaurant-id', restId);
      const targetRest = get().availableRestaurants.find((r) => r._id === restId) || null;
      set({
        restaurantId: restId,
        branchId,
        currentRestaurant: targetRest,
        currentBranch: targetBranch,
      });
    } else {
      set({
        branchId,
        currentBranch: targetBranch,
      });
    }

    window.dispatchEvent(
      new CustomEvent('restaurantos:tenant:change', {
        detail: { restaurantId: get().restaurantId, branchId },
      })
    );
  },

  setTenant: async (restaurantId: string, branchId: string) => {
    localStorage.setItem('restaurantos-restaurant-id', restaurantId);
    localStorage.setItem('restaurantos-branch-id', branchId);
    set({ restaurantId, branchId });
    await get().loadTenants();
    window.dispatchEvent(new CustomEvent('restaurantos:tenant:change', { detail: { restaurantId, branchId } }));
  },
}));

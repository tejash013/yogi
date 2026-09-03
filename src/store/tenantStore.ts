import { create } from 'zustand';
import { tenantsApi } from '@/api/endpoints';
import { calculateDistanceKm, getCurrentBrowserLocation } from '@/utils/geolocation';
import type { Branch, Restaurant } from '@/types';

export const DEFAULT_RESTAURANT_ID = '000000000000000000000001';
export const DEFAULT_BRANCH_ID = '000000000000000000000002';

// Default fallback coordinates for known locations
const DEFAULT_BRANCH_COORDS: Record<string, { lat: number; lng: number }> = {
  [DEFAULT_BRANCH_ID]: { lat: 19.0760, lng: 72.8777 },
  'downtown-main': { lat: 19.0760, lng: 72.8777 },
  'uptown-express': { lat: 19.1136, lng: 72.8697 },
  'airport-bistro': { lat: 19.0896, lng: 72.8656 },
  'coastal-breeze': { lat: 19.0988, lng: 72.8267 },
};

function enrichWithLocation<T extends { _id: string; slug?: string; latitude?: number; longitude?: number; distanceKm?: number }>(
  item: T,
  userLocation: { latitude: number; longitude: number } | null
): T {
  const fallback = DEFAULT_BRANCH_COORDS[item._id] || (item.slug ? DEFAULT_BRANCH_COORDS[item.slug] : null);
  const lat = item.latitude ?? fallback?.lat ?? 19.0760;
  const lng = item.longitude ?? fallback?.lng ?? 72.8777;

  let distanceKm: number | undefined;
  if (userLocation) {
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
  isLoading: boolean;
  isModalOpen: boolean;

  // Geolocation & Proximity Filtering
  userLocation: { latitude: number; longitude: number; accuracy?: number } | null;
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
  setOnlyNearby: (enabled: boolean) => void;
  setMaxRadiusKm: (radius: number) => void;
}

const initialRestaurantId =
  localStorage.getItem('restaurantos-restaurant-id') || DEFAULT_RESTAURANT_ID;
const initialBranchId =
  localStorage.getItem('restaurantos-branch-id') || DEFAULT_BRANCH_ID;

export const useTenantStore = create<TenantState>((set, get) => ({
  restaurantId: initialRestaurantId,
  branchId: initialBranchId,
  currentRestaurant: {
    _id: initialRestaurantId,
    name: 'Yogi Grand Restaurant & Lounge',
    slug: 'yogi-grand',
    latitude: 19.0760,
    longitude: 72.8777,
    isActive: true,
  },
  currentBranch: {
    _id: initialBranchId,
    restaurantId: initialRestaurantId,
    name: 'Main Dining Hall (Downtown)',
    slug: 'downtown-main',
    address: '101 Culinary Blvd, City Center',
    latitude: 19.0760,
    longitude: 72.8777,
    isActive: true,
  },
  availableRestaurants: [],
  availableBranches: [],
  isLoading: false,
  isModalOpen: false,

  // Geolocation defaults
  userLocation: null,
  isLocating: false,
  locationError: null,
  onlyNearby: false,
  maxRadiusKm: 25,

  setOnlyNearby: (enabled: boolean) => set({ onlyNearby: enabled }),
  setMaxRadiusKm: (radius: number) => set({ maxRadiusKm: radius }),

  requestUserLocation: async () => {
    set({ isLocating: true, locationError: null });
    try {
      const coords = await getCurrentBrowserLocation();
      const userLoc = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      };
      set({ userLocation: userLoc, isLocating: false, locationError: null });

      // Re-enrich current lists with distance
      const { availableRestaurants, availableBranches, currentRestaurant, currentBranch } = get();
      const enrichedRestaurants = availableRestaurants.map((r) => enrichWithLocation(r, userLoc));
      const enrichedBranches = availableBranches.map((b) => enrichWithLocation(b, userLoc));
      const enrichedCurrentRest = currentRestaurant ? enrichWithLocation(currentRestaurant, userLoc) : null;
      const enrichedCurrentBranch = currentBranch ? enrichWithLocation(currentBranch, userLoc) : null;

      // Auto-sort branches by distance if detected
      enrichedBranches.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

      set({
        availableRestaurants: enrichedRestaurants,
        availableBranches: enrichedBranches,
        currentRestaurant: enrichedCurrentRest,
        currentBranch: enrichedCurrentBranch,
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

      // 1. Load active restaurants
      const rRes = await tenantsApi.getRestaurants().catch(() => ({ data: { data: [] } }));
      const rawRestaurants: Restaurant[] = Array.isArray(rRes?.data?.data)
        ? rRes.data.data
        : Array.isArray(rRes?.data)
        ? (rRes.data as any)
        : [];

      const restaurants = rawRestaurants.map((r) => enrichWithLocation(r, userLoc));
      const currentRestId = get().restaurantId || DEFAULT_RESTAURANT_ID;
      let targetRest = restaurants.find((r) => r._id === currentRestId) || restaurants[0] || null;

      if (!targetRest && restaurants.length === 0) {
        targetRest = enrichWithLocation(
          {
            _id: DEFAULT_RESTAURANT_ID,
            name: 'Yogi Grand Restaurant & Lounge',
            slug: 'yogi-grand',
            latitude: 19.0760,
            longitude: 72.8777,
            isActive: true,
          },
          userLoc
        );
      }

      // 2. Load branches for active restaurant
      let branches: Branch[] = [];
      if (targetRest?._id) {
        const bRes = await tenantsApi.getBranches(targetRest._id).catch(() => ({ data: { data: [] } }));
        const rawBranches: Branch[] = Array.isArray(bRes?.data?.data)
          ? bRes.data.data
          : Array.isArray(bRes?.data)
          ? (bRes.data as any)
          : [];
        branches = rawBranches.map((b) => enrichWithLocation(b, userLoc));
        if (userLoc) {
          branches.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
        }
      }

      const currentBranchId = get().branchId || DEFAULT_BRANCH_ID;
      let targetBranch = branches.find((b) => b._id === currentBranchId) || branches[0] || null;

      if (!targetBranch && branches.length === 0) {
        targetBranch = enrichWithLocation(
          {
            _id: DEFAULT_BRANCH_ID,
            restaurantId: targetRest?._id ?? DEFAULT_RESTAURANT_ID,
            name: 'Main Dining Hall (Downtown)',
            slug: 'downtown-main',
            address: '101 Culinary Blvd, City Center',
            latitude: 19.0760,
            longitude: 72.8777,
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
        availableBranches: branches.length > 0 ? branches : [targetBranch],
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
      const bRes = await tenantsApi.getBranches(restaurantId).catch(() => ({ data: { data: [] } }));
      const rawBranches: Branch[] = Array.isArray(bRes?.data?.data)
        ? bRes.data.data
        : Array.isArray(bRes?.data)
        ? (bRes.data as any)
        : [];

      let branches = rawBranches.map((b) => enrichWithLocation(b, userLoc));
      if (userLoc) {
        branches.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      }

      const targetRest = get().availableRestaurants.find((r) => r._id === restaurantId) || null;
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

    const targetBranch = get().availableBranches.find((b) => b._id === branchId) || null;
    localStorage.setItem('restaurantos-branch-id', branchId);
    set({
      branchId,
      currentBranch: targetBranch,
    });
    window.dispatchEvent(new CustomEvent('restaurantos:tenant:change', { detail: { restaurantId: get().restaurantId, branchId } }));
  },

  setTenant: async (restaurantId: string, branchId: string) => {
    localStorage.setItem('restaurantos-restaurant-id', restaurantId);
    localStorage.setItem('restaurantos-branch-id', branchId);
    set({ restaurantId, branchId });
    await get().loadTenants();
    window.dispatchEvent(new CustomEvent('restaurantos:tenant:change', { detail: { restaurantId, branchId } }));
  },
}));

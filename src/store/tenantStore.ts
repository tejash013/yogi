import { create } from 'zustand';
import { tenantsApi } from '@/api/endpoints';
import { useOrderSyncStore } from './orderSyncStore';
import type { Branch, Restaurant } from '@/types';

export const DEFAULT_RESTAURANT_ID = '000000000000000000000001';
export const DEFAULT_BRANCH_ID = '000000000000000000000002';

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

  // Stubs for backward compatibility
  userLocation: null;
  isLocating: boolean;
  locationError: null;
  onlyNearby: boolean;
  maxRadiusKm: number;
  isViewOnlyBranch: boolean;
  isBranchInDeliveryRange: (branch?: Branch | null) => boolean;

  setModalOpen: (open: boolean) => void;
  setTenant: (restaurantId: string, branchId: string) => Promise<void>;
  switchRestaurant: (restaurantId: string) => Promise<void>;
  switchBranch: (branchId: string) => Promise<void> | void;
  loadTenants: () => Promise<void>;
  requestUserLocation: () => Promise<void>;
  setManualLocation: () => void;
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
    name: 'Yogi Restaurant',
    slug: 'yogi',
    address: 'Station Road, Near Sardar Patel Ashram, Bardoli, Gujarat 394601, India',
    isActive: true,
  },
  currentBranch: {
    _id: initialBranchId,
    restaurantId: initialRestaurantId,
    name: 'Yogi Res (Bardoli)',
    slug: 'yogi-res',
    address: 'Station Road, Near Sardar Patel Ashram, Bardoli, Gujarat 394601, India',
    isActive: true,
  },
  availableRestaurants: [],
  availableBranches: [],
  allBranches: [],
  nearestBranch: null,
  isLoading: false,
  isModalOpen: false,

  userLocation: null,
  isLocating: false,
  locationError: null,
  onlyNearby: false,
  maxRadiusKm: 0,
  isViewOnlyBranch: false,

  isBranchInDeliveryRange: () => true,

  setOnlyNearby: () => {},
  setMaxRadiusKm: () => {},
  setManualLocation: () => {},
  requestUserLocation: async () => {},

  setModalOpen: (open: boolean) => set({ isModalOpen: open }),

  loadTenants: async () => {
    set({ isLoading: true });
    try {
      const [rRes, bRes] = await Promise.all([
        tenantsApi.getRestaurants({ includeInactive: true }).catch(() => ({ data: { data: [] } })),
        tenantsApi.getAllBranches({ includeInactive: true }).catch(() => ({ data: { data: [] } })),
      ]);

      const restaurants: Restaurant[] = Array.isArray(rRes?.data?.data)
        ? rRes.data.data
        : Array.isArray(rRes?.data)
        ? (rRes.data as any)
        : [];

      const allBranches: Branch[] = Array.isArray(bRes?.data?.data)
        ? bRes.data.data
        : Array.isArray(bRes?.data)
        ? (bRes.data as any)
        : [];

      const currentRestId = get().restaurantId || DEFAULT_RESTAURANT_ID;
      let targetRest: Restaurant | null = restaurants.find((r) => r._id === currentRestId) || null;

      // If current restaurant is not in active list, check if it exists (it might be paused/restricted)
      if (!targetRest && currentRestId) {
        try {
          const singleRestRes = await tenantsApi.getRestaurant(currentRestId).catch(() => null);
          const singleRest = singleRestRes?.data?.data as (Restaurant | undefined);
          if (singleRest && singleRest._id) {
            targetRest = singleRest;
          }
        } catch {}
      }

      if (!targetRest && restaurants.length > 0) {
        targetRest = restaurants[0];
      }

      if (!targetRest && restaurants.length === 0) {
        targetRest = {
          _id: DEFAULT_RESTAURANT_ID,
          name: 'Yogi Grand Restaurant & Lounge',
          slug: 'yogi-grand',
          isActive: true,
        };
      }

      let activeRestBranches = allBranches.filter(
        (b) => targetRest && String(b.restaurantId) === String(targetRest._id)
      );

      // If target restaurant has no branches in public list, fetch branches for this restaurant specifically
      if (activeRestBranches.length === 0 && targetRest?._id) {
        try {
          const bRestRes = await tenantsApi.getBranches(targetRest._id, { includeInactive: true }).catch(() => null);
          const bList = Array.isArray(bRestRes?.data?.data) ? bRestRes.data.data : [];
          if (bList.length > 0) {
            activeRestBranches = bList;
          }
        } catch {}
      }

      const currentBranchId = get().branchId || DEFAULT_BRANCH_ID;
      let targetBranch =
        activeRestBranches.find((b) => b._id === currentBranchId) ||
        activeRestBranches[0] ||
        null;

      if (!targetBranch && allBranches.length === 0) {
        targetBranch = {
          _id: DEFAULT_BRANCH_ID,
          restaurantId: targetRest?._id ?? DEFAULT_RESTAURANT_ID,
          name: 'Main Dining Hall (Bardoli)',
          slug: 'downtown-main',
          address: 'Station Road, Near Sardar Patel Ashram, Bardoli, Gujarat 394601, India',
          isActive: true,
        };
      }

      const restId = targetRest?._id ?? DEFAULT_RESTAURANT_ID;
      const brId = targetBranch?._id ?? DEFAULT_BRANCH_ID;

      localStorage.setItem('restaurantos-restaurant-id', restId);
      localStorage.setItem('restaurantos-branch-id', brId);

      const availableRestList: Restaurant[] = restaurants.length > 0 ? restaurants : (targetRest ? [targetRest] : []);

      set({
        restaurantId: restId,
        branchId: brId,
        currentRestaurant: targetRest,
        currentBranch: targetBranch,
        availableRestaurants: availableRestList,
        availableBranches: activeRestBranches.length > 0 ? activeRestBranches : allBranches,
        allBranches: allBranches.length > 0 ? allBranches : (targetBranch ? [targetBranch] : []),
        nearestBranch: allBranches[0] || targetBranch || null,
        isViewOnlyBranch: false,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  switchRestaurant: async (restaurantId: string) => {
    const storedToken = localStorage.getItem('restaurantos-token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload?.role && !['customer', 'owner', 'platformAdmin'].includes(payload.role)) {
          return;
        }
      } catch {}
    }

    set({ isLoading: true });
    try {
      let targetRest = get().availableRestaurants.find((r) => r._id === restaurantId) || null;
      if (!targetRest) {
        try {
          const rRes = await tenantsApi.getRestaurant(restaurantId).catch(() => null);
          targetRest = (rRes?.data?.data as Restaurant | undefined) || null;
        } catch {}
      }

      let branches = get().allBranches.filter((b) => String(b.restaurantId) === String(restaurantId));
      if (branches.length === 0) {
        const bRes = await tenantsApi.getBranches(restaurantId, { includeInactive: true }).catch(() => ({ data: { data: [] } }));
        branches = Array.isArray(bRes?.data?.data)
          ? bRes.data.data
          : Array.isArray(bRes?.data)
          ? (bRes.data as any)
          : [];
      }

      const targetBranch = branches[0] || null;
      const brId = targetBranch?._id || DEFAULT_BRANCH_ID;

      localStorage.setItem('restaurantos-restaurant-id', restaurantId);
      localStorage.setItem('restaurantos-branch-id', brId);

      const updatedAllBranches = [...get().allBranches];
      branches.forEach((b) => {
        if (!updatedAllBranches.some((existing) => existing._id === b._id)) {
          updatedAllBranches.push(b);
        }
      });

      const updatedAvailableRestaurants = [...get().availableRestaurants];
      if (targetRest && !updatedAvailableRestaurants.some((r) => r._id === targetRest?._id)) {
        updatedAvailableRestaurants.push(targetRest);
      }

      set({
        restaurantId,
        branchId: brId,
        currentRestaurant: targetRest,
        currentBranch: targetBranch,
        availableBranches: branches,
        allBranches: updatedAllBranches,
        availableRestaurants: updatedAvailableRestaurants,
        isViewOnlyBranch: false,
        isLoading: false,
      });

      useOrderSyncStore.getState().notifyResourceChange({
        type: 'update',
        resource: 'tenant',
        at: new Date().toISOString(),
      });

      window.dispatchEvent(new CustomEvent('restaurantos:tenant:change', { detail: { restaurantId, branchId: brId } }));
    } catch {
      set({ isLoading: false });
    }
  },

  switchBranch: async (branchId: string) => {
    const storedToken = localStorage.getItem('restaurantos-token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload?.role && !['customer', 'owner', 'platformAdmin', 'manager'].includes(payload.role)) {
          return;
        }
      } catch {}
    }

    let targetBranch =
      get().availableBranches.find((b) => b._id === branchId) ||
      get().allBranches.find((b) => b._id === branchId) ||
      null;

    if (!targetBranch) {
      try {
        const bRes = await tenantsApi.getBranch(branchId).catch(() => null);
        targetBranch = (bRes?.data?.data as Branch | undefined) || null;
      } catch {}
    }

    if (!targetBranch) return;

    localStorage.setItem('restaurantos-branch-id', branchId);

    const restId = String(targetBranch.restaurantId || get().restaurantId);
    localStorage.setItem('restaurantos-restaurant-id', restId);

    let targetRest = get().availableRestaurants.find((r) => r._id === restId) || get().currentRestaurant;
    if (!targetRest && restId) {
      try {
        const rRes = await tenantsApi.getRestaurant(restId).catch(() => null);
        targetRest = (rRes?.data?.data as Restaurant | undefined) || null;
      } catch {}
    }

    const updatedAllBranches = [...get().allBranches];
    if (!updatedAllBranches.some((b) => b._id === targetBranch?._id)) {
      updatedAllBranches.push(targetBranch);
    }

    set({
      restaurantId: restId,
      branchId,
      currentRestaurant: targetRest,
      currentBranch: targetBranch,
      allBranches: updatedAllBranches,
      isViewOnlyBranch: false,
    });

    useOrderSyncStore.getState().notifyResourceChange({
      type: 'update',
      resource: 'tenant',
      at: new Date().toISOString(),
    });

    window.dispatchEvent(
      new CustomEvent('restaurantos:tenant:change', {
        detail: { restaurantId: restId, branchId },
      })
    );
  },

  setTenant: async (restaurantId: string, branchId: string) => {
    localStorage.setItem('restaurantos-restaurant-id', restaurantId);
    localStorage.setItem('restaurantos-branch-id', branchId);
    set({ restaurantId, branchId });
    await get().loadTenants();
    useOrderSyncStore.getState().notifyResourceChange({
      type: 'update',
      resource: 'tenant',
      at: new Date().toISOString(),
    });
    window.dispatchEvent(new CustomEvent('restaurantos:tenant:change', { detail: { restaurantId, branchId } }));
  },
}));

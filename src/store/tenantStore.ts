import { create } from 'zustand';
import { tenantsApi } from '@/api/endpoints';
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
  isLoading: boolean;
  isModalOpen: boolean;

  setModalOpen: (open: boolean) => void;
  setTenant: (restaurantId: string, branchId: string) => Promise<void>;
  switchRestaurant: (restaurantId: string) => Promise<void>;
  switchBranch: (branchId: string) => void;
  loadTenants: () => Promise<void>;
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
    isActive: true,
  },
  currentBranch: {
    _id: initialBranchId,
    restaurantId: initialRestaurantId,
    name: 'Main Dining Hall (Downtown)',
    slug: 'downtown-main',
    address: '101 Culinary Blvd, City Center',
    isActive: true,
  },
  availableRestaurants: [],
  availableBranches: [],
  isLoading: false,
  isModalOpen: false,

  setModalOpen: (open: boolean) => set({ isModalOpen: open }),

  loadTenants: async () => {
    set({ isLoading: true });
    try {
      // 1. Load active restaurants
      const rRes = await tenantsApi.getRestaurants().catch(() => ({ data: { data: [] } }));
      const restaurants: Restaurant[] = Array.isArray(rRes?.data?.data)
        ? rRes.data.data
        : Array.isArray(rRes?.data)
        ? (rRes.data as any)
        : [];

      const currentRestId = get().restaurantId || DEFAULT_RESTAURANT_ID;
      let targetRest = restaurants.find((r) => r._id === currentRestId) || restaurants[0] || null;

      if (!targetRest && restaurants.length === 0) {
        targetRest = {
          _id: DEFAULT_RESTAURANT_ID,
          name: 'Yogi Grand Restaurant & Lounge',
          slug: 'yogi-grand',
          isActive: true,
        };
      }

      // 2. Load branches for active restaurant
      let branches: Branch[] = [];
      if (targetRest?._id) {
        const bRes = await tenantsApi.getBranches(targetRest._id).catch(() => ({ data: { data: [] } }));
        branches = Array.isArray(bRes?.data?.data)
          ? bRes.data.data
          : Array.isArray(bRes?.data)
          ? (bRes.data as any)
          : [];
      }

      const currentBranchId = get().branchId || DEFAULT_BRANCH_ID;
      let targetBranch = branches.find((b) => b._id === currentBranchId) || branches[0] || null;

      if (!targetBranch && branches.length === 0) {
        targetBranch = {
          _id: DEFAULT_BRANCH_ID,
          restaurantId: targetRest?._id ?? DEFAULT_RESTAURANT_ID,
          name: 'Main Dining Hall (Downtown)',
          slug: 'downtown-main',
          address: '101 Culinary Blvd, City Center',
          isActive: true,
        };
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
      const bRes = await tenantsApi.getBranches(restaurantId).catch(() => ({ data: { data: [] } }));
      const branches: Branch[] = Array.isArray(bRes?.data?.data)
        ? bRes.data.data
        : Array.isArray(bRes?.data)
        ? (bRes.data as any)
        : [];

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

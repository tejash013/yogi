import { create } from 'zustand';
import { authApi } from '@/api/endpoints';
import { useOrderSyncStore } from '@/store/orderSyncStore';
import { useTenantStore, DEFAULT_RESTAURANT_ID, DEFAULT_BRANCH_ID } from '@/store/tenantStore';
import { socketService } from '@/services/socket';
import type { User, UserRole, LoginCredentials, RegisterData } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

function readTokenPayload(token: string): Partial<User> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function normalizeUser(user: (Partial<User> & { _id?: string }) | null | undefined): User | null {
  if (!user) return null;

  const normalizedId = user.id ?? user._id;
  if (!normalizedId) return null;

  return {
    ...user,
    id: String(normalizedId),
  } as User;
}

const supportedRoles: UserRole[] = ['customer', 'cashier', 'chef', 'manager', 'owner', 'platformAdmin'];
const storedToken = localStorage.getItem('restaurantos-token');
const storedPayload = storedToken ? readTokenPayload(storedToken) : null;
const normalizedStoredUser = normalizeUser(storedPayload as (Partial<User> & { _id?: string }) | null);
const hasValidStoredSession = Boolean(
  storedToken &&
    normalizedStoredUser?.id &&
    typeof normalizedStoredUser.role === 'string' &&
    supportedRoles.includes(normalizedStoredUser.role as UserRole)
);

// If stored session belongs to staff (non-customer), lock to their assigned tenant
if (hasValidStoredSession && normalizedStoredUser && normalizedStoredUser.role !== 'customer') {
  const targetRestId = normalizedStoredUser.restaurantId || DEFAULT_RESTAURANT_ID;
  const targetBranchId = normalizedStoredUser.branchId || DEFAULT_BRANCH_ID;
  void useTenantStore.getState().setTenant(targetRestId, targetBranchId);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: normalizedStoredUser,
  token: storedToken,
  isAuthenticated: hasValidStoredSession,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      localStorage.removeItem('restaurantos-token');
      if (!credentials.email || !credentials.password) {
        throw new Error('Please enter email and password');
      }

      const response = await authApi.login(credentials);
      const { user, token } = response.data.data;
      const normalizedUser = normalizeUser(user as (Partial<User> & { _id?: string }) | null);

      if (!normalizedUser) {
        throw new Error('Session user is invalid. Please log in again.');
      }

      localStorage.setItem('restaurantos-token', token);

      // Lock tenant context for staff (non-customer) roles
      if (normalizedUser.role !== 'customer') {
        const targetRestId = normalizedUser.restaurantId || DEFAULT_RESTAURANT_ID;
        const targetBranchId = normalizedUser.branchId || DEFAULT_BRANCH_ID;
        void useTenantStore.getState().setTenant(targetRestId, targetBranchId);
      }

      set({
        user: normalizedUser,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      useOrderSyncStore.getState().notifyOrderChange({
        type: 'update',
        orderId: 'auth-session',
        status: 'pending',
        at: new Date().toISOString(),
      });
    } catch (error) {
      const apiMessage =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as any).response?.data?.message
          : undefined;
      const message = apiMessage || (error instanceof Error ? error.message : 'Login failed. Please try again.');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      localStorage.removeItem('restaurantos-token');
      if (!data.firstName || !data.lastName || !data.email || !data.password || !data.confirmPassword) {
        throw new Error('Please fill in all required fields');
      }
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const response = await authApi.register(data);
      const { user, token } = response.data.data;
      const normalizedUser = normalizeUser(user as (Partial<User> & { _id?: string }) | null);

      if (!normalizedUser) {
        throw new Error('Session user is invalid. Please try again.');
      }

      localStorage.setItem('restaurantos-token', token);

      set({
        user: normalizedUser,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      useOrderSyncStore.getState().notifyOrderChange({
        type: 'update',
        orderId: 'auth-session',
        status: 'pending',
        at: new Date().toISOString(),
      });
    } catch (error) {
      const apiMessage =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as any).response?.data?.message
          : undefined;
      const message = apiMessage || (error instanceof Error ? error.message : 'Registration failed. Please try again.');

      set({ isLoading: false, error: message });
    }
  },

  loginWithGoogle: async (credential: string) => {
    set({ isLoading: true, error: null });
    try {
      localStorage.removeItem('restaurantos-token');
      if (!credential) {
        throw new Error('Google credential token is missing');
      }

      const response = await authApi.googleLogin(credential);
      const { user, token } = response.data.data;
      const normalizedUser = normalizeUser(user as (Partial<User> & { _id?: string }) | null);

      if (!normalizedUser) {
        throw new Error('Session user is invalid. Please try again.');
      }

      localStorage.setItem('restaurantos-token', token);

      // Lock tenant context for staff (non-customer) roles
      if (normalizedUser.role !== 'customer') {
        const targetRestId = normalizedUser.restaurantId || DEFAULT_RESTAURANT_ID;
        const targetBranchId = normalizedUser.branchId || DEFAULT_BRANCH_ID;
        void useTenantStore.getState().setTenant(targetRestId, targetBranchId);
      }

      set({
        user: normalizedUser,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      useOrderSyncStore.getState().notifyOrderChange({
        type: 'update',
        orderId: 'auth-session',
        status: 'pending',
        at: new Date().toISOString(),
      });
    } catch (error) {
      const apiMessage =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as any).response?.data?.message
          : undefined;
      const message = apiMessage || (error instanceof Error ? error.message : 'Google authentication failed.');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      throw new Error(message);
    }
  },

  logout: () => {
    void authApi.logout().catch(() => undefined);
    localStorage.removeItem('restaurantos-token');
    socketService.disconnect();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
    useOrderSyncStore.getState().notifyResourceChange({
      type: 'delete',
      resource: 'auth',
      at: new Date().toISOString(),
    });
  },

  setUser: (user: User) => {
    const normalizedUser = normalizeUser(user as (Partial<User> & { _id?: string }) | null);
    set({ user: normalizedUser, isAuthenticated: !!normalizedUser });
  },

  clearError: () => {
    set({ error: null });
  },
}));

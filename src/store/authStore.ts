import { create } from 'zustand';
import { authApi } from '@/api/endpoints';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
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

const storedToken = localStorage.getItem('restaurantos-token');
const storedPayload = storedToken ? readTokenPayload(storedToken) : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: storedPayload?.id ? storedPayload as User : null,
  token: storedToken,
  refreshToken: localStorage.getItem('restaurantos-refresh-token'),
  isAuthenticated: Boolean(storedToken && storedPayload?.id),
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      localStorage.removeItem('restaurantos-token');
      localStorage.removeItem('restaurantos-refresh-token');
      if (!credentials.email || !credentials.password) {
        throw new Error('Please enter email and password');
      }

      const response = await authApi.login(credentials);
      const { user, token, refreshToken } = response.data.data;

      localStorage.setItem('restaurantos-token', token);
      localStorage.setItem('restaurantos-refresh-token', refreshToken);

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const apiMessage =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as any).response?.data?.message
          : undefined;
      const message = apiMessage || (error instanceof Error ? error.message : 'Login failed. Please try again.');

      set({
        isLoading: false,
        error: message,
      });
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      localStorage.removeItem('restaurantos-token');
      localStorage.removeItem('restaurantos-refresh-token');
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
      const { user, token, refreshToken } = response.data.data;

      localStorage.setItem('restaurantos-token', token);
      localStorage.setItem('restaurantos-refresh-token', refreshToken);

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
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

  logout: () => {
    localStorage.removeItem('restaurantos-token');
    localStorage.removeItem('restaurantos-refresh-token');
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  clearError: () => {
    set({ error: null });
  },
}));

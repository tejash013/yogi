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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
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
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed. Please try again.',
      });
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
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
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      });
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

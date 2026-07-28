import { create } from 'zustand';
import type { User, LoginCredentials, RegisterData } from '@/types';

// Demo user for simulation
const demoUser: User = {
  id: 'usr-001',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1-555-0101',
  role: 'customer',
  avatar: '',
  createdAt: '2025-01-10T08:00:00Z',
  updatedAt: '2025-03-15T12:00:00Z',
};

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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Simple validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Please enter email and password');
      }

      // Simulate successful login with demo user
      const mockToken = 'demo-token-' + Date.now();
      set({
        user: demoUser,
        token: mockToken,
        refreshToken: mockToken + '-refresh',
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!data.firstName || !data.email || !data.password) {
        throw new Error('Please fill in all required fields');
      }
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Registration success (navigates to OTP verification afterward)
      set({ isLoading: false, error: null });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  },

  logout: () => {
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

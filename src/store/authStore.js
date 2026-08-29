import { create } from 'zustand';
import { authApi } from '@/api/endpoints';

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (credentials) => {
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
        }
        catch (error) {
            const apiMessage =
                error && typeof error === 'object' && 'response' in error
                    ? error.response?.data?.message
                    : undefined;
            const message = apiMessage || (error instanceof Error ? error.message : 'Login failed. Please try again.');

            set({
                isLoading: false,
                error: message,
            });
        }
    },

    register: async (data) => {
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
        }
        catch (error) {
            const apiMessage =
                error && typeof error === 'object' && 'response' in error
                    ? error.response?.data?.message
                    : undefined;
            const message = apiMessage || (error instanceof Error ? error.message : 'Registration failed');

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

    setUser: (user) => {
        set({ user, isAuthenticated: true });
    },

    clearError: () => {
        set({ error: null });
    },
}));

import { create } from 'zustand';
// Demo user for simulation
const demoUser = {
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
        }
        catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed. Please try again.',
            });
        }
    },
    register: async (data) => {
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
        }
        catch (error) {
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
    setUser: (user) => {
        set({ user, isAuthenticated: true });
    },
    clearError: () => {
        set({ error: null });
    },
}));

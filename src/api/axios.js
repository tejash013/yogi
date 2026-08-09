import axios, {} from 'axios';
import config from '@/config';
const apiClient = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});
// Request interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('restaurantos-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Response interceptor
apiClient.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            const refreshToken = localStorage.getItem('restaurantos-refresh-token');
            if (refreshToken) {
                const response = await axios.post(`${config.api.baseUrl}/api/auth/refresh`, { refreshToken });
                const { token } = response.data;
                localStorage.setItem('restaurantos-token', token);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
            }
        }
        catch {
            // Refresh token failed, clear auth
            localStorage.removeItem('restaurantos-token');
            localStorage.removeItem('restaurantos-refresh-token');
            window.location.href = '/auth/login';
        }
    }
    return Promise.reject(error);
});
export default apiClient;

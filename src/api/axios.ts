import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import config from '@/config';

function readTokenPayload(token: string): { restaurantId?: string; branchId?: string } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function isPublicAuthRequest(url?: string) {
  return Boolean(url && /^\/api\/auth\/(login|register|refresh|forgot-password|reset-password|verify-otp)$/.test(url));
}

function redirectToLoginIfNeeded() {
  const isAuthPage = /^\/auth(?:\/|$)/.test(window.location.pathname);
  if (!isAuthPage) {
    window.location.href = '/auth/login';
  }
}

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('restaurantos-token');
    if (token && !isPublicAuthRequest(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;

      const payload = readTokenPayload(token);
      if (payload?.restaurantId) {
        config.headers['x-restaurant-id'] = payload.restaurantId;
      }
      if (payload?.branchId) {
        config.headers['x-branch-id'] = payload.branchId;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 429) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isPublicAuthRequest(originalRequest.url)) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('restaurantos-refresh-token');
        if (refreshToken) {
          const response = await axios.post(
            `${config.api.baseUrl}/api/auth/refresh`,
            { refreshToken }
          );
          const { token, refreshToken: nextRefreshToken } = response.data.data;
          localStorage.setItem('restaurantos-token', token);
          if (nextRefreshToken) localStorage.setItem('restaurantos-refresh-token', nextRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh token failed, clear auth
        localStorage.removeItem('restaurantos-token');
        localStorage.removeItem('restaurantos-refresh-token');
        redirectToLoginIfNeeded();
      }
      localStorage.removeItem('restaurantos-token');
      localStorage.removeItem('restaurantos-refresh-token');
      redirectToLoginIfNeeded();
    }

    return Promise.reject(error);
  }
);

export default apiClient;


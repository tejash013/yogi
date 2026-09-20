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
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function isPublicAuthRequest(url?: string) {
  return Boolean(url && /^\/api\/auth\/(login|register|refresh|forgot-password|reset-password|verify-otp)$/.test(url));
}

function isPublicCatalogRequest(url?: string): boolean {
  if (!url) return false;
  return Boolean(/^\/api\/(menu|categories|tables|tenants|offers|reviews)/.test(url));
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (decoded.exp && typeof decoded.exp === 'number') {
      return decoded.exp * 1000 < Date.now() + 10000;
    }
    return false;
  } catch {
    return true;
  }
}

function redirectToLoginIfNeeded() {
  const pathname = window.location.pathname;
  const isAuthPage = /^\/auth(?:\/|$)/.test(pathname);
  const isPublicCustomerRoute =
    pathname === '/' ||
    pathname.startsWith('/menu') ||
    pathname.startsWith('/table') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/order-success');

  if (!isAuthPage && !isPublicCustomerRoute) {
    window.location.href = '/auth/login';
  }
}

let refreshPromise: Promise<string> | null = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${config.api.baseUrl}/api/auth/refresh`, {}, { withCredentials: true })
      .then((response) => {
        const token = response.data.data.token as string;
        localStorage.setItem('restaurantos-token', token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('restaurantos-token');
    let payload = null;

    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('restaurantos-token');
      } else {
        payload = readTokenPayload(token);
        if (!isPublicAuthRequest(config.url)) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    // Always attach active SaaS Tenant Context (Restaurant ID & Branch ID)
    const activeRestaurantId =
      localStorage.getItem('restaurantos-restaurant-id') ||
      payload?.restaurantId ||
      '000000000000000000000001';
    const activeBranchId =
      localStorage.getItem('restaurantos-branch-id') ||
      payload?.branchId ||
      '000000000000000000000002';

    if (activeRestaurantId) {
      config.headers['x-restaurant-id'] = activeRestaurantId;
    }
    if (activeBranchId) {
      config.headers['x-branch-id'] = activeBranchId;
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

      // For public catalog requests (menu, categories, tables, tenants, etc.), clear invalid token and retry as guest
      if (isPublicCatalogRequest(originalRequest.url)) {
        localStorage.removeItem('restaurantos-token');
        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }
        return apiClient(originalRequest);
      }

      try {
        const token = await refreshAccessToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch {
        // Refresh token failed, clear auth
        localStorage.removeItem('restaurantos-token');
        redirectToLoginIfNeeded();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;


import axios from 'axios';
import API_BASE_URL from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies (refresh token)
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add hospital ID header if available
    const hospitalId = localStorage.getItem('hospitalId');
    if (hospitalId) {
      config.headers['x-hospital-id'] = hospitalId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh token for login and auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/refresh') ||
                          originalRequest.url?.includes('/auth/logout');

    // If error is 401 and we haven't tried to refresh yet, and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
          withCredentials: true,
        });

        if (response.data.status === 1 && response.data.accessToken) {
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('hospitalId');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;


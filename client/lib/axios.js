import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true,
});

// We no longer need the request interceptor for token since it's HttpOnly cookie

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is 401, we haven't already retried, and it's not the refresh endpoint itself
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token
        await api.post('/auth/refresh');
        
        // If refresh was successful, simply retry the original request (cookies are automatically attached)
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g., refresh token expired) - logout
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          import('@/store/authStore').then(({ default: useAuthStore }) => {
            useAuthStore.getState().logout();
          });
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
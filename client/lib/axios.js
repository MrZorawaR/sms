import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Prevent infinite redirect if already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Use dynamic import to avoid circular dependency
        import('@/store/authStore').then(({ default: useAuthStore }) => {
          useAuthStore.getState().logout();
        });
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
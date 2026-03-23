import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: (userData) => {
    set({
      user: userData,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    try {
      const { default: api } = await import('@/lib/axios');
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API execution error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  initializeAuth: async () => {
    // Dynamic import to avoid circular dependency
    const { default: api } = await import('@/lib/axios');
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
        });
      } else {
        get().logout();
      }
    } catch (error) {
      console.error('Error fetching user on init:', error);
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
import { create } from 'zustand';
import api from '@/lib/axios';

const useClassStore = create((set, get) => ({
  classes: [],
  loading: false,
  error: null,

  // Fetch all classes
  fetchClasses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/classes');
      set({ classes: response.data, loading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch classes';
      set({ error: errorMessage, loading: false });
      console.error('Fetch classes error:', error);
    }
  },

  // Add a new class
  addClass: async (classData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/admin/classes', classData);
      // Refresh the class list after adding
      await get().fetchClasses();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add class';
      set({ error: errorMessage, loading: false });
      console.error('Add class error:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Update an existing class
  updateClass: async (classId, classData) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/classes/${classId}`, classData);
      // Refresh the class list after updating
      await get().fetchClasses();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update class';
      set({ error: errorMessage, loading: false });
      console.error('Update class error:', error);
      return { success: false, error: errorMessage };
    }
  },

  assignTeacher: async (classId, teacherId) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/assign-teacher-to-class`, { classId, teacherId });
      await get().fetchClasses();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to assign teacher';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  assignSubject: async (classId, subjectId) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/assign-subject-to-class`, { classId, subjectId });
      await get().fetchClasses();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to assign subject';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },
}));

export default useClassStore;

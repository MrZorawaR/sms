import { create } from 'zustand';
import api from '@/lib/axios';

const useMarksStore = create((set) => ({
  loading: false,
  error: null,
  marksRecords: [],

  submitMarks: async (payload) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/teacher/marks`, payload);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit marks';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchMarks: async (classId, subjectId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/teacher/marks?classId=${classId}&subjectId=${subjectId}`);
      set({ marksRecords: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch marks', loading: false });
      return [];
    }
  }
}));

export default useMarksStore;

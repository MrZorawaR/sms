import { create } from 'zustand';
import api from '@/lib/axios';

const useSubjectStore = create((set, get) => ({
  subjects: [],
  loading: false,
  error: null,

  fetchSubjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/subjects');
      set({ subjects: response.data, loading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch subjects';
      set({ error: errorMessage, loading: false });
    }
  },

  addSubject: async (subjectData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/admin/subjects', subjectData);
      await get().fetchSubjects();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add subject';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateSubject: async (subjectId, subjectData) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/subjects/${subjectId}`, subjectData);
      await get().fetchSubjects();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update subject';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },
  
  deleteSubject: async (subjectId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/subjects/${subjectId}`);
      set(state => ({
        subjects: state.subjects.filter(s => s._id !== subjectId),
        loading: false
      }));
      return { success: true };
    } catch(error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete subject';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }
}));

export default useSubjectStore;

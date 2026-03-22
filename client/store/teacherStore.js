import { create } from 'zustand';
import api from '@/lib/axios';

const useTeacherStore = create((set, get) => ({
  teachers: [],
  loading: false,
  error: null,

  // Fetch all teachers
  fetchTeachers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/teachers');
      set({ teachers: response.data, loading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch teachers';
      set({ error: errorMessage, loading: false });
      console.error('Fetch teachers error:', error);
    }
  },

  // Add a new teacher
  addTeacher: async (teacherData) => {
    set({ loading: true, error: null });
    try {
      const payload = {
        username: teacherData.username,
        password: teacherData.password,
        role: 'teacher',
        profileData: {
          name: teacherData.name,
          employeeId: teacherData.employeeId,
          email: teacherData.email,
          phone: teacherData.phone,
          department: teacherData.department,
        },
      };
      await api.post('/admin/register', payload);
      await get().fetchTeachers();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add teacher';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update an existing teacher
  updateTeacher: async (teacherId, profileData) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/teachers/${teacherId}`, profileData);
      await get().fetchTeachers();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update teacher';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },
  
  // Delete a teacher
  deleteTeacher: async (teacherId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/teachers/${teacherId}`);
      set(state => ({
        teachers: state.teachers.filter(t => t._id !== teacherId),
        loading: false
      }));
      return { success: true };
    } catch(error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete teacher';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }
}));

export default useTeacherStore;

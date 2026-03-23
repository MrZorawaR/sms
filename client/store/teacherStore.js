import { create } from 'zustand';
import api from '@/lib/axios';
import { toast } from 'sonner';

const useTeacherStore = create((set, get) => ({
  teachers: [],
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  loading: false,
  error: null,

  // Fetch all teachers
  fetchTeachers: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/admin/teachers?page=${page}&limit=${limit}`);
      set({ 
        teachers: response.data.data,
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        totalRecords: response.data.total,
        loading: false 
      });
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
      toast.success('Teacher added successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add teacher';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update an existing teacher
  updateTeacher: async (teacherId, profileData) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/teachers/${teacherId}`, profileData);
      await get().fetchTeachers();
      toast.success('Teacher updated successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update teacher';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
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
      toast.success('Teacher deleted successfully!');
      return { success: true };
    } catch(error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete teacher';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}));

export default useTeacherStore;

import { create } from 'zustand';
import api from '@/lib/axios';
import { toast } from 'sonner';

const useStudentStore = create((set, get) => ({
  students: [],
  classes: [],
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  loading: false,
  error: null,

  // Fetch all students
  fetchStudents: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/admin/students?page=${page}&limit=${limit}`);
      set({ 
        students: response.data.data, 
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        totalRecords: response.data.total,
        loading: false 
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch students';
      set({ error: errorMessage, loading: false });
      console.error('Fetch students error:', error);
    }
  },

  // Fetch all classes (for the form dropdown)
  fetchClasses: async () => {
    try {
      const response = await api.get('/admin/classes?limit=1000');
      set({ classes: response.data.data });
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  },

  // Add a new student
  addStudent: async (studentData) => {
    set({ loading: true, error: null });
    try {
      // The backend expects profileData and user credentials nested
      const payload = {
        username: studentData.username,
        password: studentData.password,
        role: 'student',
        profileData: {
          name: studentData.name,
          rollNumber: studentData.rollNumber,
          email: studentData.email,
          phone: studentData.phone,
          class: studentData.class,
        },
      };
      await api.post('/admin/register', payload);
      // Refresh the student list after adding
      await get().fetchStudents();
      toast.success('Student added successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add student';
      set({ error: errorMessage, loading: false });
      console.error('Add student error:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update an existing student
  updateStudent: async (studentId, studentData) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/students/${studentId}`, studentData);
      // Refresh the student list after updating
      await get().fetchStudents();
      toast.success('Student updated successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update student';
      set({ error: errorMessage, loading: false });
      console.error('Update student error:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
  
  // Delete a student
  deleteStudent: async (studentId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/students/${studentId}`);
      // Update state by removing the deleted student, more efficient than refetching
      set(state => ({
        students: state.students.filter(s => s._id !== studentId),
        loading: false
      }));
       toast.success('Student deleted successfully!');
       return { success: true };
    } catch(error) {
       const errorMessage = error.response?.data?.message || 'Failed to delete student';
       set({ error: errorMessage, loading: false });
       console.error('Delete student error:', error);
       toast.error(errorMessage);
       return { success: false, error: errorMessage };
    }
  }
}));

export default useStudentStore;

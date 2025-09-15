import { create } from 'zustand';
import api from '@/lib/axios';

const useStudentStore = create((set, get) => ({
  students: [],
  classes: [],
  loading: false,
  error: null,

  // Fetch all students
  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/students');
      set({ students: response.data, loading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch students';
      set({ error: errorMessage, loading: false });
      console.error('Fetch students error:', error);
    }
  },

  // Fetch all classes (for the form dropdown)
  fetchClasses: async () => {
    try {
      const response = await api.get('/admin/classes');
      set({ classes: response.data });
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
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add student';
      set({ error: errorMessage, loading: false });
      console.error('Add student error:', error);
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
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update student';
      set({ error: errorMessage, loading: false });
      console.error('Update student error:', error);
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
       return { success: true };
    } catch(error) {
       const errorMessage = error.response?.data?.message || 'Failed to delete student';
       set({ error: errorMessage, loading: false });
       console.error('Delete student error:', error);
       return { success: false, error: errorMessage };
    }
  }
}));

export default useStudentStore;

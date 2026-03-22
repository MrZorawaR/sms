import { create } from 'zustand';
import api from '@/lib/axios';

const useAttendanceStore = create((set) => ({
  loading: false,
  error: null,
  attendanceRecords: [],
  students: [],

  fetchClassStudents: async (classId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/teacher/classes/${classId}/students`);
      set({ students: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch students', loading: false });
      return [];
    }
  },

  markAttendance: async (payload) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/teacher/attendance`, payload);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchAttendanceByDate: async (classId, date) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/teacher/attendance?classId=${classId}&date=${date}`);
      set({ attendanceRecords: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch attendance', loading: false });
      return [];
    }
  }
}));

export default useAttendanceStore;

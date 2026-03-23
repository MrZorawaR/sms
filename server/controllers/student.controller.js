const studentService = require('../services/student.service');

const getProfile = async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const profile = await studentService.getProfile(studentId);
    res.json(profile);
  } catch (error) {
    console.error('Get student profile error:', error);
    if (error.message === 'Student not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const attendance = await studentService.getAttendance(studentId);
    res.json(attendance);
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendanceCalendar = async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const calendarData = await studentService.getAttendanceCalendar(studentId);
    res.json(calendarData);
  } catch (error) {
    console.error('Get attendance calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMarks = async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const marks = await studentService.getMarks(studentId);
    res.json(marks);
  } catch (error) {
    console.error('Get student marks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const summary = await studentService.getAttendanceSummary(studentId);
    res.json(summary);
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getReport = async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const report = await studentService.getReport(studentId);
    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  getAttendance,
  getAttendanceCalendar,
  getMarks,
  getAttendanceSummary,
  getReport
};

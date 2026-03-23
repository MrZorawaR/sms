const teacherService = require('../services/teacher.service');

const getClasses = async (req, res) => {
  try {
    const teacherId = req.user.profile._id;
    const classes = await teacherService.getClasses(teacherId);
    res.json(classes);
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentsInClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const students = await teacherService.getStudentsInClass(classId);
    res.json(students);
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitAttendance = async (req, res) => {
  try {
    const { classId, date, attendanceData } = req.body;
    await teacherService.submitAttendance(classId, date, attendanceData);
    res.json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    console.error('Submit attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { classId, date } = req.params;
    const attendance = await teacherService.getAttendance(classId, date);
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    await teacherService.updateAttendance(studentId, date, status);
    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Update attendance error:', error);
    if (error.message.includes('not found') || error.message.includes('same day')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const enterOrUpdateMarks = async (req, res) => {
  try {
    const { studentId, subjectId, examType, score, totalMarks = 100 } = req.body;
    await teacherService.enterOrUpdateMarks(studentId, subjectId, examType, score, totalMarks);
    res.json({ message: 'Marks updated successfully' });
  } catch (error) {
    console.error('Update marks error:', error);
    if (error.message.includes('exceed total marks') || error.message.includes('not found')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const getMarks = async (req, res) => {
  try {
    const { classId, subjectId } = req.params;
    const marksData = await teacherService.getMarks(classId, subjectId);
    res.json(marksData);
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getClasses,
  getStudentsInClass,
  submitAttendance,
  getAttendance,
  updateAttendance,
  enterOrUpdateMarks,
  getMarks
};

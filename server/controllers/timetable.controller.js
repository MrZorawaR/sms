const timetableService = require('../services/timetable.service');

const upsertDayTimetable = async (req, res) => {
  try {
    const { classId, dayOfWeek, periods } = req.body;
    const timetable = await timetableService.upsertDayTimetable(classId, dayOfWeek, periods);
    res.json(timetable);
  } catch (error) {
    console.error('Upsert timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getClassTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const timetable = await timetableService.getClassTimetable(classId);
    res.json(timetable);
  } catch (error) {
    console.error('Get class timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeacherTimetable = async (req, res) => {
  try {
    const teacherId = req.user.profile._id;
    const timetable = await timetableService.getTeacherTimetable(teacherId);
    res.json(timetable);
  } catch (error) {
    console.error('Get teacher timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentTimetable = async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const timetable = await timetableService.getStudentTimetable(studentId);
    res.json(timetable);
  } catch (error) {
    console.error('Get student timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  upsertDayTimetable,
  getClassTimetable,
  getTeacherTimetable,
  getStudentTimetable
};

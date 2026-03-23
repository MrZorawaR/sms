const Timetable = require('../models/Timetable');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

class TimetableService {
  async upsertDayTimetable(classId, dayOfWeek, periods) {
    return await Timetable.findOneAndUpdate(
      { classId, dayOfWeek },
      { periods },
      { upsert: true, new: true }
    ).populate('periods.subjectId', 'name')
     .populate('periods.teacherId', 'name');
  }

  async getClassTimetable(classId) {
    return await Timetable.find({ classId })
      .populate('periods.subjectId', 'name')
      .populate('periods.teacherId', 'name');
  }

  async getTeacherTimetable(teacherId) {
    return await Timetable.find({ 'periods.teacherId': teacherId })
      .populate('classId', 'name section')
      .populate('periods.subjectId', 'name');
  }

  async getStudentTimetable(studentId) {
    const student = await Student.findById(studentId);
    if (!student || !student.class) throw new Error("Student class not found");

    return await Timetable.find({ classId: student.class })
      .populate('periods.subjectId', 'name')
      .populate('periods.teacherId', 'name');
  }
}

module.exports = new TimetableService();

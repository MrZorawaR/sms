const Student = require('../models/Student');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');

class TeacherService {
  async getClasses(teacherId) {
    return await Class.find({ teacher: teacherId })
      .populate('subjects', 'name code')
      .populate('students', 'name rollNumber email');
  }

  async getStudentsInClass(classId) {
    return await Student.find({ class: classId }).sort({ rollNumber: 1 });
  }

  async submitAttendance(classId, date, attendanceData) {
    const targetDate = new Date(date);
    
    for (const attendance of attendanceData) {
      // Upsert attendance using studentId and targetDate
      await Attendance.findOneAndUpdate(
        { studentId: attendance.studentId, date: {
            $gte: new Date(targetDate.setHours(0,0,0,0)),
            $lt: new Date(targetDate.setHours(23,59,59,999))
        }},
        { 
          studentId: attendance.studentId,
          classId: classId,
          date: targetDate,
          status: attendance.status
        },
        { upsert: true, new: true }
      );
    }
  }

  async getAttendance(classId, date) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0,0,0,0));
    const endOfDay = new Date(targetDate.setHours(23,59,59,999));

    const students = await Student.find({ class: classId });
    const attendanceRecords = await Attendance.find({
      classId: classId,
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    const attendanceMap = new Map();
    attendanceRecords.forEach(att => attendanceMap.set(att.studentId.toString(), att));

    return students.map(student => {
      const record = attendanceMap.get(student._id.toString());
      return {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        status: record ? record.status : null
      };
    });
  }

  async updateAttendance(studentId, date, status) {
    const targetDate = new Date(date);
    const today = new Date();

    if (targetDate.toDateString() !== today.toDateString()) {
      throw new Error('Attendance can only be updated on the same day.');
    }

    const startOfDay = new Date(targetDate.setHours(0,0,0,0));
    const endOfDay = new Date(targetDate.setHours(23,59,59,999));

    const record = await Attendance.findOne({
      studentId,
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    if (!record) {
      throw new Error('Attendance record for today not found.');
    }

    record.status = status;
    await record.save();
  }

  async enterOrUpdateMarks(studentId, subjectId, examType, score, totalMarks) {
    if (score > totalMarks) {
      throw new Error(`Score (${score}) cannot exceed total marks (${totalMarks})`);
    }

    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    await Marks.findOneAndUpdate(
      { studentId, subjectId, examType },
      {
        studentId,
        subjectId,
        examType,
        score,
        totalMarks,
        date: new Date()
      },
      { upsert: true, new: true }
    );
  }

  async getMarks(classId, subjectId) {
    const students = await Student.find({ class: classId });
    const studentIds = students.map(s => s._id);

    const marksRecords = await Marks.find({
      studentId: { $in: studentIds },
      subjectId: subjectId
    }).populate('subjectId', 'name code');

    return students.map(student => {
      const studentMarks = marksRecords.filter(m => m.studentId.toString() === student._id.toString());
      return {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        marks: studentMarks.map(m => ({
          subject: m.subjectId,
          examType: m.examType,
          score: m.score,
          totalMarks: m.totalMarks,
          date: m.date
        }))
      };
    });
  }
}

module.exports = new TeacherService();

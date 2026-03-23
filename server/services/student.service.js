const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');

class StudentService {
  async getProfile(studentId) {
    const student = await Student.findById(studentId).populate('class', 'name section academicYear');
    if (!student) {
      throw new Error('Student not found');
    }
    return student;
  }

  async getAttendance(studentId) {
    const attendance = await Attendance.find({ studentId }).sort({ date: -1 });
    return attendance;
  }

  async getAttendanceCalendar(studentId) {
    const records = await Attendance.find({ studentId }).sort({ date: 1 });
    return records.map(r => ({
      date: r.date.toISOString().split('T')[0],
      status: r.status
    }));
  }

  async getMarks(studentId) {
    const marks = await Marks.find({ studentId }).populate('subjectId', 'name code');
    
    // Group marks by subject to maintain compatibility with existing API response format
    const marksGrouped = {};
    marks.forEach(mark => {
      if (!mark.subjectId) return; // safeguard
      const subjectName = mark.subjectId.name;
      if (!marksGrouped[subjectName]) {
        marksGrouped[subjectName] = [];
      }
      marksGrouped[subjectName].push({
        examType: mark.examType,
        score: mark.score,
        totalMarks: mark.totalMarks,
        percentage: ((mark.score / mark.totalMarks) * 100).toFixed(2),
        date: mark.date
      });
    });

    return marksGrouped;
  }

  async getAttendanceSummary(studentId) {
    const attendance = await Attendance.find({ studentId });
    
    let present = 0;
    let absent = 0;
    const total = attendance.length;

    attendance.forEach(record => {
      if (record.status === 'Present') {
        present++;
      } else {
        absent++;
      }
    });

    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    return {
      present,
      absent,
      total,
      percentage: parseFloat(percentage)
    };
  }

  calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  async getReport(studentId) {
    const student = await Student.findById(studentId).populate('class', 'name section academicYear');
    if (!student) throw new Error('Student not found');
    
    const marks = await Marks.find({ studentId }).populate('subjectId', 'name code');
    
    let totalScore = 0;
    let totalMaxMarks = 0;
    
    const subjectMarksMap = {};
    marks.forEach(mark => {
      if (!mark.subjectId) return;
      if (!subjectMarksMap[mark.subjectId._id]) {
        subjectMarksMap[mark.subjectId._id] = {
           subject: mark.subjectId.name,
           code: mark.subjectId.code,
           totalObtained: 0,
           totalMax: 0
        };
      }
      subjectMarksMap[mark.subjectId._id].totalObtained += mark.score;
      subjectMarksMap[mark.subjectId._id].totalMax += mark.totalMarks;
      totalScore += mark.score;
      totalMaxMarks += mark.totalMarks;
    });

    const subjectsArray = Object.values(subjectMarksMap).map(sub => ({
      ...sub,
      percentage: ((sub.totalObtained / sub.totalMax) * 100).toFixed(2),
      grade: this.calculateGrade((sub.totalObtained / sub.totalMax) * 100)
    }));

    const overallPercentage = totalMaxMarks > 0 ? ((totalScore / totalMaxMarks) * 100) : 0;
    const overallGrade = this.calculateGrade(overallPercentage);

    return {
      studentDetails: {
        name: student.name,
        rollNumber: student.rollNumber,
        className: student.class ? `${student.class.name} - ${student.class.section}` : 'N/A',
        academicYear: student.class?.academicYear || 'N/A'
      },
      subjects: subjectsArray,
      summary: {
        totalScore,
        totalMaxMarks,
        percentage: overallPercentage.toFixed(2),
        grade: overallGrade
      }
    };
  }
}

module.exports = new StudentService();

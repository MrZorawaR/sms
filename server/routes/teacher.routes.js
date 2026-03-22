const express = require('express');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { auth, teacherAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply teacher authentication to all routes
router.use(auth, teacherAuth);

// Get teacher's assigned classes
router.get('/classes', async (req, res) => {
  try {
    const teacherId = req.user.profile._id;
    const classes = await Class.find({ teacher: teacherId })
      .populate('subjects', 'name code')
      .populate('students', 'name rollNumber email');
    
    res.json(classes);
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students in a specific class
router.get('/classes/:classId/students', async (req, res) => {
  try {
    const { classId } = req.params;
    const students = await Student.find({ class: classId })
      .sort({ rollNumber: 1 });
    
    res.json(students);
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit daily attendance
router.post('/attendance', async (req, res) => {
  try {
    const { classId, date, attendanceData } = req.body; // subjectId removed

    for (const attendance of attendanceData) {
      const student = await Student.findById(attendance.studentId);
      if (!student) continue;

      // Remove any existing attendance for this date before adding a new one
      student.attendance = student.attendance.filter(
        att => att.date.toDateString() !== new Date(date).toDateString()
      );
      
      // Add the new attendance record
      student.attendance.push({
        date: new Date(date),
        status: attendance.status
        // No subjectId here
      });
      await student.save();
    }

    res.json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    console.error('Submit attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance for a class and date
router.get('/attendance/:classId/:date', async (req, res) => {
  try {
    const { classId, date } = req.params;
    const targetDate = new Date(date);
    
    const students = await Student.find({ class: classId });
    const attendanceData = students.map(student => {
      const dayAttendance = student.attendance.find(att => 
        att.date.toDateString() === targetDate.toDateString()
      );
      
      return {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        status: dayAttendance ? dayAttendance.status : null // No subject consideration
      };
    });

    res.json(attendanceData);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update daily attendance (same day only)
router.put('/attendance', async (req, res) => {
    try {
        const { studentId, date, status } = req.body; // subjectId removed
        const requestDate = new Date(date);
        const today = new Date();

        if (requestDate.toDateString() !== today.toDateString()) {
            return res.status(400).json({ message: 'Attendance can only be updated on the same day.' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const attendanceIndex = student.attendance.findIndex(att =>
            att.date.toDateString() === requestDate.toDateString()
            // No subjectId check
        );

        if (attendanceIndex === -1) {
            return res.status(404).json({ message: 'Attendance record for today not found.' });
        }

        student.attendance[attendanceIndex].status = status;
        await student.save();
        res.json({ message: 'Attendance updated successfully' });

    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Enter or update marks
router.put('/marks', async (req, res) => {
  try {
    const { studentId, subjectId, examType, score, totalMarks = 100 } = req.body;

    if (score > totalMarks) {
      return res.status(400).json({ message: `Score (${score}) cannot exceed total marks (${totalMarks})` });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const existingMarkIndex = student.marks.findIndex(mark => 
      mark.subject.toString() === subjectId && mark.examType === examType
    );

    if (existingMarkIndex > -1) {
      student.marks[existingMarkIndex].score = score;
      student.marks[existingMarkIndex].totalMarks = totalMarks;
      student.marks[existingMarkIndex].date = new Date();
    } else {
      student.marks.push({
        subject: subjectId,
        examType,
        score,
        totalMarks,
        date: new Date()
      });
    }

    await student.save();
    res.json({ message: 'Marks updated successfully' });
  } catch (error) {
    console.error('Update marks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get marks for a class and subject
router.get('/marks/:classId/:subjectId', async (req, res) => {
  try {
    const { classId, subjectId } = req.params;
    
    const students = await Student.find({ class: classId })
      .populate('marks.subject', 'name code');
    
    const marksData = students.map(student => {
      const subjectMarks = student.marks.filter(mark => 
        mark.subject._id.toString() === subjectId
      );
      
      return {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        marks: subjectMarks
      };
    });

    res.json(marksData);
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

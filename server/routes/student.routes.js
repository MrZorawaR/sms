const express = require('express');
const Student = require('../models/Student');
const { auth, studentAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply student authentication to all routes
router.use(auth, studentAuth);

// Get student profile
router.get('/profile', async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const student = await Student.findById(studentId)
      .populate('class', 'name section academicYear')
      .populate('marks.subject', 'name code');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student attendance (simplified)
router.get('/attendance', async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const student = await Student.findById(studentId); // Removed populate for subject
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student.attendance);
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student marks
router.get('/marks', async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const student = await Student.findById(studentId)
      .populate('marks.subject', 'name code');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Group marks by subject
    const marksGrouped = {};
    student.marks.forEach(mark => {
      const subjectName = mark.subject.name;
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

    res.json(marksGrouped);
  } catch (error) {
    console.error('Get student marks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get overall attendance summary (simplified)
router.get('/attendance/summary', async (req, res) => {
  try {
    const studentId = req.user.profile._id;
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate overall attendance summary
    let present = 0;
    let absent = 0;
    const total = student.attendance.length;

    student.attendance.forEach(record => {
      if (record.status === 'Present') {
        present++;
      } else {
        absent++;
      }
    });

    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.json({
        present,
        absent,
        total,
        percentage: parseFloat(percentage)
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const { auth, studentAuth } = require('../middleware/auth.middleware');
const studentController = require('../controllers/student.controller');
const timetableController = require('../controllers/timetable.controller');

const router = express.Router();

router.use(auth, studentAuth);

router.get('/profile', studentController.getProfile);
router.get('/attendance', studentController.getAttendance);
router.get('/attendance/calendar', studentController.getAttendanceCalendar);
router.get('/marks', studentController.getMarks);
router.get('/attendance/summary', studentController.getAttendanceSummary);
router.get('/report', studentController.getReport);

router.get('/timetable', timetableController.getStudentTimetable);

module.exports = router;
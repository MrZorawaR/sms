const express = require('express');
const { auth, teacherAuth } = require('../middleware/auth.middleware');
const teacherController = require('../controllers/teacher.controller');
const timetableController = require('../controllers/timetable.controller');

const router = express.Router();

router.use(auth, teacherAuth);

router.get('/classes', teacherController.getClasses);
router.get('/classes/:classId/students', teacherController.getStudentsInClass);
router.post('/attendance', teacherController.submitAttendance);
router.get('/attendance/:classId/:date', teacherController.getAttendance);
router.put('/attendance', teacherController.updateAttendance);
router.put('/marks', teacherController.enterOrUpdateMarks);
router.get('/marks/:classId/:subjectId', teacherController.getMarks);

router.get('/timetable', timetableController.getTeacherTimetable);

module.exports = router;

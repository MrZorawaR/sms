const express = require("express");
const { auth, adminAuth } = require("../middleware/auth.middleware");
const {
  dashboardStats,
  registerUser,
  getAllTeachers,
  getAllSubjects,
  createClass,
  assignTeacherToClass,
  updateStudent,
  deleteStudent,
  updateClass,
  deleteClass,
  updateSubject,
  deleteSubject,
  assignSubjectToClass,
  getAllStudents,
  createSubject,
  getAllClasses,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/admin.controller");
const timetableController = require("../controllers/timetable.controller");

const router = express.Router();

// Apply admin authentication to all routes
router.use(auth, adminAuth);

// Dashboard stats
router.get("/stats", dashboardStats);

// Register new user (student or teacher)
router.post("/register", registerUser);

// Get all students
router.get("/students", getAllStudents);

// Get all teachers
router.get("/teachers", getAllTeachers);

// Get all classes
router.get("/classes", getAllClasses);

// Get all subjects
router.get("/subjects", getAllSubjects);

// Create class
router.post("/classes", createClass);

// Create subject
router.post("/subjects", createSubject);

// Update a student
router.put("/students/:studentId", updateStudent);

// Delete a student
router.delete("/students/:studentId", deleteStudent);

// Update a teacher
router.put("/teachers/:teacherId", updateTeacher);

// Delete a teacher
router.delete("/teachers/:teacherId", deleteTeacher);

// Update a class
router.put("/classes/:classId", updateClass);

// Cann't Delete a class
// router.delete("/classes/:classId", deleteClass);

// Update a subject
router.put("/subjects/:subjectId", updateSubject);

// Delete a subject
// router.delete("/subjects/:subjectId", deleteSubject);

// Assign teacher to class
router.put("/assign-teacher-to-class", assignTeacherToClass);

// Assign subject to class
router.put("/assign-subject-to-class", assignSubjectToClass);

// Timetable routines
router.post("/timetable", timetableController.upsertDayTimetable);
router.get("/timetable/:classId", timetableController.getClassTimetable);

module.exports = router;

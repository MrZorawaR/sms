const adminService = require("../services/admin.service");

const dashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, password, role, profileData } = req.body;
    const userId = await adminService.registerUser(username, password, role, profileData);
    res.status(201).json({ message: "User created successfully", user: userId });
  } catch (error) {
    console.error("Register error:", error);
    if (error.message.includes("already taken") || error.message.includes("already in use") || error.message.includes("Invalid")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminService.getAllStudents(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminService.getAllTeachers(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminService.getAllClasses(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllSubjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminService.getAllSubjects(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createClass = async (req, res) => {
  try {
    const newClass = await adminService.createClass(req.body);
    res.status(201).json(newClass);
  } catch (error) {
    if (error.name === "ValidationError" || error.message.includes("already exists")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const createSubject = async (req, res) => {
  try {
    const newSubject = await adminService.createSubject(req.body);
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const assignTeacherToClass = async (req, res) => {
  try {
    const { teacherId, classId } = req.body;
    await adminService.assignTeacherToClass(teacherId, classId);
    res.json({ message: "Teacher assigned successfully" });
  } catch (error) {
    if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await adminService.updateStudent(req.params.studentId, req.body);
    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await adminService.deleteStudent(req.params.studentId);
    res.json({ message: "Student and associated user account deleted successfully" });
  } catch (error) {
    if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const teacher = await adminService.updateTeacher(req.params.teacherId, req.body);
    res.json({ message: "Teacher updated successfully", teacher });
  } catch (error) {
    if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    await adminService.deleteTeacher(req.params.teacherId);
    res.json({ message: "Teacher and associated user account deleted successfully" });
  } catch (error) {
    if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

const updateClass = async (req, res) => {
  try {
    const updatedClass = await adminService.updateClass(req.params.classId, req.body);
    res.json({ message: "Class updated successfully", class: updatedClass });
  } catch (error) {
    if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await adminService.updateSubject(req.params.subjectId, req.body);
    res.json({ message: "Subject updated successfully", subject });
  } catch (error) {
    if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

const assignSubjectToClass = async (req, res) => {
  try {
    const { classId, subjectId } = req.body;
    await adminService.assignSubjectToClass(classId, subjectId);
    res.json({ message: "Subject assigned to class successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  dashboardStats,
  registerUser,
  getAllStudents,
  getAllTeachers,
  getAllClasses,
  getAllSubjects,
  createClass,
  createSubject,
  assignTeacherToClass,
  updateStudent,
  deleteStudent,
  updateTeacher,
  deleteTeacher,
  updateClass,
  updateSubject,
  assignSubjectToClass,
};

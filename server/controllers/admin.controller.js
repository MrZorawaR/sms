const Class = require("../models/Class");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Teacher = require("../models/Teacher");
const User = require("../models/User");

const dashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    // Calculate overall attendance for today (Day-wise logic)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find students who have an attendance record for today
    const studentsWithAttendanceToday = await Student.find({
      "attendance.date": { $gte: today, $lt: tomorrow },
    });

    let presentCount = 0;
    const totalAttendanceTaken = studentsWithAttendanceToday.length;

    studentsWithAttendanceToday.forEach((student) => {
      // Since attendance is daily, find the specific record for today
      const todaysRecord = student.attendance.find(
        (att) => att.date.toDateString() === today.toDateString()
      );
      if (todaysRecord && todaysRecord.status === "Present") {
        presentCount++;
      }
    });

    const attendancePercentage =
      totalAttendanceTaken > 0
        ? ((presentCount / totalAttendanceTaken) * 100).toFixed(2)
        : 0;

    res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      attendancePercentage: parseFloat(attendancePercentage),
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, password, role, profileData } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: `Username "${username}" is already taken.` });
    }
    if (role === "student") {
      const { email, rollNumber } = profileData;
      const studentExists = await Student.findOne({
        $or: [{ email }, { rollNumber }],
      });
      if (studentExists) {
        const duplicateField =
          studentExists.email === email ? "Email" : "Roll Number";
        return res
          .status(400)
          .json({ message: `${duplicateField} is already in use.` });
      }
    } else if (role === "teacher") {
      const { email } = profileData;
      const teacherExists = await Teacher.findOne({ email });
      if (teacherExists) {
        return res
          .status(400)
          .json({ message: `Email "${email}" is already in use.` });
      }
    }

    let profile;
    let profileModel;

    if (role === "teacher") {
      profile = new Teacher(profileData);
      profileModel = "Teacher";
    } else if (role === "student") {
      profile = new Student(profileData);
      profileModel = "Student";
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    await profile.save();

    // **FIX APPLIED HERE**: If a new student is created, add them to their class
    if (role === "student" && profileData.class) {
      await Class.findByIdAndUpdate(profileData.class, {
        $addToSet: { students: profile._id },
      });
    }

    const user = new User({
      username,
      password,
      role,
      profile: profile._id,
      profileModel,
    });

    await user.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: user._id });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({})
      .populate("class", "name section")
      .sort({ name: 1 });
    res.json(students);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({})
      .populate("assignedClasses", "name section")
      .populate("subjects", "name code")
      .sort({ name: 1 });
    res.json(teachers);
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({})
      .populate("teacher", "name email")
      .populate("subjects", "name code")
      .sort({ name: 1 });
    res.json(classes);
  } catch (error) {
    console.error("Get classes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({})
      .populate("teacher", "name email")
      .populate("classes", "name section")
      .sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createClass = async (req, res) => {
  try {
    const { name, section, academicYear } = req.body;

    // Edge Case: Check for duplicate class name and section
    const existingClass = await Class.findOne({ name, section, academicYear });
    if (existingClass) {
      return res.status(400).json({
        message: `A class with the name "${name} - ${section}" already exists for the academic year ${academicYear}.`,
      });
    }

    const classData = new Class(req.body);
    await classData.save();

    const populatedClass = await Class.findById(classData._id)
      .populate("teacher", "name email")
      .populate("subjects", "name code");

    res.status(201).json(populatedClass);
  } catch (error) {
    console.error("Create class error:", error);
    // Handle other potential errors, like validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const createSubject = async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();

    const populatedSubject = await Subject.findById(subject._id)
      .populate("teacher", "name email")
      .populate("classes", "name section");

    res.status(201).json(populatedSubject);
  } catch (error) {
    console.error("Create subject error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const assignTeacherToClass = async (req, res) => {
  try {
    const { teacherId, classId } = req.body;

    // Edge Case: Check if class and teacher exist
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: "Class not found." });
    }

    const teacherExists = await Teacher.findById(teacherId);
    if (!teacherExists) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Update class with teacher
    await Class.findByIdAndUpdate(classId, { teacher: teacherId });

    // Add class to teacher's assigned classes
    await Teacher.findByIdAndUpdate(teacherId, {
      $addToSet: { assignedClasses: classId },
    });

    res.json({ message: "Teacher assigned successfully" });
  } catch (error) {
    console.error("Assign teacher error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const profileData = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const oldClassId = student.class;
    const newClassId = profileData.class;

    // **FIX APPLIED HERE**: If class is changed, update both old and new class lists
    if (
      newClassId &&
      oldClassId &&
      oldClassId.toString() !== newClassId.toString()
    ) {
      await Class.findByIdAndUpdate(oldClassId, {
        $pull: { students: studentId },
      });
      await Class.findByIdAndUpdate(newClassId, {
        $addToSet: { students: studentId },
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      profileData,
      { new: true, runValidators: true }
    ).populate("class", "name section");

    res.json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // **FIX APPLIED HERE**: When deleting a student, remove them from their class list
    if (student.class) {
      await Class.findByIdAndUpdate(student.class, {
        $pull: { students: studentId },
      });
    }

    await User.findOneAndDelete({
      profile: studentId,
      profileModel: "Student",
    });

    await Student.findByIdAndDelete(studentId);

    res.json({
      message: "Student and associated user account deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const profileData = req.body;

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      profileData,
      { new: true, runValidators: true }
    ).populate("assignedClasses", "name section");

    if (!updatedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({
      message: "Teacher updated successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    console.error("Update teacher error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Find and delete the associated User account
    await User.findOneAndDelete({
      profile: teacherId,
      profileModel: "Teacher",
    });

    // Unassign this teacher from any classes
    await Class.updateMany({ teacher: teacherId }, { $unset: { teacher: "" } });

    // Delete the teacher profile
    await Teacher.findByIdAndDelete(teacherId);

    res.json({
      message: "Teacher and associated user account deleted successfully",
    });
  } catch (error) {
    console.error("Delete teacher error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const classData = req.body;

    const updatedClass = await Class.findByIdAndUpdate(classId, classData, {
      new: true,
      runValidators: true,
    })
      .populate("teacher", "name email")
      .populate("subjects", "name code");

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json({ message: "Class updated successfully", class: updatedClass });
  } catch (error) {
    console.error("Update class error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// const deleteClass = async (req, res) => {
//   try {
//     const { classId } = req.params;

//     const classToDelete = await Class.findById(classId);
//     if (!classToDelete) {
//       return res.status(404).json({ message: "Class not found" });
//     }

//     await Student.updateMany({ class: classId }, { $unset: { class: "" } });

//     await Teacher.updateMany(
//       { assignedClasses: classId },
//       { $pull: { assignedClasses: classId } }
//     );

//     await Class.findByIdAndDelete(classId);

//     res.json({ message: "Class deleted successfully and students unassigned" });
//   } catch (error) {
//     console.error("Delete class error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subjectData = req.body;

    const updatedSubject = await Subject.findByIdAndUpdate(
      subjectId,
      subjectData,
      { new: true, runValidators: true }
    )
      .populate("teacher", "name email")
      .populate("classes", "name section");

    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({
      message: "Subject updated successfully",
      subject: updatedSubject,
    });
  } catch (error) {
    console.error("Update subject error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//cann't delete subject
// const deleteSubject = async (req, res) => {
//   try {
//     const { subjectId } = req.params;

//     const subject = await Subject.findById(subjectId);
//     if (!subject) {
//       return res.status(404).json({ message: "Subject not found" });
//     }

//     await Class.updateMany(
//       { subjects: subjectId },
//       { $pull: { subjects: subjectId } }
//     );

//     await Subject.findByIdAndDelete(subjectId);

//     res.json({ message: "Subject deleted successfully" });
//   } catch (error) {
//     console.error("Delete subject error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const assignSubjectToClass = async (req, res) => {
  try {
    const { classId, subjectId } = req.body;

    // Add subject to the class's subjects array
    await Class.findByIdAndUpdate(classId, {
      $addToSet: { subjects: subjectId },
    });

    // Add class to the subject's classes array
    await Subject.findByIdAndUpdate(subjectId, {
      $addToSet: { classes: classId },
    });

    res.json({ message: "Subject assigned to class successfully" });
  } catch (error) {
    console.error("Assign subject to class error:", error);
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

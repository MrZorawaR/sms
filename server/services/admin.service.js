const Class = require("../models/Class");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Teacher = require("../models/Teacher");
const User = require("../models/User");

class AdminService {
  async getDashboardStats() {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This logic relies on the Attendance collection now
    const Attendance = require("../models/Attendance");
    const studentsWithAttendanceToday = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
    });

    let presentCount = 0;
    const uniqueStudents = new Set();
    
    studentsWithAttendanceToday.forEach((att) => {
      uniqueStudents.add(att.studentId.toString());
      if (att.status === "Present") {
        presentCount++;
      }
    });

    const totalAttendanceTaken = uniqueStudents.size;
    const attendancePercentage = totalAttendanceTaken > 0
        ? ((presentCount / totalAttendanceTaken) * 100).toFixed(2) : 0;

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      attendancePercentage: parseFloat(attendancePercentage),
    };
  }

  async registerUser(username, password, role, profileData) {
    const existingUser = await User.findOne({ username });
    if (existingUser) throw new Error(`Username "${username}" is already taken.`);

    if (role === "student") {
      const studentExists = await Student.findOne({
        $or: [{ email: profileData.email }, { rollNumber: profileData.rollNumber }],
      });
      if (studentExists) {
        const duplicateField = studentExists.email === profileData.email ? "Email" : "Roll Number";
        throw new Error(`${duplicateField} is already in use.`);
      }
    } else if (role === "teacher") {
      const teacherExists = await Teacher.findOne({ email: profileData.email });
      if (teacherExists) {
        throw new Error(`Email "${profileData.email}" is already in use.`);
      }
    } else {
        throw new Error("Invalid role");
    }

    let profile;
    let profileModel;

    if (role === "teacher") {
      profile = new Teacher(profileData);
      profileModel = "Teacher";
    } else if (role === "student") {
      profile = new Student(profileData);
      profileModel = "Student";
    }

    await profile.save();

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
    return user._id;
  }

  async getAllStudents(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const total = await Student.countDocuments();
    const data = await Student.find({}).populate("class", "name section").sort({ name: 1 }).skip(skip).limit(limit);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllTeachers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const total = await Teacher.countDocuments();
    const data = await Teacher.find({})
      .populate("assignedClasses", "name section")
      .populate("subjects", "name code")
      .sort({ name: 1 })
      .skip(skip).limit(limit);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllClasses(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const total = await Class.countDocuments();
    const data = await Class.find({})
      .populate("teacher", "name email")
      .populate("subjects", "name code")
      .sort({ name: 1 })
      .skip(skip).limit(limit);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllSubjects(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const total = await Subject.countDocuments();
    const data = await Subject.find({})
      .populate("teacher", "name email")
      .populate("classes", "name section")
      .sort({ name: 1 })
      .skip(skip).limit(limit);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async createClass(data) {
    const { name, section, academicYear } = data;
    const existingClass = await Class.findOne({ name, section, academicYear });
    if (existingClass) {
      throw new Error(`A class with the name "${name} - ${section}" already exists for the academic year ${academicYear}.`);
    }

    const classData = new Class(data);
    await classData.save();

    return await Class.findById(classData._id)
      .populate("teacher", "name email")
      .populate("subjects", "name code");
  }

  async createSubject(data) {
    const subject = new Subject(data);
    await subject.save();

    return await Subject.findById(subject._id)
      .populate("teacher", "name email")
      .populate("classes", "name section");
  }

  async assignTeacherToClass(teacherId, classId) {
    const classExists = await Class.findById(classId);
    if (!classExists) throw new Error("Class not found.");

    const teacherExists = await Teacher.findById(teacherId);
    if (!teacherExists) throw new Error("Teacher not found.");

    await Class.findByIdAndUpdate(classId, { teacher: teacherId });
    await Teacher.findByIdAndUpdate(teacherId, {
      $addToSet: { assignedClasses: classId },
    });
  }

  async updateStudent(studentId, profileData) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");

    const oldClassId = student.class;
    const newClassId = profileData.class;

    if (newClassId && oldClassId && oldClassId.toString() !== newClassId.toString()) {
      await Class.findByIdAndUpdate(oldClassId, { $pull: { students: studentId } });
      await Class.findByIdAndUpdate(newClassId, { $addToSet: { students: studentId } });
    }

    return await Student.findByIdAndUpdate(studentId, profileData, { new: true, runValidators: true })
        .populate("class", "name section");
  }

  async deleteStudent(studentId) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");

    if (student.class) {
      await Class.findByIdAndUpdate(student.class, { $pull: { students: studentId } });
    }

    await User.findOneAndDelete({ profile: studentId, profileModel: "Student" });
    await Student.findByIdAndDelete(studentId);
  }

  async updateTeacher(teacherId, profileData) {
    const updatedTeacher = await Teacher.findByIdAndUpdate(teacherId, profileData, { new: true, runValidators: true })
        .populate("assignedClasses", "name section");
    if (!updatedTeacher) throw new Error("Teacher not found");
    return updatedTeacher;
  }

  async deleteTeacher(teacherId) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) throw new Error("Teacher not found");

    await User.findOneAndDelete({ profile: teacherId, profileModel: "Teacher" });
    await Class.updateMany({ teacher: teacherId }, { $unset: { teacher: "" } });
    await Teacher.findByIdAndDelete(teacherId);
  }

  async updateClass(classId, classData) {
    const updatedClass = await Class.findByIdAndUpdate(classId, classData, { new: true, runValidators: true })
      .populate("teacher", "name email").populate("subjects", "name code");
    if (!updatedClass) throw new Error("Class not found");
    return updatedClass;
  }

  async updateSubject(subjectId, subjectData) {
    const updatedSubject = await Subject.findByIdAndUpdate(subjectId, subjectData, { new: true, runValidators: true })
      .populate("teacher", "name email").populate("classes", "name section");
    if (!updatedSubject) throw new Error("Subject not found");
    return updatedSubject;
  }

  async assignSubjectToClass(classId, subjectId) {
    await Class.findByIdAndUpdate(classId, { $addToSet: { subjects: subjectId } });
    await Subject.findByIdAndUpdate(subjectId, { $addToSet: { classes: classId } });

    const subject = await Subject.findById(subjectId);
    if (subject && subject.teacher) {
      await Teacher.findByIdAndUpdate(subject.teacher, { $addToSet: { subjects: subjectId } });
    }
  }
}

module.exports = new AdminService();

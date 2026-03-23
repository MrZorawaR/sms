const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  startTime: { type: String, required: true }, // e.g. "09:00 AM"
  endTime: { type: String, required: true }   // e.g. "09:45 AM"
});

const timetableSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  dayOfWeek: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true 
  },
  periods: [periodSchema]
}, { timestamps: true });

// Prevent duplicate days per class
timetableSchema.index({ classId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);

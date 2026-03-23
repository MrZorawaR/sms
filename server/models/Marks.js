const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  examType: {
    type: String,
    required: true,
    enum: ['Mid-Term', 'Finals', 'Quiz', 'Assignment']
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100,
    min: 1
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for performant queries
marksSchema.index({ studentId: 1, subjectId: 1 });
marksSchema.index({ studentId: 1, examType: 1 });

module.exports = mongoose.model('Marks', marksSchema);

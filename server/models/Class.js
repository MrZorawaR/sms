const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  academicYear: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound unique index: same name+section+year cannot exist twice
classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
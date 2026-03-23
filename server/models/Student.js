const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

studentSchema.index({ class: 1 });
studentSchema.index({ rollNumber: 1 }); // unique true already adds an index, but explicit declaration helps

module.exports = mongoose.model('Student', studentSchema);

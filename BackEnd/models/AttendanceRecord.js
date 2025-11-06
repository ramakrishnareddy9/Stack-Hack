const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
  },
  classesAttended: {
    type: Number,
    required: true,
    min: 0
  },
  totalClasses: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  importedAt: {
    type: Date,
    default: Date.now
  },
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  remarks: String
});

// Compound index for unique records per student per month
attendanceRecordSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });

// Calculate percentage before saving
attendanceRecordSchema.pre('save', function(next) {
  if (this.totalClasses > 0) {
    this.percentage = parseFloat(((this.classesAttended / this.totalClasses) * 100).toFixed(2));
  } else {
    this.percentage = 0;
  }
  next();
});

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);

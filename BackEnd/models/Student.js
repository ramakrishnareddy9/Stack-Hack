const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT']
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalVolunteerHours: {
    type: Number,
    default: 0,
    min: 0
  },
  isEligible: {
    type: Boolean,
    default: false
  },
  participations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participation'
  }],
  profilePicture: {
    url: String,
    publicId: String
  },
  phoneNumber: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: Date,
  emailVerified: {
    type: Boolean,
    default: false
  }
});

// Index for faster queries
studentSchema.index({ registrationNumber: 1, email: 1 });
studentSchema.index({ department: 1, year: 1 });

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update eligibility based on attendance
studentSchema.pre('save', function(next) {
  this.isEligible = this.attendancePercentage >= 75;
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check eligibility with detailed reason
studentSchema.methods.checkEligibility = function() {
  if (this.attendancePercentage < 75) {
    return {
      eligible: false,
      reason: `Attendance is ${this.attendancePercentage}%, minimum required is 75%`,
      shortBy: 75 - this.attendancePercentage
    };
  }
  return {
    eligible: true,
    message: 'Student meets all eligibility criteria'
  };
};

// Calculate total hours from participations
studentSchema.methods.calculateTotalHours = async function() {
  await this.populate({
    path: 'participations',
    match: { status: 'approved' },
    populate: {
      path: 'event',
      select: 'hoursAwarded'
    }
  });
  
  const totalHours = this.participations.reduce((sum, participation) => {
    return sum + (participation.event?.hoursAwarded || 0);
  }, 0);
  
  this.totalVolunteerHours = totalHours;
  return totalHours;
};

module.exports = mongoose.model('Student', studentSchema);

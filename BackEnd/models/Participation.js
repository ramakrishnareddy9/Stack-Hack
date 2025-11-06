const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'attended', 'completed'],
    default: 'pending'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attendance: {
    type: Boolean,
    default: false
  },
  attendanceDate: {
    type: Date
  },
  volunteerHours: {
    type: Number,
    default: 0
  },
  contribution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contribution'
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'pdf', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiGeneratedReport: {
    type: String,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  certificateUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Prevent duplicate participations
participationSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Participation', participationSchema);


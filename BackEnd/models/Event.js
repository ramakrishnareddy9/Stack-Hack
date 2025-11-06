const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['tree plantation', 'blood donation', 'cleanliness drive', 'awareness campaign', 'health camp', 'other'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  maxParticipants: {
    type: Number,
    default: null
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  requirements: [{
    type: String
  }],
  images: [{
    url: String,
    publicId: String
  }],
  participations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participation'
  }],
  hoursAwarded: {
    type: Number,
    required: true,
    min: 1,
    default: 2
  },
  certificateTemplate: {
    type: String,
    default: null
  },
  certificateConfig: {
    templateUrl: String,
    fields: {
      name: { x: Number, y: Number, fontSize: Number, color: String },
      eventName: { x: Number, y: Number, fontSize: Number, color: String },
      date: { x: Number, y: Number, fontSize: Number, color: String }
    },
    autoSend: { type: Boolean, default: true }
  },
  approvalRequired: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);


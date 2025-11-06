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
  certificate: {
    templateUrl: String,
    templatePublicId: String,
    fields: {
      name: {
        x: Number,
        y: Number,
        fontSize: { type: Number, default: 24 },
        color: { type: String, default: '#000000' }
      },
      eventName: {
        x: Number,
        y: Number,
        fontSize: { type: Number, default: 20 },
        color: { type: String, default: '#000000' }
      },
      date: {
        x: Number,
        y: Number,
        fontSize: { type: Number, default: 18 },
        color: { type: String, default: '#000000' }
      }
    },
    autoSend: { type: Boolean, default: true }
  },
  certificatesSent: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);


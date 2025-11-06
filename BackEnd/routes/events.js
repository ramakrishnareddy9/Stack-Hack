const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Participation = require('../models/Participation');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { sendNewEventNotification } = require('../utils/notifications');

const router = express.Router();

// @route   GET /api/events/upcoming
// @desc    Get upcoming events for students
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    const query = {
      status: { $in: ['published', 'ongoing'] },
      registrationDeadline: { $gte: new Date() },
      startDate: { $gte: new Date() }
    };

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ startDate: 1 });

    // Add participation status for students
    if (req.user.role === 'student') {
      for (let event of events) {
        const participation = await Participation.findOne({
          student: req.user.id,
          event: event._id
        });
        event._doc.participationStatus = participation ? participation.status : null;
      }
    }

    res.json(events);
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events
// @desc    Get all events (with filters)
// @access  Public (for students), Private (for admin/faculty)
router.get('/', auth, async (req, res) => {
  try {
    const { status, eventType, search } = req.query;
    const query = {};

    // Students can only see published events
    if (req.user.role === 'student') {
      query.status = { $in: ['published', 'ongoing', 'completed'] };
    }

    if (status) {
      query.status = status;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    // Add participation status for students
    if (req.user.role === 'student') {
      for (let event of events) {
        const participation = await Participation.findOne({
          student: req.user.id,
          event: event._id
        });
        event._doc.participationStatus = participation ? participation.status : null;
      }
    }

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate({
        path: 'participations',
        populate: {
          path: 'student',
          select: 'name email studentId'
        }
      });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if student is registered
    if (req.user.role === 'student') {
      const participation = await Participation.findOne({
        student: req.user.id,
        event: event._id
      });
      event._doc.participationStatus = participation ? participation.status : null;
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Admin/Faculty only)
router.post('/', [
  auth,
  authorize('admin'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('eventType').isIn(['tree plantation', 'blood donation', 'cleanliness drive', 'awareness campaign', 'health camp', 'other']).withMessage('Invalid event type'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('registrationDeadline').isISO8601().withMessage('Valid registration deadline is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizer: req.user.id
    };

    const event = new Event(eventData);
    await event.save();

    await event.populate('organizer', 'name email');

    // Send email notifications to all students when event is published
    if (req.body.status === 'published' || event.status === 'published') {
      try {
        const students = await User.find({ role: 'student', isActive: true }).select('email name');
        if (students.length > 0) {
          // Send emails in background (don't wait)
          sendNewEventNotification(event, students).catch(error => {
            console.error('Error sending event notifications:', error);
          });

          // Send WebSocket notification to all connected students
          const io = req.app.get('io');
          if (io) {
            students.forEach(student => {
              io.to(`user-${student._id}`).emit('new-event', {
                type: 'new-event',
                message: `New event: ${event.title}`,
                event: {
                  id: event._id,
                  title: event.title,
                  eventType: event.eventType,
                  location: event.location,
                  startDate: event.startDate
                },
                timestamp: new Date()
              });
            });
          }
        }
      } catch (error) {
        console.error('Error notifying students about new event:', error);
        // Don't fail the request if notification fails
      }
    }

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/publish
// @desc    Publish event
// @access  Private (Admin/Faculty only)
// Note: This route must come before PUT /:id to avoid route conflicts
router.post('/:id/publish', auth, async (req, res) => {
  try {
    // Check authorization manually for better error handling
    if (!req.user) {
      console.error('❌ No user found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log(`\n🔐 Publish attempt by user: ${req.user.name} (${req.user.email})`);
    console.log(`   User ID: ${req.user._id}`);
    console.log(`   User Role: ${req.user.role}`);
    console.log(`   Required Roles: admin, faculty`);

    if (!['admin', 'faculty'].includes(req.user.role)) {
      console.error(`❌ Access denied for user ${req.user._id} (${req.user.name}) with role: ${req.user.role}`);
      console.error(`   Expected role: 'admin' or 'faculty', but got: '${req.user.role}'`);
      return res.status(403).json({ 
        message: 'Access denied. Only Admin and Faculty can publish events.',
        userRole: req.user.role,
        userName: req.user.name,
        userId: req.user._id,
        requiredRoles: ['admin', 'faculty']
      });
    }

    console.log(`✅ Authorization successful for ${req.user.role}`);

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = 'published';
    await event.save();

    await event.populate('organizer', 'name email');

    // Send email notifications to ALL registered students when event is published
    try {
      // Get all registered students (active and with email addresses)
      const students = await User.find({ 
        role: 'student', 
        isActive: true,
        email: { $exists: true, $ne: null, $ne: '' }
      }).select('email name _id');
      
      console.log(`\n=== Publishing event: ${event.title} ===`);
      console.log(`Found ${students.length} registered students with email addresses`);
      
      if (students.length > 0) {
        // Send emails to all registered students
        sendNewEventNotification(event, students)
          .then(results => {
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            console.log(`\n📧 Email Summary: ${successful} sent successfully, ${failed} failed`);
            if (failed > 0) {
              console.error('Failed email sends:', results.filter(r => !r.success));
            }
          })
          .catch(error => {
            console.error('❌ Error sending event notifications:', error);
          });

        // Send WebSocket notification to all connected students
        const io = req.app.get('io');
        if (io) {
          let notificationsSent = 0;
          students.forEach(student => {
            const studentId = student._id.toString();
            const roomName = `user-${studentId}`;
            
            console.log(`📤 Sending notification to room: ${roomName}`);
            io.to(roomName).emit('new-event', {
              type: 'new-event',
              message: `New event: ${event.title}`,
              event: {
                id: event._id,
                title: event.title,
                eventType: event.eventType,
                location: event.location,
                startDate: event.startDate
              },
              timestamp: new Date()
            });
            notificationsSent++;
          });
          
          // Also broadcast to all connected sockets (for students who might have joined)
          io.emit('new-event-broadcast', {
            type: 'new-event',
            message: `New event: ${event.title}`,
            event: {
              id: event._id,
              title: event.title,
              eventType: event.eventType,
              location: event.location,
              startDate: event.startDate
            },
            timestamp: new Date()
          });
          
          console.log(`🔔 WebSocket notifications sent to ${notificationsSent} student rooms`);
          console.log(`📢 Broadcast notification sent to all connected clients`);
        } else {
          console.log('⚠️ Socket.IO not available');
        }
      } else {
        console.log('⚠️ No students found with email addresses');
      }
    } catch (error) {
      console.error('❌ Error notifying students about new event:', error);
      // Don't fail the request if notification fails
    }

    res.json(event);
  } catch (error) {
    console.error('Publish event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Admin/Faculty only)
router.put('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    Object.assign(event, req.body);
    await event.save();

    await event.populate('organizer', 'name email');

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete related participations
    await Participation.deleteMany({ event: event._id });

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


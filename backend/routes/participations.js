const express = require('express');
const Participation = require('../models/Participation');
const Event = require('../models/Event');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { sendRegistrationConfirmation, sendApprovalNotification } = require('../utils/notifications');

const router = express.Router();

// @route   GET /api/participations
// @desc    Get all participations (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    // Students can only see their own participations
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    // Admin/Faculty can see all or filter by event
    if (req.query.eventId) {
      query.event = req.query.eventId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const participations = await Participation.find(query)
      .populate('student', 'name email studentId department year')
      .populate('event', 'title eventType startDate endDate location')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(participations);
  } catch (error) {
    console.error('Get participations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/participations
// @desc    Register for an event
// @access  Private (Students only)
router.post('/', [auth, authorize('student')], async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is published
    if (event.status !== 'published' && event.status !== 'ongoing') {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }

    // Check registration deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check max participants
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const existingParticipation = await Participation.findOne({
      student: req.user.id,
      event: eventId
    });

    if (existingParticipation) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Create participation
    const participation = new Participation({
      student: req.user.id,
      event: eventId,
      status: 'pending'
    });

    await participation.save();

    // Update event participant count
    event.currentParticipants += 1;
    await event.save();

    // Add participation to event
    event.participations.push(participation._id);
    await event.save();

    await participation.populate('student', 'name email studentId');
    await participation.populate('event', 'title eventType startDate endDate location');

    // Send registration confirmation email
    try {
      await sendRegistrationConfirmation(participation.student, participation.event);
    } catch (error) {
      console.error('Failed to send registration confirmation email:', error);
    }

    res.status(201).json(participation);
  } catch (error) {
    console.error('Register participation error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/participations/:id/approve
// @desc    Approve participation request
// @access  Private (Admin/Faculty only)
router.put('/:id/approve', [auth, authorize('admin', 'faculty')], async (req, res) => {
  try {
    const participation = await Participation.findById(req.params.id);

    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    console.log(`\n=== Approve request ===`);
    console.log(`Participation ID: ${participation._id}`);
    console.log(`Current status: ${participation.status}`);
    console.log(`Student: ${participation.student}`);

    // Allow approval from any status except 'completed' (for edit functionality)
    // Only block 'completed' status - allow all others for editing
    if (participation.status === 'completed') {
      console.log(`❌ Cannot approve: status is ${participation.status}`);
      return res.status(400).json({
        message: `Cannot approve a completed participation. Current status: ${participation.status}`
      });
    }

    // If already approved, just return success (no-op)
    if (participation.status === 'approved') {
      console.log(`⚠️ Participation is already approved. Status: ${participation.status}`);
      await participation.populate('student', 'name email studentId');
      await participation.populate('event', 'title eventType startDate endDate location');
      return res.json(participation);
    }

    const previousStatus = participation.status;
    const wasRejected = previousStatus === 'rejected';
    const wasPending = previousStatus === 'pending';
    const wasAttended = previousStatus === 'attended';

    participation.status = 'approved';
    participation.approvedAt = new Date();
    participation.approvedBy = req.user.id;
    // Clear attendance if it was previously marked
    if (wasAttended) {
      participation.attendance = false;
      participation.attendanceDate = null;
    }

    await participation.save();

    // Handle event participant count
    // Note: When participation is created, count is already incremented for pending status
    // So we need to increment if it was previously rejected (not if it was pending or already approved)
    const event = await Event.findById(participation.event);
    if (event) {
      if (wasRejected) {
        // Was rejected, now approved - increment count
        event.currentParticipants = (event.currentParticipants || 0) + 1;
        await event.save();
      } else if (wasAttended) {
        // Was attended, now approved - count should stay the same (already counted)
        // No change needed
      }
      // For pending -> approved, count is already correct (incremented on creation)
      // For already approved -> approved (no-op), no change needed
    }

    await participation.populate('student', 'name email studentId');
    await participation.populate('event', 'title eventType startDate endDate location');

    console.log(`\n=== Approving participation for student: ${participation.student.name} (${participation.student.email}) ===`);
    console.log(`Event: ${participation.event.title}`);

    // Send approval notification email to the approved student
    if (participation.student.email) {
      try {
        const emailResult = await sendApprovalNotification(participation.student, participation.event);
        if (emailResult.success) {
          console.log(`✅ Approval email sent successfully to ${participation.student.email}`);
        } else {
          console.error(`❌ Failed to send approval email: ${emailResult.error || emailResult.message}`);
        }
      } catch (error) {
        console.error('❌ Error sending approval notification email:', error);
      }
    } else {
      console.warn('⚠️ Student has no email address, skipping email notification');
    }

    // Send WebSocket notification to the approved student
    try {
      const io = req.app.get('io');
      if (io) {
        const studentId = participation.student._id.toString();
        const roomName = `user-${studentId}`;

        const notificationData = {
          type: 'participation-approved',
          message: `Your participation for "${participation.event.title}" has been approved!`,
          participation: {
            id: participation._id,
            eventId: participation.event._id,
            eventTitle: participation.event.title,
            status: participation.status
          },
          timestamp: new Date()
        };

        console.log(`📤 Sending approval notification to room: ${roomName}`);
        io.to(roomName).emit('participation-approved', notificationData);

        // Also emit to the socket directly if we can find it
        io.emit('participation-approved-broadcast', {
          ...notificationData,
          targetUserId: studentId
        });

        console.log(`🔔 WebSocket notification sent to student ${studentId}`);
      } else {
        console.warn('⚠️ Socket.IO not available');
      }
    } catch (error) {
      console.error('❌ Failed to send WebSocket notification:', error);
    }

    res.json(participation);
  } catch (error) {
    console.error('Approve participation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/participations/:id/reject
// @desc    Reject participation request
// @access  Private (Admin/Faculty only)
router.put('/:id/reject', [auth, authorize('admin', 'faculty')], async (req, res) => {
  try {
    const participation = await Participation.findById(req.params.id);

    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    console.log(`\n=== Reject request ===`);
    console.log(`Participation ID: ${participation._id}`);
    console.log(`Current status: ${participation.status}`);
    console.log(`Student: ${participation.student}`);

    // Allow rejection from any status except 'completed' (for edit functionality)
    // Only block 'completed' status - allow all others for editing
    if (participation.status === 'completed') {
      console.log(`❌ Cannot reject: status is ${participation.status}`);
      return res.status(400).json({ message: 'Cannot reject a completed participation' });
    }

    // If already rejected, just return success (no-op)
    if (participation.status === 'rejected') {
      console.log(`⚠️ Participation is already rejected. Status: ${participation.status}`);
      await participation.populate('student', 'name email studentId');
      await participation.populate('event', 'title eventType');
      return res.json(participation);
    }

    const previousStatus = participation.status;
    const wasApproved = previousStatus === 'approved';
    const wasAttended = previousStatus === 'attended';
    const wasPending = previousStatus === 'pending';

    participation.status = 'rejected';
    participation.approvedAt = new Date();
    participation.approvedBy = req.user.id;
    // Clear attendance if it was previously marked
    if (wasAttended) {
      participation.attendance = false;
      participation.attendanceDate = null;
    }

    await participation.save();

    // Handle event participant count
    const event = await Event.findById(participation.event);
    if (event) {
      if (wasApproved || wasAttended) {
        // Was approved or attended, now rejected - decrement count
        event.currentParticipants = Math.max(0, (event.currentParticipants || 0) - 1);
        await event.save();
      }
      // For pending -> rejected, count stays the same (was incremented on creation, stays incremented)
      // For already rejected -> rejected (no-op), no change needed
    }

    await participation.populate('student', 'name email studentId');
    await participation.populate('event', 'title eventType');

    res.json(participation);
  } catch (error) {
    console.error('Reject participation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/participations/:id/attendance
// @desc    Mark attendance
// @access  Private (Admin/Faculty only)
router.put('/:id/attendance', [auth, authorize('admin', 'faculty')], async (req, res) => {
  try {
    const { attended } = req.body;

    const participation = await Participation.findById(req.params.id);

    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    participation.attendance = attended;
    participation.attendanceDate = attended ? new Date() : null;
    participation.status = attended ? 'attended' : participation.status;

    await participation.save();

    await participation.populate('student', 'name email studentId');
    await participation.populate('event', 'title eventType');

    res.json(participation);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


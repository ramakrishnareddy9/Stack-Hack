const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Participation = require('../models/Participation');
const Event = require('../models/Event');
const AttendanceRecord = require('../models/AttendanceRecord');
const attendanceService = require('../services/attendanceService');

// @route   GET /api/students/stats
// @desc    Get student dashboard statistics
// @access  Student
router.get('/stats', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all events count
    const totalEvents = await Event.countDocuments({ 
      status: 'published',
      endDate: { $gte: new Date() }
    });

    // Get participated events
    const participations = await Participation.find({ 
      student: req.user._id 
    });

    const participatedEvents = participations.length;
    const pendingApprovals = participations.filter(p => p.status === 'pending').length;
    const approvedParticipations = participations.filter(p => 
      p.status === 'approved' || p.status === 'completed'
    );

    // Calculate total hours
    await student.calculateTotalHours();

    // Count certificates
    const certificates = participations.filter(p => p.certificateUrl).length;

    // Get active events (ongoing)
    const activeEvents = await Event.countDocuments({
      status: 'ongoing',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    res.json({
      totalEvents,
      participatedEvents,
      totalHours: student.totalVolunteerHours,
      pendingApprovals,
      certificates,
      attendance: student.attendancePercentage,
      isEligible: student.isEligible,
      activeEvents,
      eligibleStudents: 0 // This would need a separate query for all eligible students
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// @route   GET /api/students/profile
// @desc    Get student profile with detailed info
// @access  Student
router.get('/profile', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'participations',
        populate: {
          path: 'event',
          select: 'title eventType startDate hoursAwarded'
        }
      });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get attendance record
    const attendanceRecord = await AttendanceRecord.findOne({ 
      student: student._id 
    });

    res.json({
      ...student.toObject(),
      attendanceDetails: attendanceRecord
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// @route   PUT /api/students/profile
// @desc    Update student profile
// @access  Student
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = {
      phoneNumber: req.body.phoneNumber,
      // Add other fields that students can update
    };

    const student = await Student.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(student);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// @route   GET /api/students/eligibility
// @desc    Check student eligibility for events
// @access  Student
router.get('/eligibility', auth, async (req, res) => {
  try {
    const result = await attendanceService.checkAttendanceEligibility(req.user._id);
    
    const student = await Student.findById(req.user._id);
    
    res.json({
      ...result,
      studentInfo: {
        name: student.name,
        registrationNumber: student.registrationNumber,
        department: student.department,
        year: student.year
      }
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({ message: 'Failed to check eligibility' });
  }
});

// @route   GET /api/students/upcoming-events
// @desc    Get upcoming events student can register for
// @access  Student
router.get('/upcoming-events', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    
    // Get all upcoming published events
    const events = await Event.find({
      status: 'published',
      registrationDeadline: { $gte: new Date() },
      startDate: { $gte: new Date() }
    }).sort('startDate');

    // Get student's existing participations
    const participations = await Participation.find({
      student: req.user._id
    }).select('event');

    const participatedEventIds = participations.map(p => p.event.toString());

    // Filter events and add registration status
    const eventsWithStatus = events.map(event => {
      const isRegistered = participatedEventIds.includes(event._id.toString());
      const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
      const canRegister = student.isEligible && !isRegistered && !isFull;

      return {
        ...event.toObject(),
        isRegistered,
        isFull,
        canRegister,
        spotsLeft: event.maxParticipants ? event.maxParticipants - event.currentParticipants : null
      };
    });

    res.json(eventsWithStatus);
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming events' });
  }
});

// @route   GET /api/students/participation-history
// @desc    Get detailed participation history
// @access  Student
router.get('/participation-history', auth, async (req, res) => {
  try {
    const participations = await Participation.find({
      student: req.user._id
    })
    .populate('event')
    .populate('approvedBy', 'name')
    .sort('-createdAt');

    const history = participations.map(p => ({
      _id: p._id,
      event: {
        title: p.event.title,
        type: p.event.eventType,
        date: p.event.startDate,
        location: p.event.location
      },
      status: p.status,
      registeredAt: p.registeredAt,
      approvedAt: p.approvedAt,
      approvedBy: p.approvedBy?.name,
      volunteerHours: p.volunteerHours,
      attendance: p.attendance,
      certificateAvailable: !!p.certificateUrl,
      aiReportGenerated: !!p.aiGeneratedReport,
      rejectionReason: p.rejectionReason
    }));

    res.json(history);
  } catch (error) {
    console.error('Get participation history error:', error);
    res.status(500).json({ message: 'Failed to fetch participation history' });
  }
});

// @route   GET /api/students/achievements
// @desc    Get student achievements and milestones
// @access  Student
router.get('/achievements', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    const participations = await Participation.find({
      student: req.user._id,
      status: { $in: ['approved', 'completed'] }
    }).populate('event');

    const achievements = [];

    // Check various achievement criteria
    if (student.totalVolunteerHours >= 100) {
      achievements.push({
        id: 'century',
        title: 'Century Achiever',
        description: 'Completed 100+ volunteer hours',
        icon: 'gold_medal',
        earnedDate: new Date()
      });
    }

    if (student.totalVolunteerHours >= 50) {
      achievements.push({
        id: 'half_century',
        title: 'Dedicated Volunteer',
        description: 'Completed 50+ volunteer hours',
        icon: 'silver_medal',
        earnedDate: new Date()
      });
    }

    if (participations.length >= 10) {
      achievements.push({
        id: 'active_participant',
        title: 'Active Participant',
        description: 'Participated in 10+ events',
        icon: 'star',
        earnedDate: new Date()
      });
    }

    // Check event type diversity
    const eventTypes = [...new Set(participations.map(p => p.event.eventType))];
    if (eventTypes.length >= 5) {
      achievements.push({
        id: 'versatile',
        title: 'Versatile Contributor',
        description: 'Participated in 5+ different types of events',
        icon: 'diversity',
        earnedDate: new Date()
      });
    }

    // Perfect attendance achievement
    if (student.attendancePercentage === 100) {
      achievements.push({
        id: 'perfect_attendance',
        title: 'Perfect Attendance',
        description: 'Maintained 100% attendance',
        icon: 'check_circle',
        earnedDate: new Date()
      });
    }

    res.json({
      achievements,
      stats: {
        totalHours: student.totalVolunteerHours,
        totalEvents: participations.length,
        eventTypes: eventTypes.length,
        attendance: student.attendancePercentage
      }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
});

// @route   POST /api/students/request-certificate
// @desc    Request certificate generation for a participation
// @access  Student
router.post('/request-certificate/:participationId', auth, async (req, res) => {
  try {
    const participation = await Participation.findOne({
      _id: req.params.participationId,
      student: req.user._id
    }).populate('event');

    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    if (participation.status !== 'approved' && participation.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Certificate can only be generated for approved participations' 
      });
    }

    if (participation.certificateUrl) {
      return res.json({ 
        message: 'Certificate already generated',
        certificateUrl: participation.certificateUrl 
      });
    }

    // Trigger certificate generation
    const pdfService = require('../services/pdfService');
    const aiReportService = require('../services/aiReportService');

    const student = await Student.findById(req.user._id);
    
    const certificateData = {
      student: student,
      event: participation.event,
      coordinator: { name: 'NSS Coordinator' },
      certificateId: `NSS-${Date.now()}-${participation._id.toString().slice(-6)}`,
      description: await aiReportService.generateCertificateDescription(
        student,
        participation.event,
        student.totalVolunteerHours
      )
    };

    const result = await pdfService.generateCertificate(certificateData);
    
    participation.certificateUrl = result.url;
    participation.certificateId = result.certificateId;
    await participation.save();

    res.json({
      message: 'Certificate generated successfully',
      certificateUrl: result.url,
      certificateId: result.certificateId
    });
  } catch (error) {
    console.error('Request certificate error:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
});

// Admin routes for managing students

// @route   GET /api/students/all
// @desc    Get all students (admin)
// @access  Admin/Faculty
router.get('/all', auth, authorize('admin'), async (req, res) => {
  try {
    const { department, year, eligibility } = req.query;
    
    const query = {};
    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    if (eligibility === 'eligible') query.isEligible = true;
    if (eligibility === 'not-eligible') query.isEligible = false;

    const students = await Student.find(query)
      .select('-password')
      .sort('name');

    res.json(students);
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// @route   PUT /api/students/:id/attendance
// @desc    Update student attendance (admin)
// @access  Admin/Faculty
router.put('/:id/attendance', auth, authorize('admin'), async (req, res) => {
  try {
    const { presentDays, totalDays } = req.body;
    
    const result = await attendanceService.updateStudentAttendance(
      req.params.id,
      { presentDays, totalDays }
    );

    res.json(result);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Failed to update attendance' });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student (admin only)
// @access  Admin
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    // Delete all related data
    await Participation.deleteMany({ student: req.params.id });
    await AttendanceRecord.deleteMany({ student: req.params.id });
    
    // Delete student
    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

module.exports = router;

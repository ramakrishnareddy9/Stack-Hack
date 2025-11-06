const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Event = require('../models/Event');
const Participation = require('../models/Participation');
const User = require('../models/User');
const attendanceService = require('../services/attendanceService');
const { sendEmail, sendBulkEmail } = require('../services/emailService');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Admin/Faculty
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    // Get counts
    const totalStudents = await Student.countDocuments();
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'published' });
    const pendingApprovals = await Participation.countDocuments({ status: 'pending' });
    
    // Get eligible students count
    const eligibleStudents = await Student.countDocuments({ isEligible: true });

    // Calculate total volunteer hours
    const students = await Student.find();
    const totalHours = students.reduce((sum, student) => sum + student.totalVolunteerHours, 0);

    // Get recent activities
    const recentEvents = await Event.find()
      .sort('-createdAt')
      .limit(5)
      .select('title eventType createdAt status');

    const recentParticipations = await Participation.find()
      .sort('-createdAt')
      .limit(10)
      .populate('student', 'name')
      .populate('event', 'title')
      .select('status createdAt');

    // Monthly statistics for charts
    const currentYear = new Date().getFullYear();
    const monthlyStats = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);
      
      const monthEvents = await Event.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const monthParticipations = await Participation.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      monthlyStats.push({
        month: startDate.toLocaleString('default', { month: 'short' }),
        events: monthEvents,
        participations: monthParticipations
      });
    }

    res.json({
      totalStudents,
      totalEvents,
      totalHours,
      pendingApprovals,
      activeEvents,
      eligibleStudents,
      recentEvents,
      recentParticipations,
      monthlyStats
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// @route   GET /api/admin/pending-approvals
// @desc    Get all pending participation approvals
// @access  Admin/Faculty
router.get('/pending-approvals', auth, authorize('admin'), async (req, res) => {
  try {
    const participations = await Participation.find({ status: 'pending' })
      .populate('student', 'name registrationNumber department year attendancePercentage')
      .populate('event', 'title eventType startDate')
      .sort('-createdAt');

    const formattedData = participations.map(p => ({
      _id: p._id,
      student: {
        _id: p.student._id,
        name: p.student.name,
        registrationNumber: p.student.registrationNumber,
        department: p.student.department,
        year: p.student.year,
        isEligible: p.student.attendancePercentage >= 75
      },
      event: {
        _id: p.event._id,
        title: p.event.title,
        type: p.event.eventType,
        date: p.event.startDate
      },
      registeredAt: p.registeredAt,
      evidence: p.evidence,
      aiGeneratedReport: p.aiGeneratedReport
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Failed to fetch pending approvals' });
  }
});

// @route   POST /api/admin/bulk-approve
// @desc    Bulk approve participations
// @access  Admin/Faculty
router.post('/bulk-approve', auth, authorize('admin'), async (req, res) => {
  try {
    const { participationIds } = req.body;

    if (!participationIds || !Array.isArray(participationIds)) {
      return res.status(400).json({ message: 'Participation IDs array is required' });
    }

    const results = {
      approved: 0,
      failed: 0,
      errors: []
    };

    for (const id of participationIds) {
      try {
        const participation = await Participation.findById(id)
          .populate('student')
          .populate('event');

        if (!participation) {
          results.errors.push({ id, error: 'Not found' });
          results.failed++;
          continue;
        }

        participation.status = 'approved';
        participation.approvedAt = new Date();
        participation.approvedBy = req.user._id;
        participation.volunteerHours = participation.event.hoursAwarded;
        await participation.save();

        // Update student's total hours
        await participation.student.calculateTotalHours();

        // Send approval email
        await sendEmail(participation.student.email, 'participationApproved', {
          studentName: participation.student.name,
          eventTitle: participation.event.title,
          hoursAwarded: participation.event.hoursAwarded
        });

        results.approved++;
      } catch (error) {
        results.errors.push({ id, error: error.message });
        results.failed++;
      }
    }

    res.json({
      message: 'Bulk approval completed',
      ...results
    });
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({ message: 'Failed to bulk approve' });
  }
});

// @route   POST /api/admin/send-announcement
// @desc    Send announcement to students
// @access  Admin
router.post('/send-announcement', auth, authorize('admin'), async (req, res) => {
  try {
    const { subject, message, recipients } = req.body;

    let studentEmails = [];

    if (recipients === 'all') {
      const students = await Student.find().select('email');
      studentEmails = students.map(s => s.email);
    } else if (recipients === 'eligible') {
      const students = await Student.find({ isEligible: true }).select('email');
      studentEmails = students.map(s => s.email);
    } else if (recipients === 'not-eligible') {
      const students = await Student.find({ isEligible: false }).select('email');
      studentEmails = students.map(s => s.email);
    } else if (Array.isArray(recipients)) {
      studentEmails = recipients;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">NSS Announcement</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          This is an official communication from the NSS Activity Portal.
        </p>
      </div>
    `;

    const result = await sendBulkEmail(studentEmails, subject, htmlContent);

    // Also send via Socket.IO for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('announcement', {
        subject,
        message,
        timestamp: new Date()
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({ message: 'Failed to send announcement' });
  }
});

// @route   GET /api/admin/event-analytics
// @desc    Get detailed event analytics
// @access  Admin/Faculty
router.get('/event-analytics', auth, authorize('admin'), async (req, res) => {
  try {
    const events = await Event.find()
      .populate('participations')
      .sort('-startDate');

    const analytics = await Promise.all(events.map(async event => {
      const participations = await Participation.find({ event: event._id });
      
      return {
        eventId: event._id,
        title: event.title,
        type: event.eventType,
        date: event.startDate,
        status: event.status,
        stats: {
          registered: participations.length,
          approved: participations.filter(p => p.status === 'approved').length,
          pending: participations.filter(p => p.status === 'pending').length,
          rejected: participations.filter(p => p.status === 'rejected').length,
          attended: participations.filter(p => p.attendance).length,
          totalHours: participations.reduce((sum, p) => sum + (p.volunteerHours || 0), 0)
        }
      };
    }));

    // Event type distribution
    const typeDistribution = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});

    // Monthly event count
    const monthlyEvents = {};
    events.forEach(event => {
      const month = new Date(event.startDate).toISOString().slice(0, 7);
      monthlyEvents[month] = (monthlyEvents[month] || 0) + 1;
    });

    res.json({
      events: analytics,
      summary: {
        total: events.length,
        published: events.filter(e => e.status === 'published').length,
        completed: events.filter(e => e.status === 'completed').length,
        cancelled: events.filter(e => e.status === 'cancelled').length
      },
      typeDistribution,
      monthlyEvents
    });
  } catch (error) {
    console.error('Get event analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch event analytics' });
  }
});

// @route   GET /api/admin/student-analytics
// @desc    Get detailed student analytics
// @access  Admin/Faculty
router.get('/student-analytics', auth, authorize('admin'), async (req, res) => {
  try {
    const students = await Student.find().select('-password');

    // Department-wise distribution
    const departmentDistribution = students.reduce((acc, student) => {
      acc[student.department] = (acc[student.department] || 0) + 1;
      return acc;
    }, {});

    // Year-wise distribution
    const yearDistribution = students.reduce((acc, student) => {
      acc[`Year ${student.year}`] = (acc[`Year ${student.year}`] || 0) + 1;
      return acc;
    }, {});

    // Attendance distribution
    const attendanceRanges = {
      '0-25%': 0,
      '26-50%': 0,
      '51-75%': 0,
      '76-100%': 0
    };

    students.forEach(student => {
      const attendance = student.attendancePercentage;
      if (attendance <= 25) attendanceRanges['0-25%']++;
      else if (attendance <= 50) attendanceRanges['26-50%']++;
      else if (attendance <= 75) attendanceRanges['51-75%']++;
      else attendanceRanges['76-100%']++;
    });

    // Top volunteers
    const topVolunteers = students
      .sort((a, b) => b.totalVolunteerHours - a.totalVolunteerHours)
      .slice(0, 10)
      .map(s => ({
        name: s.name,
        registrationNumber: s.registrationNumber,
        department: s.department,
        hours: s.totalVolunteerHours
      }));

    res.json({
      totalStudents: students.length,
      eligibleStudents: students.filter(s => s.isEligible).length,
      averageAttendance: (students.reduce((sum, s) => sum + s.attendancePercentage, 0) / students.length).toFixed(2),
      averageVolunteerHours: (students.reduce((sum, s) => sum + s.totalVolunteerHours, 0) / students.length).toFixed(2),
      departmentDistribution,
      yearDistribution,
      attendanceRanges,
      topVolunteers
    });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch student analytics' });
  }
});

// @route   POST /api/admin/generate-reports
// @desc    Generate various administrative reports
// @access  Admin
router.post('/generate-reports', auth, authorize('admin'), async (req, res) => {
  try {
    const { reportType, filters } = req.body;

    let report;

    switch (reportType) {
      case 'attendance':
        report = await attendanceService.generateAttendanceReport(filters);
        break;
      
      case 'low-attendance':
        report = await attendanceService.getStudentsBelowThreshold(filters.threshold || 75);
        break;
      
      case 'event-summary':
        const events = await Event.find(filters).populate('participations');
        report = {
          events: events.map(e => ({
            title: e.title,
            type: e.eventType,
            date: e.startDate,
            participants: e.participations?.length || 0,
            status: e.status
          }))
        };
        break;
      
      case 'student-performance':
        const students = await Student.find(filters).select('-password');
        report = {
          students: students.map(s => ({
            name: s.name,
            registrationNumber: s.registrationNumber,
            department: s.department,
            year: s.year,
            attendance: s.attendancePercentage,
            volunteerHours: s.totalVolunteerHours,
            isEligible: s.isEligible
          }))
        };
        break;
      
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json({
      reportType,
      generatedAt: new Date(),
      data: report
    });
  } catch (error) {
    console.error('Generate reports error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Admin
router.put('/settings', auth, authorize('admin'), async (req, res) => {
  try {
    const { settings } = req.body;

    // Here you would typically save these settings to a Settings model
    // For now, we'll just return success

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;

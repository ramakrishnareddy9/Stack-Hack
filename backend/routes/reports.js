const express = require('express');
const jsPDF = require('jspdf');
const XLSX = require('xlsx');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Event = require('../models/Event');
const Participation = require('../models/Participation');
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const Report = require('../models/Report');
const { auth, authorize } = require('../middleware/auth');
const { analyzeStudentReport, generateConsolidatedReport, generateEventSummary } = require('../services/geminiService');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
    if (allowedTypes.some(type => file.mimetype.startsWith(type) || file.mimetype.includes(type))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const router = express.Router();

// @route   GET /api/reports/event/:id
// @desc    Generate event report PDF
// @access  Private (Admin/Faculty)
router.get('/event/:id', [auth, authorize('admin', 'faculty')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate({
        path: 'participations',
        populate: {
          path: 'student',
          select: 'name email studentId department'
        }
      });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const participations = await Participation.find({ event: event._id })
      .populate('student', 'name email studentId department year');

    const contributions = await Contribution.find({ event: event._id })
      .populate('student', 'name email studentId');

    // Generate PDF
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.text('NSS Event Report', 105, yPos, { align: 'center' });
    yPos += 15;

    // Event Details
    doc.setFontSize(12);
    doc.text(`Event: ${event.title}`, 20, yPos);
    yPos += 7;
    doc.text(`Type: ${event.eventType}`, 20, yPos);
    yPos += 7;
    doc.text(`Location: ${event.location}`, 20, yPos);
    yPos += 7;
    doc.text(`Start Date: ${new Date(event.startDate).toLocaleDateString()}`, 20, yPos);
    yPos += 7;
    doc.text(`End Date: ${new Date(event.endDate).toLocaleDateString()}`, 20, yPos);
    yPos += 7;
    doc.text(`Organizer: ${event.organizer.name}`, 20, yPos);
    yPos += 10;

    // Statistics
    doc.setFontSize(14);
    doc.text('Statistics', 20, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text(`Total Registrations: ${participations.length}`, 20, yPos);
    yPos += 7;
    doc.text(`Approved: ${participations.filter(p => p.status === 'approved' || p.status === 'attended' || p.status === 'completed').length}`, 20, yPos);
    yPos += 7;
    doc.text(`Attended: ${participations.filter(p => p.attendance).length}`, 20, yPos);
    yPos += 7;
    doc.text(`Total Volunteer Hours: ${contributions.reduce((sum, c) => sum + c.volunteerHours, 0)}`, 20, yPos);
    yPos += 10;

    // Participants List
    if (participations.length > 0) {
      doc.setFontSize(14);
      doc.text('Participants', 20, yPos);
      yPos += 7;
      doc.setFontSize(10);

      participations.forEach((part, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${index + 1}. ${part.student.name} (${part.student.studentId || 'N/A'}) - ${part.status}`, 25, yPos);
        yPos += 6;
      });
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="event-report-${event._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate event report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/certificate/:participationId
// @desc    Generate participation certificate PDF
// @access  Private
router.get('/certificate/:participationId', auth, async (req, res) => {
  try {
    const participation = await Participation.findById(req.params.participationId)
      .populate('student', 'name email studentId')
      .populate('event', 'title eventType startDate endDate');

    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    // Check authorization
    if (req.user.role === 'student' && participation.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (participation.status !== 'completed' && participation.status !== 'attended') {
      return res.status(400).json({ message: 'Cannot generate certificate for incomplete participation' });
    }

    // Generate Certificate PDF
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Border
    doc.setLineWidth(2);
    doc.rect(10, 10, width - 20, height - 20);

    // Title
    doc.setFontSize(24);
    doc.text('CERTIFICATE OF PARTICIPATION', width / 2, 50, { align: 'center' });

    // Body
    doc.setFontSize(14);
    doc.text('This is to certify that', width / 2, 80, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(participation.student.name.toUpperCase(), width / 2, 100, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(`Student ID: ${participation.student.studentId || 'N/A'}`, width / 2, 115, { align: 'center' });

    doc.text('has successfully participated in', width / 2, 135, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(participation.event.title, width / 2, 150, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Event Type: ${participation.event.eventType}`, width / 2, 165, { align: 'center' });
    doc.text(`Date: ${new Date(participation.event.startDate).toLocaleDateString()} - ${new Date(participation.event.endDate).toLocaleDateString()}`, width / 2, 175, { align: 'center' });

    if (participation.volunteerHours > 0) {
      doc.text(`Volunteer Hours: ${participation.volunteerHours}`, width / 2, 185, { align: 'center' });
    }

    doc.text('organized under the National Service Scheme (NSS)', width / 2, 200, { align: 'center' });

    // Signature lines
    doc.setFontSize(12);
    doc.text('_________________', 60, height - 40);
    doc.text('NSS Coordinator', 60, height - 35);

    doc.text('_________________', width - 60, height - 40, { align: 'right' });
    doc.text('Date', width - 60, height - 35, { align: 'right' });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${participation._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/annual-summary
// @desc    Generate annual NSS summary (PDF and Excel)
// @access  Private (Admin only)
router.get('/annual-summary', [auth, authorize('admin')], async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31`);

    // Get all events for the year
    const events = await Event.find({
      startDate: { $gte: startDate, $lte: endDate }
    });

    // Get all participations
    const participations = await Participation.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('student', 'name email studentId department year');

    // Get all contributions
    const contributions = await Contribution.find({
      submittedAt: { $gte: startDate, $lte: endDate }
    }).populate('student', 'name email studentId');

    // Get all students with their total hours
    const students = await User.find({
      role: 'student',
      contributions: { $exists: true, $ne: [] }
    });

    // Format query parameter
    const format = req.query.format || 'pdf';

    if (format === 'excel') {
      // Generate Excel
      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        ['NSS Annual Summary', currentYear],
        [],
        ['Total Events', events.length],
        ['Total Registrations', participations.length],
        ['Total Participants', new Set(participations.map(p => p.student._id.toString())).size],
        ['Total Volunteer Hours', contributions.reduce((sum, c) => sum + c.volunteerHours, 0)],
        [],
        ['Events by Type'],
        ...Object.entries(
          events.reduce((acc, e) => {
            acc[e.eventType] = (acc[e.eventType] || 0) + 1;
            return acc;
          }, {})
        ).map(([type, count]) => [type, count])
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Events Sheet
      const eventsData = [
        ['Title', 'Type', 'Location', 'Start Date', 'End Date', 'Participants', 'Status']
      ];
      events.forEach(event => {
        const eventParticipations = participations.filter(p => p.event.toString() === event._id.toString());
        eventsData.push([
          event.title,
          event.eventType,
          event.location,
          new Date(event.startDate).toLocaleDateString(),
          new Date(event.endDate).toLocaleDateString(),
          eventParticipations.length,
          event.status
        ]);
      });
      const eventsSheet = XLSX.utils.aoa_to_sheet(eventsData);
      XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Events');

      // Students Sheet
      const studentsData = [
        ['Name', 'Student ID', 'Department', 'Total Volunteer Hours', 'Events Participated']
      ];
      students.forEach(student => {
        const studentParticipations = participations.filter(p => p.student._id.toString() === student._id.toString());
        studentsData.push([
          student.name,
          student.studentId || 'N/A',
          student.department || 'N/A',
          student.totalVolunteerHours,
          studentParticipations.length
        ]);
      });
      const studentsSheet = XLSX.utils.aoa_to_sheet(studentsData);
      XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Students');

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="nss-annual-summary-${currentYear}.xlsx"`);
      res.send(excelBuffer);
    } else {
      // Generate PDF
      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(20);
      doc.text(`NSS Annual Summary ${currentYear}`, 105, yPos, { align: 'center' });
      yPos += 20;

      doc.setFontSize(14);
      doc.text('Overview', 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text(`Total Events: ${events.length}`, 20, yPos);
      yPos += 7;
      doc.text(`Total Registrations: ${participations.length}`, 20, yPos);
      yPos += 7;
      doc.text(`Total Participants: ${new Set(participations.map(p => p.student._id.toString())).size}`, 20, yPos);
      yPos += 7;
      doc.text(`Total Volunteer Hours: ${contributions.reduce((sum, c) => sum + c.volunteerHours, 0)}`, 20, yPos);
      yPos += 15;

      // Events by Type
      doc.setFontSize(14);
      doc.text('Events by Type', 20, yPos);
      yPos += 10;
      doc.setFontSize(12);

      const eventsByType = events.reduce((acc, e) => {
        acc[e.eventType] = (acc[e.eventType] || 0) + 1;
        return acc;
      }, {});

      Object.entries(eventsByType).forEach(([type, count]) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${type}: ${count}`, 25, yPos);
        yPos += 7;
      });

      yPos += 10;

      // Top Volunteers
      doc.setFontSize(14);
      doc.text('Top Volunteers', 20, yPos);
      yPos += 10;
      doc.setFontSize(12);

      const topVolunteers = students
        .sort((a, b) => b.totalVolunteerHours - a.totalVolunteerHours)
        .slice(0, 10);

      topVolunteers.forEach((student, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${index + 1}. ${student.name} - ${student.totalVolunteerHours} hours`, 25, yPos);
        yPos += 7;
      });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="nss-annual-summary-${currentYear}.pdf"`);
      res.send(pdfBuffer);
    }
  } catch (error) {
    console.error('Generate annual summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reports/student/submit
// @desc    Student submits event report with file uploads
// @access  Private (Student)
router.post('/student/submit', [auth, authorize('student'), upload.array('files', 5)], async (req, res) => {
  try {
    const { eventId, title, description, academicYear } = req.body;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Verify student participated in the event
    const participation = await Participation.findOne({
      student: req.user.id,
      event: eventId,
      status: { $in: ['attended', 'completed'] }
    });

    if (!participation) {
      return res.status(403).json({ message: 'You must have attended this event to submit a report' });
    }

    // Upload files to Cloudinary
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'nss-reports',
          resource_type: 'auto'
        });

        uploadedFiles.push({
          url: result.secure_url,
          publicId: result.public_id,
          fileName: file.originalname,
          fileType: file.mimetype
        });
      }
    }

    // Create report
    const report = await Report.create({
      student: req.user.id,
      event: eventId,
      title,
      description,
      files: uploadedFiles,
      academicYear: academicYear || new Date().getFullYear().toString(),
      status: 'submitted'
    });

    // Populate event details
    await report.populate('event', 'title startDate endDate location');
    await report.populate('student', 'name email studentId');

    // Analyze with Gemini AI (async, don't wait)
    analyzeStudentReport(report)
      .then(async (analysis) => {
        await Report.findByIdAndUpdate(report._id, {
          aiSummary: analysis.summary,
          aiAnalysis: {
            keyPoints: analysis.keyPoints,
            learnings: analysis.learnings,
            impact: analysis.impact,
            recommendations: analysis.recommendations,
            generatedAt: new Date()
          }
        });
        console.log(`✅ AI analysis completed for report ${report._id}`);
      })
      .catch(err => console.error('AI analysis failed:', err));

    res.status(201).json({
      message: 'Report submitted successfully. AI analysis in progress.',
      report
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/student/my-reports
// @desc    Get all reports submitted by the logged-in student
// @access  Private (Student)
router.get('/student/my-reports', auth, async (req, res) => {
  try {
    const reports = await Report.find({ student: req.user.id })
      .populate('event', 'title startDate endDate location')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Get student reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/admin/all
// @desc    Get all student reports (Admin)
// @access  Private (Admin/Faculty)
router.get('/admin/all', [auth, authorize('admin', 'faculty')], async (req, res) => {
  try {
    const { eventId, academicYear, status } = req.query;
    
    const query = {};
    if (eventId) query.event = eventId;
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('student', 'name email studentId department')
      .populate('event', 'title startDate endDate location')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reports/admin/analyze/:reportId
// @desc    Manually trigger AI analysis for a report
// @access  Private (Admin/Faculty)
router.post('/admin/analyze/:reportId', [auth, authorize('admin', 'faculty')], async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId)
      .populate('event', 'title')
      .populate('student', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const analysis = await analyzeStudentReport(report);

    const updatedReport = await Report.findByIdAndUpdate(
      report._id,
      {
        aiSummary: analysis.summary,
        aiAnalysis: {
          keyPoints: analysis.keyPoints,
          learnings: analysis.learnings,
          impact: analysis.impact,
          recommendations: analysis.recommendations,
          generatedAt: new Date()
        }
      },
      { new: true }
    );

    res.json({
      message: 'AI analysis completed',
      analysis: updatedReport.aiAnalysis,
      summary: updatedReport.aiSummary
    });
  } catch (error) {
    console.error('Analyze report error:', error);
    res.status(500).json({ message: 'Failed to analyze report', error: error.message });
  }
});

// @route   POST /api/reports/admin/generate-naac
// @desc    Generate NAAC report using Gemini AI
// @access  Private (Admin)
router.post('/admin/generate-naac', [auth, authorize('admin')], async (req, res) => {
  try {
    const { academicYear } = req.body;

    if (!academicYear) {
      return res.status(400).json({ message: 'Academic year is required' });
    }

    // Fetch all approved reports for the academic year
    const reports = await Report.find({
      academicYear,
      status: { $in: ['submitted', 'reviewed', 'approved'] }
    })
      .populate('student', 'name email studentId department')
      .populate('event', 'title startDate endDate location category eventType');

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found for this academic year' });
    }

    console.log(`📊 Generating NAAC report for ${academicYear} with ${reports.length} reports...`);

    const naacReport = await generateConsolidatedReport(reports, academicYear, 'NAAC');

    res.json({
      message: 'NAAC report generated successfully',
      report: naacReport
    });
  } catch (error) {
    console.error('Generate NAAC report error:', error);
    res.status(500).json({ message: 'Failed to generate NAAC report', error: error.message });
  }
});

// @route   POST /api/reports/admin/generate-ugc
// @desc    Generate UGC report using Gemini AI
// @access  Private (Admin)
router.post('/admin/generate-ugc', [auth, authorize('admin')], async (req, res) => {
  try {
    const { academicYear } = req.body;

    if (!academicYear) {
      return res.status(400).json({ message: 'Academic year is required' });
    }

    const reports = await Report.find({
      academicYear,
      status: { $in: ['submitted', 'reviewed', 'approved'] }
    })
      .populate('student', 'name email studentId department')
      .populate('event', 'title startDate endDate location category eventType');

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found for this academic year' });
    }

    console.log(`📊 Generating UGC report for ${academicYear} with ${reports.length} reports...`);

    const ugcReport = await generateConsolidatedReport(reports, academicYear, 'UGC');

    res.json({
      message: 'UGC report generated successfully',
      report: ugcReport
    });
  } catch (error) {
    console.error('Generate UGC report error:', error);
    res.status(500).json({ message: 'Failed to generate UGC report', error: error.message });
  }
});

// @route   POST /api/reports/admin/event-summary/:eventId
// @desc    Generate AI summary for specific event from all student reports
// @access  Private (Admin/Faculty)
router.post('/admin/event-summary/:eventId', [auth, authorize('admin', 'faculty')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const reports = await Report.find({
      event: req.params.eventId,
      status: { $in: ['submitted', 'reviewed', 'approved'] }
    }).populate('student', 'name email');

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found for this event' });
    }

    console.log(`📝 Generating summary for event ${event.title} with ${reports.length} reports...`);

    const summary = await generateEventSummary(reports, event);

    res.json({
      message: 'Event summary generated successfully',
      event: {
        id: event._id,
        title: event.title,
        date: `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`
      },
      totalReports: reports.length,
      summary
    });
  } catch (error) {
    console.error('Generate event summary error:', error);
    res.status(500).json({ message: 'Failed to generate event summary', error: error.message });
  }
});

// @route   PUT /api/reports/admin/review/:reportId
// @desc    Review and approve/reject student report
// @access  Private (Admin/Faculty)
router.put('/admin/review/:reportId', [auth, authorize('admin', 'faculty')], async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      {
        status,
        reviewNotes,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      { new: true }
    )
      .populate('student', 'name email')
      .populate('event', 'title');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      message: `Report ${status} successfully`,
      report
    });
  } catch (error) {
    console.error('Review report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


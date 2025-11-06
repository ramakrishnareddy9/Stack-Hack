const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, authorize } = require('../middleware/auth');
const attendanceService = require('../services/attendanceService');
const { sendEmail } = require('../services/emailService');

// Configure multer for file upload
const upload = multer({
  dest: 'temp/',
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'text/csv'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// @route   POST /api/attendance/import
// @desc    Import attendance from Excel/CSV file
// @access  Admin/Faculty
router.post('/import', auth, authorize('admin', 'faculty'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await attendanceService.importAttendanceFromExcel(req.file.path);

    // Clean up temp file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    // Send alerts to students below threshold
    if (result.successful > 0) {
      const lowAttendanceStudents = await attendanceService.getStudentsBelowThreshold(75);
      
      // Send email alerts to students with low attendance
      for (const student of lowAttendanceStudents.students) {
        await sendEmail(student.email, 'attendanceAlert', {
          studentName: student.name,
          currentAttendance: student.attendancePercentage,
        });
      }
    }

    res.json({
      message: 'Attendance imported successfully',
      ...result,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance/check/:regNumber
// @desc    Check student eligibility by registration number
// @access  Public (for verification)
router.get('/check/:regNumber', async (req, res) => {
  try {
    const result = await attendanceService.getAttendanceByRegistration(req.params.regNumber);
    
    if (!result.found) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance/eligibility/:studentId
// @desc    Check attendance eligibility for a specific student
// @access  Private
router.get('/eligibility/:studentId', auth, async (req, res) => {
  try {
    const result = await attendanceService.checkAttendanceEligibility(req.params.studentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/attendance/update/:studentId
// @desc    Update student attendance manually
// @access  Admin/Faculty
router.put('/update/:studentId', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { presentDays, totalDays } = req.body;

    if (!presentDays || !totalDays) {
      return res.status(400).json({ 
        message: 'Present days and total days are required' 
      });
    }

    const result = await attendanceService.updateStudentAttendance(
      req.params.studentId,
      { presentDays, totalDays }
    );

    // Send notification if eligibility status changed
    const student = result.student;
    if (student.isEligible !== result.previousEligibility) {
      await sendEmail(student.email, 'attendanceAlert', {
        studentName: student.name,
        currentAttendance: student.attendancePercentage,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance/report
// @desc    Generate attendance report
// @access  Admin/Faculty
router.get('/report', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const filters = {
      department: req.query.department,
      year: req.query.year ? parseInt(req.query.year) : undefined,
      minAttendance: req.query.minAttendance ? parseFloat(req.query.minAttendance) : undefined,
      maxAttendance: req.query.maxAttendance ? parseFloat(req.query.maxAttendance) : undefined,
    };

    const report = await attendanceService.generateAttendanceReport(filters);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance/below-threshold
// @desc    Get students below attendance threshold
// @access  Admin/Faculty
router.get('/below-threshold', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const threshold = req.query.threshold ? parseFloat(req.query.threshold) : 75;
    const result = await attendanceService.getStudentsBelowThreshold(threshold);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/attendance/bulk-check
// @desc    Check eligibility for multiple students
// @access  Admin/Faculty
router.post('/bulk-check', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ 
        message: 'Student IDs array is required' 
      });
    }

    const result = await attendanceService.bulkCheckEligibility(studentIds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/attendance/send-alerts
// @desc    Send attendance alerts to students below threshold
// @access  Admin
router.post('/send-alerts', auth, authorize('admin'), async (req, res) => {
  try {
    const { threshold = 75, department, year } = req.body;
    
    const lowAttendanceStudents = await attendanceService.getStudentsBelowThreshold(threshold);
    
    let filteredStudents = lowAttendanceStudents.students;
    
    // Apply filters if provided
    if (department) {
      filteredStudents = filteredStudents.filter(s => s.department === department);
    }
    if (year) {
      filteredStudents = filteredStudents.filter(s => s.year === year);
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send email alerts
    for (const student of filteredStudents) {
      try {
        await sendEmail(student.email, 'attendanceAlert', {
          studentName: student.name,
          currentAttendance: student.attendancePercentage,
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send alert to ${student.email}:`, error);
        failedCount++;
      }
    }

    res.json({
      message: 'Attendance alerts sent',
      totalStudents: filteredStudents.length,
      sent: sentCount,
      failed: failedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

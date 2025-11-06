const Student = require('../models/Student');
const AttendanceRecord = require('../models/AttendanceRecord');

/**
 * Middleware to check student attendance eligibility
 * Enforces the 75% attendance rule for event participation
 */
const checkAttendanceEligibility = async (req, res, next) => {
  try {
    const studentId = req.user.id || req.body.studentId;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required for attendance check'
      });
    }

    // Fetch student with attendance data
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if attendance data exists
    if (!student.attendancePercentage && student.attendancePercentage !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance data not available. Please contact administrator.'
      });
    }

    // Apply 75% rule
    const MINIMUM_ATTENDANCE = 75;
    
    if (student.attendancePercentage < MINIMUM_ATTENDANCE) {
      return res.status(403).json({
        success: false,
        message: `Registration denied: Your attendance is ${student.attendancePercentage.toFixed(2)}%. Minimum required attendance is ${MINIMUM_ATTENDANCE}%.`,
        data: {
          currentAttendance: student.attendancePercentage,
          requiredAttendance: MINIMUM_ATTENDANCE,
          shortBy: (MINIMUM_ATTENDANCE - student.attendancePercentage).toFixed(2)
        }
      });
    }

    // Student is eligible, attach to request
    req.eligibleStudent = {
      id: student._id,
      registrationNumber: student.registrationNumber,
      attendancePercentage: student.attendancePercentage,
      isEligible: true
    };

    next();
  } catch (error) {
    console.error('Attendance check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking attendance eligibility',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Import and update attendance from CSV/Excel
 * Admin-only function
 */
const updateAttendanceFromImport = async (req, res, next) => {
  try {
    const { attendanceData } = req.body;
    
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance data format'
      });
    }

    const updateResults = {
      successful: [],
      failed: [],
      notFound: []
    };

    for (const record of attendanceData) {
      const { registrationNumber, classesAttended, totalClasses, month, year } = record;
      
      // Validate data
      if (!registrationNumber || classesAttended === undefined || totalClasses === undefined) {
        updateResults.failed.push({
          registrationNumber,
          reason: 'Missing required fields'
        });
        continue;
      }

      // Calculate percentage
      const percentage = totalClasses > 0 ? (classesAttended / totalClasses) * 100 : 0;

      try {
        // Find student
        const student = await Student.findOne({ registrationNumber: registrationNumber.toUpperCase() });
        
        if (!student) {
          updateResults.notFound.push(registrationNumber);
          continue;
        }

        // Create or update attendance record
        const attendanceRecord = await AttendanceRecord.findOneAndUpdate(
          { 
            studentId: registrationNumber.toUpperCase(),
            month: month || new Date().getMonth() + 1,
            year: year || new Date().getFullYear()
          },
          {
            classesAttended,
            totalClasses,
            percentage: parseFloat(percentage.toFixed(2))
          },
          { 
            upsert: true, 
            new: true 
          }
        );

        // Update student's attendance percentage
        student.attendancePercentage = parseFloat(percentage.toFixed(2));
        student.isEligible = percentage >= 75;
        await student.save();

        updateResults.successful.push({
          registrationNumber,
          percentage: percentage.toFixed(2),
          eligible: percentage >= 75
        });
      } catch (error) {
        updateResults.failed.push({
          registrationNumber,
          reason: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Attendance import completed',
      results: updateResults,
      summary: {
        total: attendanceData.length,
        successful: updateResults.successful.length,
        failed: updateResults.failed.length,
        notFound: updateResults.notFound.length
      }
    });
  } catch (error) {
    console.error('Attendance import error:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing attendance data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get attendance status for a student
 */
const getAttendanceStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findOne({
      $or: [
        { _id: studentId },
        { registrationNumber: studentId.toUpperCase() }
      ]
    }).select('registrationNumber name attendancePercentage isEligible department year');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get detailed attendance records
    const attendanceRecords = await AttendanceRecord.find({
      studentId: student.registrationNumber
    }).sort({ year: -1, month: -1 }).limit(6);

    const eligibilityCheck = student.checkEligibility();

    res.status(200).json({
      success: true,
      data: {
        student: {
          registrationNumber: student.registrationNumber,
          name: student.name,
          department: student.department,
          year: student.year
        },
        attendance: {
          currentPercentage: student.attendancePercentage,
          isEligible: eligibilityCheck.eligible,
          eligibilityMessage: eligibilityCheck.reason || eligibilityCheck.message,
          minimumRequired: 75,
          shortBy: eligibilityCheck.shortBy || 0
        },
        monthlyRecords: attendanceRecords.map(record => ({
          month: record.month,
          year: record.year,
          percentage: record.percentage,
          classesAttended: record.classesAttended,
          totalClasses: record.totalClasses
        }))
      }
    });
  } catch (error) {
    console.error('Get attendance status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  checkAttendanceEligibility,
  updateAttendanceFromImport,
  getAttendanceStatus
};

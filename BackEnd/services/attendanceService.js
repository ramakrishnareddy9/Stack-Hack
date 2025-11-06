const xlsx = require('xlsx');
const Student = require('../models/Student');
const AttendanceRecord = require('../models/AttendanceRecord');

/**
 * Import attendance data from Excel file
 * Expected format: Registration Number | Student Name | Present Days | Total Days | Percentage
 */
const importAttendanceFromExcel = async (filePath) => {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const row of data) {
      try {
        const registrationNumber = row['Registration Number'] || row['Reg No'] || row['Registration_Number'];
        const presentDays = parseInt(row['Present Days'] || row['Present'] || 0);
        const totalDays = parseInt(row['Total Days'] || row['Total'] || 1);
        const percentage = parseFloat(row['Percentage'] || row['Attendance %'] || (presentDays / totalDays * 100));

        if (!registrationNumber) {
          results.errors.push(`Missing registration number in row`);
          results.failed++;
          continue;
        }

        // Update student attendance
        const student = await Student.findOne({ registrationNumber: registrationNumber.toUpperCase() });
        
        if (student) {
          // Update attendance percentage
          student.attendancePercentage = Math.min(100, Math.max(0, percentage));
          await student.save();

          // Create or update attendance record
          await AttendanceRecord.findOneAndUpdate(
            { student: student._id },
            {
              student: student._id,
              presentDays: presentDays,
              totalDays: totalDays,
              percentage: percentage,
              lastUpdated: new Date(),
              academicYear: new Date().getFullYear(),
              semester: getCurrentSemester()
            },
            { upsert: true, new: true }
          );

          results.successful++;
        } else {
          results.errors.push(`Student not found: ${registrationNumber}`);
          results.failed++;
        }
      } catch (error) {
        results.errors.push(`Error processing row: ${error.message}`);
        results.failed++;
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to import attendance: ${error.message}`);
  }
};

/**
 * Check if a student meets the 75% attendance requirement
 */
const checkAttendanceEligibility = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }

    const isEligible = student.attendancePercentage >= 75;
    
    return {
      eligible: isEligible,
      currentAttendance: student.attendancePercentage,
      requiredAttendance: 75,
      shortBy: isEligible ? 0 : (75 - student.attendancePercentage),
      message: isEligible 
        ? 'Student meets attendance requirement' 
        : `Student's attendance (${student.attendancePercentage}%) is below the required 75%`
    };
  } catch (error) {
    throw new Error(`Failed to check attendance eligibility: ${error.message}`);
  }
};

/**
 * Fetch attendance by registration number
 */
const getAttendanceByRegistration = async (registrationNumber) => {
  try {
    const student = await Student.findOne({ 
      registrationNumber: registrationNumber.toUpperCase() 
    });
    
    if (!student) {
      return {
        found: false,
        message: 'Student not found with this registration number'
      };
    }

    const attendanceRecord = await AttendanceRecord.findOne({ 
      student: student._id 
    });

    return {
      found: true,
      registrationNumber: student.registrationNumber,
      name: student.name,
      department: student.department,
      year: student.year,
      attendancePercentage: student.attendancePercentage,
      isEligible: student.isEligible,
      attendanceDetails: attendanceRecord ? {
        presentDays: attendanceRecord.presentDays,
        totalDays: attendanceRecord.totalDays,
        lastUpdated: attendanceRecord.lastUpdated,
        academicYear: attendanceRecord.academicYear,
        semester: attendanceRecord.semester
      } : null
    };
  } catch (error) {
    throw new Error(`Failed to fetch attendance: ${error.message}`);
  }
};

/**
 * Update single student attendance
 */
const updateStudentAttendance = async (studentId, attendanceData) => {
  try {
    const { presentDays, totalDays } = attendanceData;
    const percentage = (presentDays / totalDays) * 100;

    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Update student attendance percentage
    student.attendancePercentage = Math.min(100, Math.max(0, percentage));
    await student.save();

    // Update or create attendance record
    const attendanceRecord = await AttendanceRecord.findOneAndUpdate(
      { student: studentId },
      {
        student: studentId,
        presentDays: presentDays,
        totalDays: totalDays,
        percentage: percentage,
        lastUpdated: new Date(),
        academicYear: new Date().getFullYear(),
        semester: getCurrentSemester()
      },
      { upsert: true, new: true }
    );

    return {
      success: true,
      student: {
        id: student._id,
        name: student.name,
        registrationNumber: student.registrationNumber,
        attendancePercentage: student.attendancePercentage,
        isEligible: student.isEligible
      },
      attendanceRecord: attendanceRecord
    };
  } catch (error) {
    throw new Error(`Failed to update attendance: ${error.message}`);
  }
};

/**
 * Bulk check attendance eligibility
 */
const bulkCheckEligibility = async (studentIds) => {
  try {
    const results = await Promise.all(
      studentIds.map(async (studentId) => {
        const eligibility = await checkAttendanceEligibility(studentId);
        return {
          studentId,
          ...eligibility
        };
      })
    );

    return {
      total: results.length,
      eligible: results.filter(r => r.eligible).length,
      notEligible: results.filter(r => !r.eligible).length,
      details: results
    };
  } catch (error) {
    throw new Error(`Failed to bulk check eligibility: ${error.message}`);
  }
};

/**
 * Get students below attendance threshold
 */
const getStudentsBelowThreshold = async (threshold = 75) => {
  try {
    const students = await Student.find({
      attendancePercentage: { $lt: threshold }
    }).select('registrationNumber name email department year attendancePercentage');

    return {
      threshold: threshold,
      count: students.length,
      students: students.map(s => ({
        id: s._id,
        registrationNumber: s.registrationNumber,
        name: s.name,
        email: s.email,
        department: s.department,
        year: s.year,
        attendancePercentage: s.attendancePercentage,
        shortBy: threshold - s.attendancePercentage
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get students below threshold: ${error.message}`);
  }
};

/**
 * Generate attendance report
 */
const generateAttendanceReport = async (filters = {}) => {
  try {
    const query = {};
    
    if (filters.department) {
      query.department = filters.department;
    }
    if (filters.year) {
      query.year = filters.year;
    }
    if (filters.minAttendance !== undefined) {
      query.attendancePercentage = { $gte: filters.minAttendance };
    }
    if (filters.maxAttendance !== undefined) {
      query.attendancePercentage = { ...query.attendancePercentage, $lte: filters.maxAttendance };
    }

    const students = await Student.find(query)
      .select('registrationNumber name department year attendancePercentage isEligible')
      .sort({ attendancePercentage: -1 });

    const stats = {
      totalStudents: students.length,
      eligible: students.filter(s => s.isEligible).length,
      notEligible: students.filter(s => !s.isEligible).length,
      averageAttendance: students.length > 0 
        ? (students.reduce((sum, s) => sum + s.attendancePercentage, 0) / students.length).toFixed(2)
        : 0,
      highestAttendance: students.length > 0 ? students[0].attendancePercentage : 0,
      lowestAttendance: students.length > 0 ? students[students.length - 1].attendancePercentage : 0
    };

    return {
      filters: filters,
      stats: stats,
      students: students
    };
  } catch (error) {
    throw new Error(`Failed to generate attendance report: ${error.message}`);
  }
};

/**
 * Helper function to get current semester
 */
const getCurrentSemester = () => {
  const month = new Date().getMonth();
  // Assuming Jan-May is Spring semester, June-Dec is Fall semester
  return month < 5 ? 'Spring' : 'Fall';
};

module.exports = {
  importAttendanceFromExcel,
  checkAttendanceEligibility,
  getAttendanceByRegistration,
  updateStudentAttendance,
  bulkCheckEligibility,
  getStudentsBelowThreshold,
  generateAttendanceReport
};

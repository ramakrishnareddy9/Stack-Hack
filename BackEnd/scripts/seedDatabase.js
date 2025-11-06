const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Student = require('../models/Student');
const Event = require('../models/Event');
const Participation = require('../models/Participation');
const Contribution = require('../models/Contribution');
const AttendanceRecord = require('../models/AttendanceRecord');

// Sample data generators
const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];
const years = ['1st', '2nd', '3rd', '4th'];
const eventTypes = ['tree plantation', 'blood donation', 'cleanliness drive', 'awareness campaign', 'health camp', 'other'];
const locations = ['College Campus', 'City Hall', 'Community Center', 'Village Panchayat', 'Government School', 'Public Park', 'District Hospital', 'Rural Area'];

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Ananya', 'Diya', 'Isha', 'Kavya', 'Priya', 'Rohan', 'Rahul', 'Amit', 'Neha', 'Pooja', 'Ravi', 'Sneha', 'Vikram', 'Anjali', 'Karan'];
const lastNames = ['Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Gupta', 'Joshi', 'Nair', 'Iyer', 'Mehta', 'Shah', 'Rao', 'Desai', 'Kulkarni'];

const eventTitles = {
  'tree plantation': ['Monsoon Tree Plantation Drive', 'World Environment Day Plantation', 'Campus Greening Project', 'Van Mahotsav Celebration'],
  'blood donation': ['Annual Blood Donation Drive', 'Emergency Blood Donation Camp', 'Thalassemia Day Blood Donation', 'Voluntary Blood Donation Camp'],
  'cleanliness drive': ['Swachh Bharat Abhiyan', 'Beach Cleaning Drive', 'Campus Cleanliness Drive', 'Community Sanitation Program'],
  'awareness campaign': ['AIDS Awareness Campaign', 'Digital Literacy Campaign', 'Voter Awareness Program', 'Road Safety Awareness', 'Anti-Drug Campaign'],
  'health camp': ['Free Health Check-up Camp', 'Vaccination Camp', 'Nutrition Awareness Camp', 'Eye Check-up Camp', 'Dental Health Camp'],
  'other': ['Cultural Festival', 'Leadership Workshop', 'Skill Development Program', 'Community Service Project']
};

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName, lastName, type = 'student') {
  const domain = type === 'student' ? 'student.edu.in' : 'college.edu.in';
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

function generateRegistrationNumber(year, dept, index) {
  const yearCode = new Date().getFullYear().toString().slice(-2);
  const deptCode = dept.substring(0, 2).toUpperCase();
  return `${yearCode}${deptCode}${String(index).padStart(4, '0')}`;
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Seed functions
async function seedUsers() {
  console.log('🔄 Seeding users...');
  
  const users = [];
  const usedEmails = new Set();
  
  // Admin user
  users.push({
    name: 'NSS Admin',
    email: 'admin@nssportal.com',
    password: await bcrypt.hash('Admin@123456', 10),
    role: 'admin',
    department: 'NSS Office',
    isActive: true
  });
  usedEmails.add('admin@nssportal.com');

  // Faculty role removed - only admin and students now

  await User.insertMany(users);
  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedStudents() {
  console.log('🔄 Seeding students...');
  
  const students = [];
  let regIndex = 1;
  const usedEmails = new Set();

  // Create 50 students
  for (let i = 0; i < 50; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const department = getRandomElement(departments);
    const year = getRandomElement(years);
    const yearNum = parseInt(year.charAt(0));
    
    // Ensure unique email
    let email = generateEmail(firstName, lastName, 'student');
    let emailSuffix = 1;
    while (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailSuffix}@student.edu.in`;
      emailSuffix++;
    }
    usedEmails.add(email);
    
    // Generate attendance percentage (60% to 100%)
    const attendancePercentage = getRandomNumber(60, 100);
    const isEligible = attendancePercentage >= 75;

    const student = {
      name: `${firstName} ${lastName}`,
      email: email,
      password: await bcrypt.hash('Student@123', 10),
      registrationNumber: generateRegistrationNumber(yearNum, department, regIndex++),
      department: department,
      year: yearNum,
      phoneNumber: `98${getRandomNumber(10000000, 99999999)}`,
      attendancePercentage: attendancePercentage,
      isEligible: isEligible,
      totalVolunteerHours: getRandomNumber(0, 100),
      dateOfBirth: new Date(2000 + getRandomNumber(0, 5), getRandomNumber(0, 11), getRandomNumber(1, 28)),
      address: `${getRandomNumber(1, 999)}, ${getRandomElement(['MG Road', 'Park Street', 'Main Street', 'Gandhi Nagar'])}, City`,
      bloodGroup: getRandomElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])
    };

    students.push(student);
  }

  const insertedStudents = await Student.insertMany(students);
  console.log(`✅ Created ${insertedStudents.length} students`);
  
  // Create attendance records
  await seedAttendanceRecords(insertedStudents);
  
  return insertedStudents;
}

async function seedAttendanceRecords(students) {
  console.log('🔄 Seeding attendance records...');
  
  const records = [];
  const currentDate = new Date();
  
  for (const student of students) {
    // Create monthly attendance records for the past 6 months
    for (let i = 0; i < 6; i++) {
      const month = currentDate.getMonth() - i;
      const year = currentDate.getFullYear();
      const totalClasses = 25; // Assume 25 working days per month
      const classesAttended = Math.floor((student.attendancePercentage / 100) * totalClasses);
      
      records.push({
        studentId: student.registrationNumber,
        month: month < 0 ? 12 + month : month + 1,
        year: month < 0 ? year - 1 : year,
        totalClasses: totalClasses,
        classesAttended: classesAttended,
        percentage: student.attendancePercentage
      });
    }
  }

  await AttendanceRecord.insertMany(records);
  console.log(`✅ Created ${records.length} attendance records`);
}

async function seedEvents(users) {
  console.log('🔄 Seeding events...');
  
  const events = [];
  // Fetch admin users from database to get their _id (faculty role removed)
  const dbUsers = await User.find({ role: 'admin' });
  const organizers = dbUsers;
  const currentDate = new Date();
  
  // Create 30 events (past, ongoing, and future)
  for (let i = 0; i < 30; i++) {
    const eventType = getRandomElement(eventTypes);
    const title = getRandomElement(eventTitles[eventType]);
    const daysOffset = getRandomNumber(-90, 60); // Events from 90 days ago to 60 days in future
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() + daysOffset);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + getRandomNumber(1, 3));
    
    const registrationDeadline = new Date(startDate);
    registrationDeadline.setDate(registrationDeadline.getDate() - getRandomNumber(3, 10));
    
    let status;
    if (daysOffset < -7) status = 'completed';
    else if (daysOffset < 0) status = 'ongoing';
    else status = 'published';

    const event = {
      title: `${title} ${new Date().getFullYear()}`,
      description: `Join us for an enriching ${eventType.toLowerCase()} focused on community development and social awareness. This event aims to create positive impact and foster community engagement.`,
      eventType: eventType,
      category: getRandomElement(['Social', 'Educational', 'Environmental', 'Health', 'Cultural']),
      startDate: startDate,
      endDate: endDate,
      registrationDeadline: registrationDeadline,
      location: getRandomElement(locations),
      venue: `${getRandomElement(['Hall A', 'Hall B', 'Auditorium', 'Ground', 'Room 101'])}`,
      maxParticipants: getRandomNumber(20, 100),
      currentParticipants: 0,
      organizer: getRandomElement(organizers)._id,
      coordinators: [getRandomElement(organizers)._id],
      status: status,
      hoursAwarded: getRandomNumber(2, 8),
      requirements: [
        'Valid student ID card',
        'NSS membership',
        'Attendance above 75%'
      ],
      images: [],
      approvalRequired: true,
      certificateTemplate: 'default'
    };

    events.push(event);
  }

  const insertedEvents = await Event.insertMany(events);
  console.log(`✅ Created ${insertedEvents.length} events`);
  return insertedEvents;
}

async function seedParticipations(students, events) {
  console.log('🔄 Seeding participations...');
  
  const participations = [];
  const statuses = ['pending', 'approved', 'rejected', 'completed'];
  
  // Each eligible student participates in 3-8 events
  for (const student of students) {
    if (!student.isEligible) continue; // Only eligible students can participate
    
    const numEvents = getRandomNumber(3, 8);
    const selectedEvents = [];
    
    // Select random unique events
    while (selectedEvents.length < numEvents && selectedEvents.length < events.length) {
      const event = events[getRandomNumber(0, events.length - 1)];
      const eventExists = selectedEvents.some(e => e._id.equals(event._id));
      if (!eventExists) {
        selectedEvents.push(event);
      }
    }

    for (const event of selectedEvents) {
      let status;
      if (event.status === 'completed') {
        status = getRandomElement(['approved', 'completed']);
      } else if (event.status === 'ongoing') {
        status = getRandomElement(['approved', 'pending']);
      } else {
        status = getRandomElement(['pending', 'approved']);
      }

      const participation = {
        student: student._id,
        event: event._id,
        status: status,
        registeredAt: new Date(event.startDate.getTime() - getRandomNumber(5, 15) * 24 * 60 * 60 * 1000),
        attendance: status === 'completed' || status === 'approved' ? true : false,
        volunteerHours: status === 'completed' || status === 'approved' ? event.hoursAwarded : 0,
        feedback: status === 'completed' ? `Great experience! The ${event.eventType.toLowerCase()} was very informative and well-organized.` : null,
        rating: status === 'completed' ? getRandomNumber(3, 5) : null
      };

      if (status === 'approved' || status === 'completed') {
        participation.approvedAt = new Date(event.startDate.getTime() - getRandomNumber(1, 3) * 24 * 60 * 60 * 1000);
      }

      if (status === 'rejected') {
        participation.rejectionReason = 'Attendance below required threshold';
      }

      participations.push(participation);
      
      // Update event participant count
      if (status !== 'rejected') {
        await Event.findByIdAndUpdate(event._id, {
          $inc: { currentParticipants: 1 }
        });
      }
    }
  }

  const insertedParticipations = await Participation.insertMany(participations);
  console.log(`✅ Created ${insertedParticipations.length} participations`);
  
  // Update student total hours
  await updateStudentHours(students);
  
  return insertedParticipations;
}

async function updateStudentHours(students) {
  console.log('🔄 Updating student volunteer hours...');
  
  for (const student of students) {
    const participations = await Participation.find({
      student: student._id,
      status: { $in: ['approved', 'completed'] }
    });

    const totalHours = participations.reduce((sum, p) => sum + (p.volunteerHours || 0), 0);
    
    await Student.findByIdAndUpdate(student._id, {
      totalVolunteerHours: totalHours
    });
  }
  
  console.log('✅ Updated student volunteer hours');
}

async function seedContributions(students, events) {
  console.log('🔄 Seeding contributions...');
  
  const contributions = [];
  
  // Create 20 sample contributions
  for (let i = 0; i < 20; i++) {
    const student = getRandomElement(students);
    const event = getRandomElement(events.filter(e => e.status === 'completed'));
    
    if (!event) continue;

    const contribution = {
      student: student._id,
      event: event._id,
      title: `${event.eventType} Contribution Report`,
      description: `Detailed report of activities and contributions made during ${event.title}. Participated actively in organizing and executing the event successfully.`,
      type: getRandomElement(['Report', 'Documentation', 'Media', 'Feedback']),
      files: [],
      submittedAt: new Date(event.endDate.getTime() + getRandomNumber(1, 5) * 24 * 60 * 60 * 1000),
      status: getRandomElement(['pending', 'approved', 'rejected']),
      hoursContributed: getRandomNumber(2, 10)
    };

    contributions.push(contribution);
  }

  const insertedContributions = await Contribution.insertMany(contributions);
  console.log(`✅ Created ${insertedContributions.length} contributions`);
  return insertedContributions;
}

// Main seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nss-portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Event.deleteMany({});
    await Participation.deleteMany({});
    await Contribution.deleteMany({});
    await AttendanceRecord.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Seed data
    const users = await seedUsers();
    console.log('');
    
    const students = await seedStudents();
    console.log('');
    
    const events = await seedEvents(users);
    console.log('');
    
    const participations = await seedParticipations(students, events);
    console.log('');

    // Summary
    console.log('📊 SEEDING SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`👥 Users: ${users.length} (1 Admin)`);
    console.log(`🎓 Students: ${students.length}`);
    console.log(`📅 Events: ${events.length}`);
    console.log(`✋ Participations: ${participations.length}`);
    console.log(`📊 Attendance Records: ${students.length * 6}`);
    console.log('═══════════════════════════════════════');
    console.log('\n✅ Database seeding completed successfully!\n');

    console.log('🔐 DEFAULT LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════');
    console.log('Admin Account:');
    console.log('  Email: admin@nssportal.com');
    console.log('  Password: Admin@123456');
    console.log('\nStudent Accounts:');
    console.log('  Email: [firstname].[lastname]@student.edu.in');
    console.log('  Password: Student@123');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();

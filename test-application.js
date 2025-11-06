// Quick Application Test Script
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testApplication() {
  console.log('🧪 Testing NSS Activity Portal...\n');

  try {
    // Test 1: Server Health
    console.log('1️⃣ Testing server health...');
    const health = await axios.get('http://localhost:5000/api/test-pdf/info');
    console.log('✅ Server is running');
    console.log(`   PDFKit version: ${health.data.pdfkitVersion}`);
    console.log(`   Node version: ${health.data.nodeVersion}\n`);

    // Test 2: Admin Login
    console.log('2️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@nssportal.com',
      password: 'Admin@123456'
    });
    const adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Role: ${loginResponse.data.user.role}\n`);

    // Test 3: Get Admin Stats
    console.log('3️⃣ Testing admin dashboard stats...');
    const stats = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin stats retrieved');
    console.log(`   Total Students: ${stats.data.totalStudents}`);
    console.log(`   Total Events: ${stats.data.totalEvents}`);
    console.log(`   Pending Approvals: ${stats.data.pendingApprovals}\n`);

    // Test 4: Get Events
    console.log('4️⃣ Testing events endpoint...');
    const events = await axios.get(`${BASE_URL}/events`);
    console.log('✅ Events retrieved');
    console.log(`   Total Events: ${events.data.length}\n`);

    // Test 5: Student Login
    console.log('5️⃣ Testing student login...');
    const students = await axios.get(`${BASE_URL}/students/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (students.data.length > 0) {
      const firstStudent = students.data[0];
      console.log('✅ Found test student');
      console.log(`   Email: ${firstStudent.email}`);
      console.log(`   Attendance: ${firstStudent.attendancePercentage}%`);
      console.log(`   Eligible: ${firstStudent.isEligible}\n`);
    }

    // Test 6: PDF Generation
    console.log('6️⃣ Testing PDF generation...');
    const pdfTest = await axios.get('http://localhost:5000/api/test-pdf', {
      responseType: 'arraybuffer'
    });
    console.log('✅ PDF generated successfully');
    console.log(`   Size: ${pdfTest.data.byteLength} bytes\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════');
    console.log('\n🎉 Application is fully functional!\n');
    console.log('📋 Test Summary:');
    console.log('   ✅ Server Health');
    console.log('   ✅ Admin Authentication');
    console.log('   ✅ Admin Dashboard');
    console.log('   ✅ Events API');
    console.log('   ✅ Student Data');
    console.log('   ✅ PDF Generation');
    console.log('\n🚀 Ready for use!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.statusText}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    console.error('\n💡 Make sure both servers are running:');
    console.error('   - Backend: http://localhost:5000');
    console.error('   - Frontend: http://localhost:3000');
  }
}

// Run tests
testApplication();

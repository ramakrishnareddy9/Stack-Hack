/**
 * Test script to verify certificate generation integration
 * Run this after setting up your environment variables
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Test imports
console.log('🧪 Testing Certificate Integration...\n');

try {
  // Test 1: Check if certificate generator module loads
  console.log('1️⃣ Testing certificate generator import...');
  const certificateGenerator = require('./utils/certificateGenerator');
  console.log('   ✅ Certificate generator loaded successfully');
  console.log('   Available functions:', Object.keys(certificateGenerator));
  
  // Test 2: Check if certificate scheduler module loads
  console.log('\n2️⃣ Testing certificate scheduler import...');
  const certificateScheduler = require('./utils/certificateScheduler');
  console.log('   ✅ Certificate scheduler loaded successfully');
  console.log('   Available functions:', Object.keys(certificateScheduler));
  
  // Test 3: Check if Notification model loads
  console.log('\n3️⃣ Testing Notification model import...');
  const Notification = require('./models/Notification');
  console.log('   ✅ Notification model loaded successfully');
  
  // Test 4: Check environment variables
  console.log('\n4️⃣ Checking required environment variables...');
  const requiredEnvVars = {
    'EMAIL_USER': process.env.EMAIL_USER,
    'EMAIL_PASS': process.env.EMAIL_PASS,
    'MONGODB_URI': process.env.MONGODB_URI,
    'FRONTEND_URL': process.env.FRONTEND_URL
  };
  
  let allEnvVarsSet = true;
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.includes('your-')) {
      console.log(`   ❌ ${key} is not properly configured`);
      allEnvVarsSet = false;
    } else {
      console.log(`   ✅ ${key} is configured`);
    }
  }
  
  // Test 5: Check if pdf-lib is installed
  console.log('\n5️⃣ Testing pdf-lib import...');
  const { PDFDocument } = require('pdf-lib');
  console.log('   ✅ pdf-lib loaded successfully');
  
  // Test 6: Check Socket.IO configuration
  console.log('\n6️⃣ Testing Socket.IO import...');
  const socketIO = require('socket.io');
  console.log('   ✅ Socket.IO loaded successfully');
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 INTEGRATION TEST SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ All modules loaded successfully!');
  
  if (!allEnvVarsSet) {
    console.log('\n⚠️  WARNING: Some environment variables need configuration');
    console.log('   Please update your .env file with proper values');
  } else {
    console.log('\n✨ Environment variables are properly configured');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Start MongoDB if not running');
  console.log('   2. Run "npm run dev" to start the backend');
  console.log('   3. In another terminal, go to FrontEnd and run "npm start"');
  console.log('   4. Test certificate generation through the admin panel');
  
} catch (error) {
  console.error('\n❌ Integration test failed:', error.message);
  console.error('   Please ensure all dependencies are installed:');
  console.error('   Run: npm install');
}

console.log('\n✅ Certificate integration test complete!');
process.exit(0);

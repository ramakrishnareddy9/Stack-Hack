const mongoose = require('mongoose');
require('dotenv').config();

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const User = require('./models/User');
    
    // Find all admin users
    const admins = await User.find({ role: 'admin' }).select('name email role');
    
    console.log('📋 Admin Users in Database:');
    console.log('='.repeat(50));
    
    if (admins.length === 0) {
      console.log('❌ No admin users found!');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin User:`);
        console.log(`   Name: ${admin.name || 'N/A'}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n💡 Use the email shown above to login');
    console.log('   Password should be: Admin@123456 (from .env)');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmins();

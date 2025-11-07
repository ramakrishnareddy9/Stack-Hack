// Test email configuration
// Run with: node backend/utils/test-email.js

require('dotenv').config({ path: './backend/.env' });
const { sendEmail } = require('./notifications');

async function testEmail() {
  console.log('Testing email configuration...\n');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials not found in .env file');
    console.log('\nPlease add the following to backend/.env:');
    console.log('EMAIL_HOST=smtp.gmail.com');
    console.log('EMAIL_PORT=587');
    console.log('EMAIL_USER=your_email@gmail.com');
    console.log('EMAIL_PASS=your_app_password');
    return;
  }

  console.log('Email Configuration:');
  console.log(`  Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
  console.log(`  Port: ${process.env.EMAIL_PORT || 587}`);
  console.log(`  User: ${process.env.EMAIL_USER}`);
  console.log(`  Pass: ${process.env.EMAIL_PASS ? '***' : 'NOT SET'}\n`);

  const testEmail = process.env.EMAIL_USER; // Send to self for testing
  
  console.log(`Sending test email to: ${testEmail}...`);
  
  const result = await sendEmail(
    testEmail,
    'Test Email from NSS Portal',
    'This is a test email to verify email configuration.',
    '<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>'
  );

  if (result.success) {
    console.log('\n✅ Email sent successfully!');
    console.log(`Message ID: ${result.messageId}`);
  } else {
    console.log('\n❌ Email failed to send');
    console.log(`Error: ${result.error || result.message}`);
    if (result.code === 'EAUTH') {
      console.log('\n💡 Tip: For Gmail, you need to use an App Password, not your regular password.');
      console.log('   Generate one at: https://myaccount.google.com/apppasswords');
    }
  }
}

testEmail().catch(console.error);


const nodemailer = require('nodemailer');
const path = require('path');

// Ensure .env is loaded (in case this module is loaded before server.js)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configure email transporter
let transporter = null;

// Initialize transporter if credentials are available
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('📧 Initializing email transporter...');
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // For self-signed certificates
      }
    });

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
        if (error.code === 'EAUTH') {
          console.error('   Authentication failed. Check EMAIL_USER and EMAIL_PASS');
        } else if (error.code === 'ECONNECTION') {
          console.error('   Connection failed. Check EMAIL_HOST and EMAIL_PORT');
        }
      } else {
        console.log('✅ Email transporter is ready to send messages');
      }
    });
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
  }
} else {
  console.log('Email credentials not found. Email notifications will be disabled.');
  console.log('To enable emails, set EMAIL_USER and EMAIL_PASS in backend/.env file');
}

// Send email notification
const sendEmail = async (to, subject, text, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured. EMAIL_USER or EMAIL_PASS not set. Skipping email notification.');
      return { success: false, message: 'Email not configured' };
    }

    // Verify transporter is configured
    if (!transporter) {
      console.error('Email transporter not initialized');
      return { success: false, message: 'Email transporter not initialized' };
    }

    const mailOptions = {
      from: `"NSS Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    console.log(`Attempting to send email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email send error for ${to}:`, error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Check EMAIL_USER and EMAIL_PASS in .env file');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection failed. Check EMAIL_HOST and EMAIL_PORT in .env file');
    }
    return { success: false, error: error.message, code: error.code };
  }
};

// Send event registration confirmation
const sendRegistrationConfirmation = async (user, event) => {
  const subject = `Registration Confirmed: ${event.title}`;
  const text = `Dear ${user.name},\n\nYour registration for the event "${event.title}" has been received and is pending approval.\n\nEvent Details:\n- Type: ${event.eventType}\n- Location: ${event.location}\n- Date: ${new Date(event.startDate).toLocaleDateString()}\n\nYou will be notified once your registration is approved.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0ea5e9;">Registration Received</h2>
      <p>Dear ${user.name},</p>
      <p>Your registration for the event <strong>${event.title}</strong> has been received and is pending approval.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Type: ${event.eventType}</li>
          <li>Location: ${event.location}</li>
          <li>Date: ${new Date(event.startDate).toLocaleDateString()}</li>
        </ul>
      </div>
      <p>You will be notified once your registration is approved.</p>
    </div>
  `;

  return await sendEmail(user.email, subject, text, html);
};

// Send approval notification to approved participant
const sendApprovalNotification = async (user, event) => {
  console.log(`📧 Sending approval email to ${user.email} for event: ${event.title}`);
  
  if (!user.email) {
    console.warn(`⚠️ User ${user.name} has no email address, skipping approval email`);
    return { success: false, error: 'No email address' };
  }

  const subject = `Registration Approved: ${event.title}`;
  const text = `Dear ${user.name},\n\nYour registration for "${event.title}" has been approved!\n\nEvent Details:\n- Type: ${event.eventType}\n- Location: ${event.location}\n- Start Date: ${new Date(event.startDate).toLocaleDateString()}\n- End Date: ${new Date(event.endDate).toLocaleDateString()}\n\nPlease make sure to attend the event.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Registration Approved!</h2>
      <p>Dear ${user.name},</p>
      <p>Great news! Your registration for <strong>${event.title}</strong> has been approved!</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Type: ${event.eventType}</li>
          <li>Location: ${event.location}</li>
          <li>Start Date: ${new Date(event.startDate).toLocaleDateString()}</li>
          <li>End Date: ${new Date(event.endDate).toLocaleDateString()}</li>
        </ul>
      </div>
      <p>Please make sure to attend the event.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/profile" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View My Profile</a></p>
    </div>
  `;

  const result = await sendEmail(user.email, subject, text, html);
  if (result.success) {
    console.log(`✅ Approval email sent successfully to ${user.email}`);
  }
  return result;
};

// Send event reminder
const sendEventReminder = async (user, event, daysBefore = 1) => {
  const subject = `Reminder: ${event.title} in ${daysBefore} day(s)`;
  const text = `Dear ${user.name},\n\nThis is a reminder that you are registered for "${event.title}" which will start in ${daysBefore} day(s).\n\nEvent Details:\n- Type: ${event.eventType}\n- Location: ${event.location}\n- Start Date: ${new Date(event.startDate).toLocaleDateString()}\n- End Date: ${new Date(event.endDate).toLocaleDateString()}\n\nPlease ensure you are prepared for the event.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Event Reminder</h2>
      <p>Dear ${user.name},</p>
      <p>This is a reminder that you are registered for <strong>${event.title}</strong> which will start in ${daysBefore} day(s).</p>
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Type: ${event.eventType}</li>
          <li>Location: ${event.location}</li>
          <li>Start Date: ${new Date(event.startDate).toLocaleDateString()}</li>
          <li>End Date: ${new Date(event.endDate).toLocaleDateString()}</li>
        </ul>
      </div>
      <p>Please ensure you are prepared for the event.</p>
    </div>
  `;

  return await sendEmail(user.email, subject, text, html);
};

// Send contribution verification notification
const sendContributionVerified = async (user, contribution) => {
  const subject = `Contribution Verified: ${contribution.event?.title || 'Event'}`;
  const text = `Dear ${user.name},\n\nYour contribution for "${contribution.event?.title || 'Event'}" has been verified and ${contribution.volunteerHours} volunteer hours have been added to your account.\n\nYour total volunteer hours: ${user.totalVolunteerHours}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Contribution Verified</h2>
      <p>Dear ${user.name},</p>
      <p>Your contribution for <strong>${contribution.event?.title || 'Event'}</strong> has been verified and <strong>${contribution.volunteerHours}</strong> volunteer hours have been added to your account.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Your total volunteer hours: ${user.totalVolunteerHours}</strong></p>
      </div>
    </div>
  `;

  return await sendEmail(user.email, subject, text, html);
};

// Send new event notification to all registered students
const sendNewEventNotification = async (event, students) => {
  console.log(`\n📧 ===== Starting email notification for event: ${event.title} =====`);
  console.log(`📋 Total registered students to notify: ${students.length}`);
  
  // Check email configuration first
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not configured in .env file');
    console.error('   Email notifications will be skipped. Please configure email in backend/.env');
    return students.map(s => ({ 
      student: s.email || 'no-email', 
      studentName: s.name,
      success: false, 
      error: 'Email not configured' 
    }));
  }

  // Verify transporter is ready
  if (!transporter) {
    console.error('❌ Email transporter not initialized');
    console.error('   This usually means email credentials are invalid or transporter failed to initialize');
    return students.map(s => ({ 
      student: s.email || 'no-email', 
      studentName: s.name,
      success: false, 
      error: 'Email transporter not initialized' 
    }));
  }

  // Filter students with valid email addresses
  const studentsWithEmail = students.filter(s => s.email && s.email.trim() !== '');
  console.log(`📬 Students with valid email addresses: ${studentsWithEmail.length}`);
  
  if (studentsWithEmail.length === 0) {
    console.warn('⚠️ No students found with valid email addresses');
    return [];
  }
  
  console.log('✅ Email configuration verified, starting to send emails...');
  console.log(`   Using EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`   Transporter initialized: ${transporter ? 'Yes' : 'No'}`);

  const subject = `New NSS Event: ${event.title}`;
  const text = `Dear Student,\n\nA new NSS event "${event.title}" has been created!\n\nEvent Details:\n- Type: ${event.eventType}\n- Location: ${event.location}\n- Start Date: ${new Date(event.startDate).toLocaleDateString()}\n- End Date: ${new Date(event.endDate).toLocaleDateString()}\n- Registration Deadline: ${new Date(event.registrationDeadline).toLocaleDateString()}\n\nLog in to the NSS Portal to register for this event.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0ea5e9;">New NSS Event Created!</h2>
      <p>Dear Student,</p>
      <p>A new NSS event <strong>${event.title}</strong> has been created!</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Type: ${event.eventType}</li>
          <li>Location: ${event.location}</li>
          <li>Start Date: ${new Date(event.startDate).toLocaleDateString()}</li>
          <li>End Date: ${new Date(event.endDate).toLocaleDateString()}</li>
          <li>Registration Deadline: ${new Date(event.registrationDeadline).toLocaleDateString()}</li>
        </ul>
      </div>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/events" style="background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Event</a></p>
    </div>
  `;

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const student of studentsWithEmail) {
    try {
      const result = await sendEmail(student.email, subject, text, html);
      results.push({ 
        student: student.email, 
        studentName: student.name,
        success: result.success, 
        error: result.error 
      });
      
      if (result.success) {
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`  ✓ Sent ${successCount}/${studentsWithEmail.length} emails...`);
        }
      } else {
        failCount++;
        console.error(`  ✗ Failed to send email to ${student.email} (${student.name}):`, result.error);
      }
      
      // Small delay to avoid rate limiting (especially for Gmail)
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      failCount++;
      console.error(`  ✗ Error sending email to ${student.email} (${student.name}):`, error.message);
      results.push({ 
        student: student.email, 
        studentName: student.name,
        success: false, 
        error: error.message 
      });
    }
  }

  console.log(`\n📊 Email notification summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📧 Total attempted: ${studentsWithEmail.length}\n`);
  return results;
};

module.exports = {
  sendEmail,
  sendRegistrationConfirmation,
  sendApprovalNotification,
  sendEventReminder,
  sendContributionVerified,
  sendNewEventNotification
};


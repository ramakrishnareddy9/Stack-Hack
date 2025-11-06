const nodemailer = require('nodemailer');
const path = require('path');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (studentName) => ({
    subject: 'Welcome to NSS Activity Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to NSS Activity Portal!</h2>
        <p>Dear ${studentName},</p>
        <p>Your account has been successfully created. You can now:</p>
        <ul>
          <li>Register for NSS events</li>
          <li>Track your volunteer hours</li>
          <li>Submit participation evidence</li>
          <li>Download certificates</li>
        </ul>
        <p>Remember, you need to maintain at least 75% attendance to be eligible for event participation.</p>
        <p>Best regards,<br>NSS Coordination Team</p>
      </div>
    `
  }),

  eventRegistration: (studentName, eventTitle, eventDate) => ({
    subject: `Registration Confirmed: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Event Registration Confirmed!</h2>
        <p>Dear ${studentName},</p>
        <p>You have successfully registered for the following event:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">${eventTitle}</h3>
          <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(eventDate).toLocaleTimeString()}</p>
        </div>
        <p>Please ensure you attend the event and submit your participation evidence within 48 hours of event completion.</p>
        <p>Best regards,<br>NSS Coordination Team</p>
      </div>
    `
  }),

  eventReminder: (studentName, eventTitle, eventDate, hoursToEvent) => ({
    subject: `Reminder: ${eventTitle} in ${hoursToEvent} hours`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Event Reminder!</h2>
        <p>Dear ${studentName},</p>
        <p>This is a reminder that you are registered for:</p>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #2c3e50; margin-top: 0;">${eventTitle}</h3>
          <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(eventDate).toLocaleTimeString()}</p>
          <p><strong>Starting in:</strong> ${hoursToEvent} hours</p>
        </div>
        <p>Don't forget to bring any required materials mentioned in the event description.</p>
        <p>Best regards,<br>NSS Coordination Team</p>
      </div>
    `
  }),

  participationApproved: (studentName, eventTitle, hoursAwarded) => ({
    subject: `Participation Approved: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Participation Approved!</h2>
        <p>Dear ${studentName},</p>
        <p>Great news! Your participation in <strong>${eventTitle}</strong> has been approved.</p>
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p><strong>Volunteer Hours Awarded:</strong> ${hoursAwarded} hours</p>
          <p>These hours have been added to your total volunteer hours.</p>
        </div>
        <p>You can now download your participation certificate from the portal.</p>
        <p>Keep up the great work!</p>
        <p>Best regards,<br>NSS Coordination Team</p>
      </div>
    `
  }),

  participationRejected: (studentName, eventTitle, reason) => ({
    subject: `Participation Update: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Participation Review</h2>
        <p>Dear ${studentName},</p>
        <p>After reviewing your submission for <strong>${eventTitle}</strong>, we need additional information or corrections.</p>
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p><strong>Feedback:</strong> ${reason}</p>
        </div>
        <p>Please address the feedback and resubmit your evidence through the portal.</p>
        <p>If you have questions, please contact the NSS coordinator.</p>
        <p>Best regards,<br>NSS Coordination Team</p>
      </div>
    `
  }),

  attendanceAlert: (studentName, currentAttendance) => ({
    subject: 'Attendance Alert - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Attendance Alert</h2>
        <p>Dear ${studentName},</p>
        <p>Your current attendance is <strong>${currentAttendance}%</strong>, which is below the required 75% for NSS event participation.</p>
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p><strong>Required:</strong> 75%</p>
          <p><strong>Current:</strong> ${currentAttendance}%</p>
          <p><strong>Short by:</strong> ${75 - currentAttendance}%</p>
        </div>
        <p>Please improve your attendance to remain eligible for NSS activities.</p>
        <p>Best regards,<br>NSS Coordination Team</p>
      </div>
    `
  }),

  certificateReady: (studentName, eventTitle, certificateUrl) => ({
    subject: `Certificate Ready: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Certificate Available!</h2>
        <p>Dear ${studentName},</p>
        <p>Your participation certificate for <strong>${eventTitle}</strong> is now ready for download.</p>
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>You can download your certificate from the portal or use the link below:</p>
          <a href="${certificateUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Download Certificate</a>
        </div>
        <p>Congratulations on your contribution to community service!</p>
        <p>Best regards,<br>NSS Coordination Team</p>
      </div>
    `
  }),

  annualReport: (studentName, totalHours, totalEvents) => ({
    subject: 'Your NSS Annual Activity Report',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Annual NSS Activity Report</h2>
        <p>Dear ${studentName},</p>
        <p>Here's your NSS activity summary for the academic year:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #27ae60; margin-top: 0;">Your Achievements</h3>
          <p><strong>Total Volunteer Hours:</strong> ${totalHours} hours</p>
          <p><strong>Events Participated:</strong> ${totalEvents}</p>
        </div>
        <p>Your detailed annual report is available for download in the portal.</p>
        <p>Thank you for your dedication to community service!</p>
        <p>Best regards,<br>NSS Coordination Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, templateName, data) => {
  try {
    const transporter = createTransporter();
    const template = emailTemplates[templateName](
      data.studentName,
      data.eventTitle,
      data.eventDate,
      data.hoursToEvent,
      data.hoursAwarded,
      data.reason,
      data.currentAttendance,
      data.certificateUrl,
      data.totalHours,
      data.totalEvents
    );

    const mailOptions = {
      from: `NSS Portal <${process.env.EMAIL_USER}>`,
      to: to,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Bulk email function for announcements
const sendBulkEmail = async (recipients, subject, htmlContent) => {
  try {
    const transporter = createTransporter();
    const promises = recipients.map(recipient => {
      const mailOptions = {
        from: `NSS Portal <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: subject,
        html: htmlContent
      };
      return transporter.sendMail(mailOptions);
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: true,
      sent: successful,
      failed: failed,
      total: recipients.length
    };
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Schedule reminder emails
const scheduleEventReminders = async () => {
  // This function would be called by a cron job
  // to send reminders 24 hours and 2 hours before events
  const Event = require('../models/Event');
  const Participation = require('../models/Participation');
  
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Find events happening in 24 hours
    const events24h = await Event.find({
      startDate: {
        $gte: in24Hours,
        $lt: new Date(in24Hours.getTime() + 60 * 60 * 1000)
      },
      status: 'published'
    });

    // Find events happening in 2 hours
    const events2h = await Event.find({
      startDate: {
        $gte: in2Hours,
        $lt: new Date(in2Hours.getTime() + 60 * 60 * 1000)
      },
      status: 'published'
    });

    // Send reminders for each event
    for (const event of events24h) {
      const participations = await Participation.find({
        event: event._id,
        status: 'approved'
      }).populate('student');

      for (const participation of participations) {
        await sendEmail(
          participation.student.email,
          'eventReminder',
          {
            studentName: participation.student.name,
            eventTitle: event.title,
            eventDate: event.startDate,
            hoursToEvent: 24
          }
        );
      }
    }

    for (const event of events2h) {
      const participations = await Participation.find({
        event: event._id,
        status: 'approved'
      }).populate('student');

      for (const participation of participations) {
        await sendEmail(
          participation.student.email,
          'eventReminder',
          {
            studentName: participation.student.name,
            eventTitle: event.title,
            eventDate: event.startDate,
            hoursToEvent: 2
          }
        );
      }
    }

    return { success: true, message: 'Reminders sent successfully' };
  } catch (error) {
    console.error('Failed to send event reminders:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  scheduleEventReminders
};

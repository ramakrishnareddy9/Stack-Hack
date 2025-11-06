const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
const Event = require('../models/Event');
const Participation = require('../models/Participation');
const Notification = require('../models/Notification');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Generate a certificate for a single student
 * @param {Object} event - Event object
 * @param {Object} student - Student object
 * @param {Buffer} templateBuffer - PDF template buffer
 * @returns {Promise<Buffer>} - Generated certificate PDF buffer
 */
async function generateCertificate(event, student, templateBuffer) {
  try {
    // Load the template PDF
    const pdfDoc = await PDFDocument.load(templateBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Get page dimensions
    const { height } = firstPage.getSize();
    
    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Helper function to convert hex to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      } : { r: 0, g: 0, b: 0 };
    };
    
    // Format date
    const formatDate = (date) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };
    
    // Draw student name
    if (event.certificate.fields.name && event.certificate.fields.name.x !== undefined) {
      const nameColor = hexToRgb(event.certificate.fields.name.color || '#000000');
      firstPage.drawText(student.name || '', {
        x: event.certificate.fields.name.x,
        y: height - event.certificate.fields.name.y, // Convert to PDF coordinate system
        size: event.certificate.fields.name.fontSize || 24,
        font: font,
        color: rgb(nameColor.r, nameColor.g, nameColor.b),
      });
    }
    
    // Draw event name
    if (event.certificate.fields.eventName && event.certificate.fields.eventName.x !== undefined) {
      const eventColor = hexToRgb(event.certificate.fields.eventName.color || '#000000');
      firstPage.drawText(event.title || '', {
        x: event.certificate.fields.eventName.x,
        y: height - event.certificate.fields.eventName.y,
        size: event.certificate.fields.eventName.fontSize || 20,
        font: font,
        color: rgb(eventColor.r, eventColor.g, eventColor.b),
      });
    }
    
    // Draw date
    if (event.certificate.fields.date && event.certificate.fields.date.x !== undefined) {
      const dateColor = hexToRgb(event.certificate.fields.date.color || '#000000');
      const dateText = formatDate(event.endDate);
      firstPage.drawText(dateText, {
        x: event.certificate.fields.date.x,
        y: height - event.certificate.fields.date.y,
        size: event.certificate.fields.date.fontSize || 18,
        font: font,
        color: rgb(dateColor.r, dateColor.g, dateColor.b),
      });
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
}

/**
 * Send certificate via email
 * @param {Object} student - Student object
 * @param {Object} event - Event object
 * @param {Buffer} certificateBuffer - Certificate PDF buffer
 * @returns {Promise<Object>} - Email send result
 */
async function sendCertificateEmail(student, event, certificateBuffer) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: `Certificate for ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Congratulations ${student.name}!</h2>
          <p>Thank you for your participation in <strong>${event.title}</strong>.</p>
          <p>Please find your certificate of participation attached to this email.</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Event:</strong> ${event.title}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${event.location}</p>
          </div>
          <p>Keep up the great work in your NSS activities!</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            NSS Team
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Certificate_${student.name.replace(/\s+/g, '_')}_${event.title.replace(/\s+/g, '_')}.pdf`,
          content: certificateBuffer,
          contentType: 'application/pdf'
        }
      ]
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Certificate sent to ${student.email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send certificate to ${student.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send in-app notification about certificate
 * @param {Object} student - Student object
 * @param {Object} event - Event object
 * @param {Object} io - Socket.IO instance
 * @returns {Promise<void>}
 */
async function sendCertificateNotification(student, event, io) {
  try {
    // Create database notification
    await Notification.create({
      user: student._id,
      type: 'certificate',
      message: `Your certificate for "${event.title}" is ready!`,
      data: {
        eventId: event._id.toString(),
        eventTitle: event.title,
        certificateAvailable: true
      },
      read: false
    });
    
    // Send real-time notification if socket.io is available
    if (io) {
      const notificationData = {
        type: 'certificate',
        message: `Your certificate for "${event.title}" is ready and has been sent to your email!`,
        event: {
          id: event._id.toString(),
          title: event.title
        },
        timestamp: new Date()
      };
      
      io.to(`user-${student._id.toString()}`).emit('certificate-ready', notificationData);
    }
    
    console.log(`✅ In-app notification sent to ${student.name}`);
  } catch (error) {
    console.error(`❌ Failed to send notification to ${student.name}:`, error.message);
  }
}

/**
 * Generate and send certificates to all participated students
 * @param {String} eventId - Event ID
 * @param {Object} io - Socket.IO instance (optional)
 * @returns {Promise<Object>} - Generation summary
 */
async function generateAndSendCertificates(eventId, io = null) {
  try {
    console.log(`\n📜 ===== GENERATING CERTIFICATES FOR EVENT: ${eventId} =====`);
    
    // Fetch event with full details
    const event = await Event.findById(eventId).populate('organizer', 'name email');
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Check if certificate template is configured
    if (!event.certificate || !event.certificate.templateUrl) {
      throw new Error('Certificate template not configured for this event');
    }
    
    // Check if certificates already sent
    if (event.certificatesSent) {
      console.log('⚠️ Certificates already sent for this event');
      return { success: false, message: 'Certificates already sent' };
    }
    
    // Fetch all attended/completed participations
    const participations = await Participation.find({
      event: eventId,
      status: { $in: ['attended', 'completed'] }
    }).populate('student', 'name email studentId');
    
    if (participations.length === 0) {
      console.log('⚠️ No participated students found');
      return { success: false, message: 'No students to send certificates to' };
    }
    
    console.log(`📋 Found ${participations.length} students to receive certificates`);
    
    // Download template PDF
    let templateBuffer;
    if (event.certificate.templateUrl.startsWith('http')) {
      // If using Cloudinary or external URL
      const response = await fetch(event.certificate.templateUrl);
      templateBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      // If using local file
      const templatePath = path.join(__dirname, '..', event.certificate.templateUrl);
      templateBuffer = await fs.readFile(templatePath);
    }
    
    const results = {
      total: participations.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Generate and send certificates
    for (const participation of participations) {
      try {
        const student = participation.student;
        console.log(`\n📄 Generating certificate for: ${student.name} (${student.email})`);
        
        // Generate certificate
        const certificateBuffer = await generateCertificate(event, student, templateBuffer);
        
        // Send via email
        const emailResult = await sendCertificateEmail(student, event, certificateBuffer);
        
        // Send in-app notification
        await sendCertificateNotification(student, event, io);
        
        if (emailResult.success) {
          results.successful++;
          console.log(`✅ Certificate successfully sent to ${student.name}`);
        } else {
          results.failed++;
          results.errors.push({
            student: student.name,
            email: student.email,
            error: emailResult.error
          });
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          student: participation.student.name,
          email: participation.student.email,
          error: error.message
        });
        console.error(`❌ Error processing certificate for ${participation.student.name}:`, error.message);
      }
    }
    
    // Mark certificates as sent
    event.certificatesSent = true;
    await event.save();
    
    console.log(`\n📊 Certificate Generation Summary:`);
    console.log(`   ✅ Successful: ${results.successful}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📧 Total: ${results.total}`);
    console.log(`\n📜 ===== CERTIFICATE GENERATION COMPLETE =====\n`);
    
    return {
      success: true,
      ...results
    };
    
  } catch (error) {
    console.error('❌ Certificate generation error:', error);
    throw error;
  }
}

module.exports = {
  generateCertificate,
  sendCertificateEmail,
  sendCertificateNotification,
  generateAndSendCertificates
};

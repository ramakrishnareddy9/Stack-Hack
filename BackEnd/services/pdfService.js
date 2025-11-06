const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');

class PDFService {
  constructor() {
    this.certificatesDir = path.join(__dirname, '../generated/certificates');
    this.reportsDir = path.join(__dirname, '../generated/reports');
    
    // Create directories if they don't exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.certificatesDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate participation certificate
   */
  async generateCertificate(data) {
    const { student, event, coordinator, certificateId, description } = data;
    const filename = `certificate_${certificateId}_${Date.now()}.pdf`;
    const filepath = path.join(this.certificatesDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 50
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Add decorative border
        this.addDecorativeBorder(doc);

        // Header with NSS Logo placeholder
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('NATIONAL SERVICE SCHEME', 0, 60, { align: 'center' });
        
        doc.fontSize(12)
           .font('Helvetica')
           .text('Ministry of Youth Affairs & Sports, Government of India', 0, 85, { align: 'center' });

        // Certificate Title
        doc.fontSize(28)
           .font('Helvetica-Bold')
           .fillColor('#1e40af')
           .text('CERTIFICATE OF PARTICIPATION', 0, 130, { align: 'center' });

        // Certificate Body
        doc.fontSize(14)
           .fillColor('#000000')
           .font('Helvetica')
           .text('This is to certify that', 0, 200, { align: 'center' });

        doc.fontSize(20)
           .font('Helvetica-Bold')
           .fillColor('#dc2626')
           .text(student.name.toUpperCase(), 0, 230, { align: 'center' });

        doc.fontSize(12)
           .fillColor('#000000')
           .font('Helvetica')
           .text(`Registration Number: ${student.registrationNumber}`, 0, 260, { align: 'center' });

        doc.fontSize(12)
           .text(`${student.department} - Year ${student.year}`, 0, 280, { align: 'center' });

        doc.fontSize(14)
           .text('has successfully participated in', 0, 310, { align: 'center' });

        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor('#059669')
           .text(`"${event.title}"`, 50, 340, { align: 'center', width: doc.page.width - 100 });

        doc.fontSize(12)
           .fillColor('#000000')
           .font('Helvetica')
           .text(`Category: ${event.eventType}`, 0, 380, { align: 'center' });

        doc.text(`Held on ${new Date(event.startDate).toLocaleDateString('en-IN')} at ${event.location}`, 0, 400, { align: 'center' });

        doc.text(`Contributing ${event.hoursAwarded} volunteer hours to community service`, 0, 420, { align: 'center' });

        // Description if provided
        if (description) {
          doc.fontSize(11)
             .font('Helvetica-Oblique')
             .text(description, 100, 450, { 
               align: 'center', 
               width: doc.page.width - 200,
               lineGap: 2
             });
        }

        // Signatures
        const signatureY = 520;
        
        // Coordinator signature
        doc.fontSize(12)
           .font('Helvetica')
           .text('___________________', 150, signatureY);
        doc.text('NSS Coordinator', 150, signatureY + 20);
        doc.fontSize(10)
           .text(coordinator.name, 150, signatureY + 35);

        // Principal/Director signature
        doc.fontSize(12)
           .text('___________________', doc.page.width - 250, signatureY);
        doc.text('Principal/Director', doc.page.width - 250, signatureY + 20);

        // Certificate ID and Date
        doc.fontSize(9)
           .fillColor('#666666')
           .text(`Certificate ID: ${certificateId}`, 50, doc.page.height - 60);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 50, doc.page.height - 45);

        // QR Code placeholder (for verification)
        doc.fontSize(8)
           .text('Scan for verification →', doc.page.width - 150, doc.page.height - 60);
        
        // Add QR code box
        doc.rect(doc.page.width - 100, doc.page.height - 90, 50, 50)
           .stroke();

        doc.end();

        stream.on('finish', async () => {
          try {
            // Upload to Cloudinary
            const uploadResult = await this.uploadToCloudinary(filepath, 'certificates');
            
            // Delete local file after upload
            fs.unlinkSync(filepath);
            
            resolve({
              success: true,
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
              certificateId: certificateId
            });
          } catch (uploadError) {
            reject(uploadError);
          }
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate detailed participation report
   */
  async generateParticipationReport(data) {
    const { student, event, participation, aiReport, evidence } = data;
    const filename = `report_${student.registrationNumber}_${event._id}_${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('NSS PARTICIPATION REPORT', { align: 'center' });

        doc.moveDown();
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666666')
           .text(`Report ID: RPT-${Date.now()}`, { align: 'right' });

        // Student Information
        doc.moveDown();
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('Student Information');
        
        doc.fontSize(11)
           .font('Helvetica');
        
        const studentInfo = [
          ['Name:', student.name],
          ['Registration Number:', student.registrationNumber],
          ['Department:', student.department],
          ['Year:', `Year ${student.year}`],
          ['Email:', student.email],
          ['Total Volunteer Hours:', `${student.totalVolunteerHours} hours`]
        ];

        studentInfo.forEach(([label, value]) => {
          doc.text(`${label} ${value}`, { indent: 20 });
        });

        // Event Details
        doc.moveDown();
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Event Details');
        
        doc.fontSize(11)
           .font('Helvetica');
        
        const eventInfo = [
          ['Title:', event.title],
          ['Category:', event.eventType],
          ['Date:', `${new Date(event.startDate).toLocaleDateString('en-IN')} to ${new Date(event.endDate).toLocaleDateString('en-IN')}`],
          ['Location:', event.location],
          ['Hours Awarded:', `${event.hoursAwarded} hours`],
          ['Status:', participation.status.toUpperCase()]
        ];

        eventInfo.forEach(([label, value]) => {
          doc.text(`${label} ${value}`, { indent: 20 });
        });

        // Participation Summary
        if (aiReport) {
          doc.moveDown();
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .text('Participation Summary');
          
          doc.fontSize(10)
             .font('Helvetica')
             .text(aiReport, {
               align: 'justify',
               indent: 20,
               lineGap: 2
             });
        }

        // Evidence Submitted
        if (evidence && evidence.length > 0) {
          doc.moveDown();
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .text('Evidence Submitted');
          
          doc.fontSize(10)
             .font('Helvetica');
          
          evidence.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.type}: Uploaded on ${new Date(item.uploadedAt).toLocaleDateString('en-IN')}`, { indent: 20 });
          });
        }

        // Approval Details
        if (participation.status === 'approved') {
          doc.moveDown();
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .text('Approval Details');
          
          doc.fontSize(10)
             .font('Helvetica');
          
          doc.text(`Approved on: ${new Date(participation.approvedAt).toLocaleDateString('en-IN')}`, { indent: 20 });
          if (participation.approvedBy) {
            doc.text(`Approved by: NSS Coordinator`, { indent: 20 });
          }
        }

        // Footer
        doc.fontSize(9)
           .fillColor('#666666')
           .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, doc.page.height - 50);

        doc.end();

        stream.on('finish', async () => {
          try {
            // Upload to Cloudinary
            const uploadResult = await this.uploadToCloudinary(filepath, 'reports');
            
            // Delete local file
            fs.unlinkSync(filepath);
            
            resolve({
              success: true,
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id
            });
          } catch (uploadError) {
            reject(uploadError);
          }
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate annual activity report
   */
  async generateAnnualReport(data) {
    const { student, year, events, totalHours, summary } = data;
    const filename = `annual_report_${student.registrationNumber}_${year}_${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Title Page
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .text('ANNUAL NSS ACTIVITY REPORT', 50, 100, { align: 'center' });
        
        doc.fontSize(16)
           .text(`Academic Year ${year}`, { align: 'center' });

        doc.moveDown(3);
        doc.fontSize(14)
           .font('Helvetica')
           .text(student.name, { align: 'center' });
        doc.text(student.registrationNumber, { align: 'center' });
        doc.text(`${student.department} - Year ${student.year}`, { align: 'center' });

        // Summary Statistics
        doc.addPage();
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('Summary Statistics');
        
        doc.moveDown();
        doc.fontSize(12)
           .font('Helvetica');
        
        const stats = [
          ['Total Events Participated:', events.length],
          ['Total Volunteer Hours:', `${totalHours} hours`],
          ['Average Hours per Event:', `${(totalHours / events.length).toFixed(1)} hours`],
          ['Attendance Percentage:', `${student.attendancePercentage}%`]
        ];

        stats.forEach(([label, value]) => {
          doc.text(`${label} ${value}`, { indent: 20 });
        });

        // Events Table
        doc.moveDown(2);
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('Events Participated');
        
        doc.moveDown();
        
        // Table headers
        doc.fontSize(10)
           .font('Helvetica-Bold');
        
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 200;
        const col3 = 350;
        const col4 = 450;

        doc.text('Event', col1, tableTop);
        doc.text('Category', col2, tableTop);
        doc.text('Date', col3, tableTop);
        doc.text('Hours', col4, tableTop);

        // Table rows
        doc.fontSize(9)
           .font('Helvetica');
        
        let yPosition = tableTop + 20;
        events.forEach(event => {
          if (yPosition > doc.page.height - 100) {
            doc.addPage();
            yPosition = 50;
          }
          
          doc.text(event.title.substring(0, 25), col1, yPosition);
          doc.text(event.eventType, col2, yPosition);
          doc.text(new Date(event.startDate).toLocaleDateString('en-IN'), col3, yPosition);
          doc.text(`${event.hoursAwarded}h`, col4, yPosition);
          
          yPosition += 20;
        });

        // Annual Summary
        if (summary) {
          doc.addPage();
          doc.fontSize(18)
             .font('Helvetica-Bold')
             .text('Annual Summary');
          
          doc.moveDown();
          doc.fontSize(11)
             .font('Helvetica')
             .text(summary, {
               align: 'justify',
               lineGap: 3
             });
        }

        // Footer
        doc.fontSize(9)
           .fillColor('#666666')
           .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, doc.page.height - 50);

        doc.end();

        stream.on('finish', async () => {
          try {
            const uploadResult = await this.uploadToCloudinary(filepath, 'annual-reports');
            fs.unlinkSync(filepath);
            
            resolve({
              success: true,
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id
            });
          } catch (uploadError) {
            reject(uploadError);
          }
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add decorative border to certificate
   */
  addDecorativeBorder(doc) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Outer border
    doc.lineWidth(3)
       .rect(30, 30, pageWidth - 60, pageHeight - 60)
       .stroke('#1e40af');
    
    // Inner border
    doc.lineWidth(1)
       .rect(40, 40, pageWidth - 80, pageHeight - 80)
       .stroke('#60a5fa');
  }

  /**
   * Upload PDF to Cloudinary
   */
  async uploadToCloudinary(filepath, folder) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filepath, {
        folder: `nss-portal/${folder}`,
        resource_type: 'auto',
        public_id: `${path.basename(filepath, '.pdf')}_${Date.now()}`
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }
}

module.exports = new PDFService();

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Participation = require('../models/Participation');
const Student = require('../models/Student');
const Event = require('../models/Event');
const pdfService = require('../services/pdfService');
const aiReportService = require('../services/aiReportService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads', 'certificates');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `template-${Date.now()}-${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   GET /api/certificates/config/:eventId
// @desc    Get certificate configuration for an event
// @access  Admin/Faculty
router.get('/config/:eventId', auth, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      eventTitle: event.title,
      endDate: event.endDate,
      certificate: event.certificateConfig || {
        templateUrl: null,
        fields: {
          name: { x: 300, y: 250, fontSize: 24, color: '#000000' },
          eventName: { x: 300, y: 350, fontSize: 20, color: '#000000' },
          date: { x: 300, y: 450, fontSize: 18, color: '#000000' }
        },
        autoSend: true
      }
    });
  } catch (error) {
    console.error('Get certificate config error:', error);
    res.status(500).json({ message: 'Failed to fetch configuration' });
  }
});

// @route   POST /api/certificates/config/:eventId/upload
// @desc    Upload certificate template for an event
// @access  Admin/Faculty
router.post('/config/:eventId/upload', auth, authorize('admin'), upload.single('template'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Save template URL to event
    const templateUrl = `/uploads/certificates/${req.file.filename}`;
    event.certificateConfig = event.certificateConfig || {};
    event.certificateConfig.templateUrl = templateUrl;
    await event.save();

    res.json({
      success: true,
      templateUrl: templateUrl
    });
  } catch (error) {
    console.error('Upload template error:', error);
    res.status(500).json({ message: 'Failed to upload template' });
  }
});

// @route   POST /api/certificates/config/:eventId
// @desc    Save certificate configuration for an event
// @access  Admin/Faculty
router.post('/config/:eventId', auth, authorize('admin'), async (req, res) => {
  try {
    const { fields, autoSend } = req.body;
    
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update certificate configuration
    event.certificateConfig = {
      ...event.certificateConfig,
      fields,
      autoSend
    };

    await event.save();

    res.json({
      success: true,
      message: 'Configuration saved successfully',
      certificateConfig: event.certificateConfig
    });
  } catch (error) {
    console.error('Save certificate config error:', error);
    res.status(500).json({ message: 'Failed to save configuration' });
  }
});

// @route   POST /api/certificates/test/:eventId
// @desc    Generate test certificate for an event
// @access  Admin/Faculty
router.post('/test/:eventId', auth, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get a sample student for testing
    const student = await Student.findOne().limit(1);
    if (!student) {
      return res.status(404).json({ message: 'No students found for testing' });
    }

    const certificateData = {
      student: {
        name: student.name,
        registrationNumber: student.registrationNumber,
        department: student.department
      },
      event: {
        title: event.title,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate,
        hoursAwarded: event.hoursAwarded || 10
      },
      certificateId: `TEST-${Date.now()}`,
      fields: event.certificateConfig?.fields,
      templateUrl: event.certificateConfig?.templateUrl
    };

    const result = await pdfService.generateCertificate(certificateData);
    
    res.json({
      success: true,
      certificateUrl: result.url,
      certificateId: result.certificateId
    });
  } catch (error) {
    console.error('Test certificate error:', error);
    res.status(500).json({ message: 'Failed to generate test certificate' });
  }
});

// @route   POST /api/certificates/generate/:eventId
// @desc    Generate and send certificates for all approved participants
// @access  Admin/Faculty
router.post('/generate/:eventId', auth, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find all approved participations for this event
    const participations = await Participation.find({
      event: req.params.eventId,
      status: { $in: ['approved', 'completed'] }
    }).populate('student');

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const participation of participations) {
      try {
        // Generate certificate
        const certificateData = {
          student: participation.student,
          event: event,
          certificateId: `NSS-${Date.now()}-${participation._id.toString().slice(-6)}`,
          fields: event.certificateConfig?.fields,
          templateUrl: event.certificateConfig?.templateUrl
        };

        const result = await pdfService.generateCertificate(certificateData);
        
        // Save certificate URL to participation
        participation.certificateUrl = result.url;
        participation.certificateId = result.certificateId;
        await participation.save();

        // Send email if autoSend is enabled
        if (event.certificateConfig?.autoSend) {
          const { sendCertificateEmail } = require('../utils/certificateGenerator');
          await sendCertificateEmail(
            participation.student.email,
            participation.student.name,
            event.title,
            result.url
          );
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          student: participation.student.name,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Certificate generation completed',
      ...results
    });
  } catch (error) {
    console.error('Generate certificates error:', error);
    res.status(500).json({ message: 'Failed to generate certificates' });
  }
});

// @route   GET /api/certificates/my
// @desc    Get all certificates for logged-in student
// @access  Student
router.get('/my', auth, async (req, res) => {
  try {
    const participations = await Participation.find({
      student: req.user._id,
      status: { $in: ['approved', 'completed'] },
      certificateUrl: { $exists: true, $ne: null }
    })
    .populate('event')
    .sort('-createdAt');

    const certificates = participations.map(p => ({
      _id: p._id,
      participationId: p._id,
      eventTitle: p.event.title,
      eventType: p.event.eventType,
      eventDate: p.event.startDate,
      location: p.event.location,
      hoursAwarded: p.event.hoursAwarded || p.volunteerHours,
      certificateUrl: p.certificateUrl,
      certificateId: p.certificateId || `NSS-${p._id.toString().slice(-8)}`,
      issuedDate: p.approvedAt || p.updatedAt,
      verificationId: `${p._id}-${Date.now()}`,
      description: p.event.description
    }));

    res.json(certificates);
  } catch (error) {
    console.error('Fetch certificates error:', error);
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
});

// @route   GET /api/certificates/:id/download
// @desc    Download a specific certificate
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const participation = await Participation.findById(req.params.id)
      .populate('student')
      .populate('event');

    if (!participation) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Check if user owns this certificate or is admin
    if (participation.student._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate certificate if not exists
    if (!participation.certificateUrl) {
      const certificateData = {
        student: participation.student,
        event: participation.event,
        coordinator: { name: 'NSS Coordinator' },
        certificateId: `NSS-${Date.now()}-${participation._id.toString().slice(-6)}`,
        description: await aiReportService.generateCertificateDescription(
          participation.student,
          participation.event,
          participation.student.totalVolunteerHours
        )
      };

      const result = await pdfService.generateCertificate(certificateData);
      participation.certificateUrl = result.url;
      participation.certificateId = result.certificateId;
      await participation.save();
    }

    // Redirect to certificate URL
    res.redirect(participation.certificateUrl);
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ message: 'Failed to download certificate' });
  }
});

// @route   GET /api/certificates/verify/:verificationId
// @desc    Verify certificate authenticity
// @access  Public
router.get('/verify/:verificationId', async (req, res) => {
  try {
    const participationId = req.params.verificationId.split('-')[0];
    
    const participation = await Participation.findById(participationId)
      .populate('student', 'name registrationNumber department')
      .populate('event', 'title eventType startDate');

    if (!participation || !participation.certificateUrl) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Certificate not found or invalid verification code' 
      });
    }

    res.json({
      valid: true,
      certificate: {
        studentName: participation.student.name,
        registrationNumber: participation.student.registrationNumber,
        eventTitle: participation.event.title,
        eventDate: participation.event.startDate,
        hoursAwarded: participation.volunteerHours,
        issuedDate: participation.approvedAt,
        certificateId: participation.certificateId
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Failed to verify certificate' 
    });
  }
});

// @route   POST /api/certificates/generate-bulk
// @desc    Generate certificates for multiple participations
// @access  Admin/Faculty
router.post('/generate-bulk', auth, authorize('admin'), async (req, res) => {
  try {
    const { participationIds } = req.body;

    if (!participationIds || !Array.isArray(participationIds)) {
      return res.status(400).json({ message: 'Participation IDs array is required' });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const participationId of participationIds) {
      try {
        const participation = await Participation.findById(participationId)
          .populate('student')
          .populate('event');

        if (!participation) {
          results.failed.push({ id: participationId, reason: 'Not found' });
          continue;
        }

        if (participation.status !== 'approved' && participation.status !== 'completed') {
          results.failed.push({ id: participationId, reason: 'Not approved' });
          continue;
        }

        const certificateData = {
          student: participation.student,
          event: participation.event,
          coordinator: { name: 'NSS Coordinator' },
          certificateId: `NSS-${Date.now()}-${participation._id.toString().slice(-6)}`,
          description: await aiReportService.generateCertificateDescription(
            participation.student,
            participation.event,
            participation.student.totalVolunteerHours
          )
        };

        const result = await pdfService.generateCertificate(certificateData);
        
        participation.certificateUrl = result.url;
        participation.certificateId = result.certificateId;
        await participation.save();

        results.success.push({
          id: participationId,
          certificateUrl: result.url,
          certificateId: result.certificateId
        });
      } catch (error) {
        results.failed.push({ 
          id: participationId, 
          reason: error.message 
        });
      }
    }

    res.json({
      message: 'Bulk certificate generation completed',
      total: participationIds.length,
      success: results.success.length,
      failed: results.failed.length,
      results
    });
  } catch (error) {
    console.error('Bulk certificate generation error:', error);
    res.status(500).json({ message: 'Failed to generate certificates' });
  }
});

// @route   GET /api/certificates/download-all
// @desc    Download all certificates as a zip file
// @access  Student
router.get('/download-all', auth, async (req, res) => {
  try {
    const participations = await Participation.find({
      student: req.user._id,
      status: { $in: ['approved', 'completed'] },
      certificateUrl: { $exists: true, $ne: null }
    }).populate('event');

    if (participations.length === 0) {
      return res.status(404).json({ message: 'No certificates found' });
    }

    // Create a zip file containing all certificates
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.attachment(`NSS_Certificates_${req.user.name.replace(/\s+/g, '_')}_${Date.now()}.zip`);
    archive.pipe(res);

    for (const participation of participations) {
      if (participation.certificateUrl) {
        // Fetch certificate from URL and add to zip
        const axios = require('axios');
        const response = await axios.get(participation.certificateUrl, {
          responseType: 'stream'
        });
        
        const filename = `Certificate_${participation.event.title.replace(/[^a-z0-9]/gi, '_')}_${participation.certificateId}.pdf`;
        archive.append(response.data, { name: filename });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('Download all certificates error:', error);
    res.status(500).json({ message: 'Failed to download certificates' });
  }
});

// @route   DELETE /api/certificates/:id
// @desc    Delete a certificate (admin only)
// @access  Admin
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const participation = await Participation.findById(req.params.id);

    if (!participation) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Delete from Cloudinary if exists
    if (participation.certificateUrl) {
      const { deleteFromCloudinary } = require('../config/cloudinary');
      const publicId = participation.certificateUrl.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
    }

    participation.certificateUrl = null;
    participation.certificateId = null;
    await participation.save();

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ message: 'Failed to delete certificate' });
  }
});

module.exports = router;

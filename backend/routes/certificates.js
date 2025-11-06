const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');
const { generateAndSendCertificates } = require('../utils/certificateGenerator');

const router = express.Router();

// @route   GET /api/certificates/debug/:eventId
// @desc    Debug endpoint to check event configuration
// @access  Private (Admin/Faculty only)
router.get('/debug/:eventId', [
  auth,
  authorize('admin', 'faculty')
], async (req, res) => {
  try {
    console.log('\n🔍 Debug Request for Event ID:', req.params.eventId);
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const debug = {
      eventId: event._id,
      eventTitle: event.title,
      hasCertificate: !!event.certificate,
      hasTemplateUrl: !!event.certificate?.templateUrl,
      templateUrl: event.certificate?.templateUrl || null,
      hasFields: !!event.certificate?.fields,
      fields: event.certificate?.fields || null,
      autoSend: event.certificate?.autoSend,
      certificatesSent: event.certificatesSent
    };
    
    console.log('Debug Info:', JSON.stringify(debug, null, 2));
    res.json(debug);
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Configure multer for PDF upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/certificates');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'certificate-template-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// @route   POST /api/certificates/upload-template/:eventId
// @desc    Upload certificate template for an event
// @access  Private (Admin/Faculty only)
router.post('/upload-template/:eventId', [
  auth,
  authorize('admin', 'faculty'),
  upload.single('template')
], async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Delete old template if exists
    if (event.certificate && event.certificate.templateUrl) {
      const oldPath = path.join(__dirname, '..', event.certificate.templateUrl);
      try {
        await fs.unlink(oldPath);
      } catch (error) {
        console.log('Old template file not found or already deleted');
      }
    }
    
    // Save template URL to event
    const templateUrl = `/uploads/certificates/${req.file.filename}`;
    
    if (!event.certificate) {
      event.certificate = {};
    }
    
    event.certificate.templateUrl = templateUrl;
    await event.save();
    
    res.json({
      message: 'Certificate template uploaded successfully',
      templateUrl: templateUrl,
      event: event
    });
  } catch (error) {
    console.error('Upload template error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/certificates/configure/:eventId
// @desc    Configure certificate field coordinates
// @access  Private (Admin/Faculty only)
router.put('/configure/:eventId', [
  auth,
  authorize('admin', 'faculty')
], async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const { fields, autoSend } = req.body;
    
    if (!event.certificate) {
      event.certificate = {};
    }
    
    // Update field coordinates
    if (fields) {
      event.certificate.fields = {
        name: fields.name || event.certificate.fields?.name || {},
        eventName: fields.eventName || event.certificate.fields?.eventName || {},
        date: fields.date || event.certificate.fields?.date || {}
      };
    }
    
    if (autoSend !== undefined) {
      event.certificate.autoSend = autoSend;
    }
    
    await event.save();
    
    res.json({
      message: 'Certificate configuration updated successfully',
      certificate: event.certificate
    });
  } catch (error) {
    console.error('Configure certificate error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/certificates/config/:eventId
// @desc    Get certificate configuration for an event
// @access  Private (Admin/Faculty only)
router.get('/config/:eventId', [
  auth,
  authorize('admin', 'faculty')
], async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({
      certificate: event.certificate || null,
      eventTitle: event.title,
      endDate: event.endDate
    });
  } catch (error) {
    console.error('Get certificate config error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/certificates/generate/:eventId
// @desc    Generate and send certificates to all participated students
// @access  Private (Admin/Faculty only)
router.post('/generate/:eventId', [
  auth,
  authorize('admin', 'faculty')
], async (req, res) => {
  try {
    console.log('\n📧 Generate Certificates Request for Event ID:', req.params.eventId);
    console.log('   User:', req.user?.name, req.user?.role);
    
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      console.log('❌ Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }
    
    console.log('✅ Event found:', event.title);
    console.log('   Certificate config:', event.certificate ? 'Yes' : 'No');
    
    // Check if certificate template is configured
    if (!event.certificate || !event.certificate.templateUrl) {
      console.log('❌ Certificate template not configured');
      return res.status(400).json({ 
        message: 'Certificate template not configured. Please upload a template first.',
        requiresSetup: true
      });
    }
    
    // Check if event has ended - allow manual generation for testing
    // const now = new Date();
    // if (new Date(event.endDate) > now) {
    //   return res.status(400).json({ 
    //     message: 'Cannot generate certificates before event ends',
    //     endDate: event.endDate 
    //   });
    // }
    
    // Get Socket.IO instance
    const io = req.app.get('io');
    
    // Generate and send certificates
    const result = await generateAndSendCertificates(req.params.eventId, io);
    
    res.json({
      message: 'Certificates generated and sent successfully',
      ...result
    });
  } catch (error) {
    console.error('Generate certificates error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/certificates/test-preview/:eventId
// @desc    Generate a test certificate preview
// @access  Private (Admin/Faculty only)
router.post('/test-preview/:eventId', [
  auth,
  authorize('admin', 'faculty')
], async (req, res) => {
  try {
    console.log('\n🧪 Test Preview Request for Event ID:', req.params.eventId);
    console.log('   User:', req.user?.name, req.user?.role);
    
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      console.log('❌ Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }
    
    console.log('✅ Event found:', event.title);
    console.log('   Certificate config:', event.certificate ? 'Yes' : 'No');
    if (event.certificate) {
      console.log('   Template URL:', event.certificate.templateUrl);
      console.log('   Fields configured:', event.certificate.fields ? 'Yes' : 'No');
    }
    
    if (!event.certificate || !event.certificate.templateUrl) {
      console.log('❌ Certificate template not configured');
      return res.status(400).json({ 
        message: 'Certificate template not configured. Please upload a template first.',
        requiresSetup: true 
      });
    }
    
    // Check if fields are configured
    if (!event.certificate.fields || 
        (!event.certificate.fields.name?.x && 
         !event.certificate.fields.eventName?.x && 
         !event.certificate.fields.date?.x)) {
      return res.status(400).json({ 
        message: 'Please configure field positions before generating preview',
        requiresFieldSetup: true 
      });
    }
    
    // Create test student data
    const testStudent = {
      name: req.body.testName || 'Sample Student Name',
      email: 'test@example.com',
      studentId: 'TEST123'
    };
    
    // Load template
    const { generateCertificate } = require('../utils/certificateGenerator');
    const templatePath = path.join(__dirname, '..', event.certificate.templateUrl);
    
    // Check if template file exists
    if (!await fs.stat(templatePath).catch(() => false)) {
      return res.status(400).json({ 
        message: 'Certificate template file not found. Please re-upload the template.',
        templateMissing: true 
      });
    }
    
    const templateBuffer = await fs.readFile(templatePath);
    
    // Generate test certificate
    const certificateBuffer = await generateCertificate(event, testStudent, templateBuffer);
    
    // Send as response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="test-certificate.pdf"'
    });
    res.send(certificateBuffer);
    
  } catch (error) {
    console.error('Test preview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Participation = require('../models/Participation');
const Student = require('../models/Student');
const Event = require('../models/Event');
const pdfService = require('../services/pdfService');
const aiReportService = require('../services/aiReportService');

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
router.post('/generate-bulk', auth, authorize('admin', 'faculty'), async (req, res) => {
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

const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @route   GET /api/test-pdf
// @desc    Test PDF generation
// @access  Public (for testing)
router.get('/', async (req, res) => {
  try {
    // Create a simple PDF
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=test-certificate.pdf');
    
    // Pipe the PDF directly to response
    doc.pipe(res);
    
    // Add content
    doc.fontSize(25)
       .text('NSS Activity Portal', 100, 100);
    
    doc.fontSize(20)
       .text('Test Certificate', 100, 150);
    
    doc.fontSize(14)
       .text('This is a test certificate to verify PDF generation is working.', 100, 200);
    
    doc.fontSize(12)
       .text(`Generated on: ${new Date().toLocaleString()}`, 100, 250);
    
    // Add a simple border
    doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100).stroke();
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('PDF Test Error:', error);
    res.status(500).json({ 
      message: 'PDF generation failed', 
      error: error.message,
      stack: error.stack 
    });
  }
});

// @route   GET /api/test-pdf/info
// @desc    Get PDF service info
// @access  Public
router.get('/info', (req, res) => {
  try {
    const pdfkitVersion = require('pdfkit/package.json').version;
    const testDir = path.join(__dirname, '../generated/certificates');
    const dirExists = fs.existsSync(testDir);
    
    res.json({
      pdfkitInstalled: true,
      pdfkitVersion,
      generatedDirPath: testDir,
      generatedDirExists: dirExists,
      nodeVersion: process.version,
      platform: process.platform
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      pdfkitInstalled: false 
    });
  }
});

module.exports = router;

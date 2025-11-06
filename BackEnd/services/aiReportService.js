const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const axios = require('axios');

/**
 * AI Report Generation Service
 * Integrates with Claude API for generating participation reports
 */
class AIReportService {
  constructor() {
    // Claude API configuration
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.apiUrl = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-opus-20240229';
  }

  /**
   * Extract text content from uploaded files
   */
  async extractContentFromFiles(files) {
    const extractedContent = [];

    for (const file of files) {
      try {
        if (file.mimetype === 'application/pdf') {
          // Extract text from PDF
          const dataBuffer = await fs.readFile(file.path);
          const pdfData = await pdfParse(dataBuffer);
          extractedContent.push({
            filename: file.originalname,
            content: pdfData.text,
            type: 'pdf'
          });
        } else if (file.mimetype.startsWith('image/')) {
          // For images, we'll use the file URL for now
          // In production, implement OCR using services like Tesseract or Google Vision
          extractedContent.push({
            filename: file.originalname,
            content: `[Image file: ${file.originalname}]`,
            type: 'image',
            url: file.cloudinaryUrl || file.path
          });
        } else if (file.mimetype.startsWith('text/')) {
          // Read text files directly
          const textContent = await fs.readFile(file.path, 'utf-8');
          extractedContent.push({
            filename: file.originalname,
            content: textContent,
            type: 'text'
          });
        }
      } catch (error) {
        console.error(`Error extracting content from ${file.originalname}:`, error);
        extractedContent.push({
          filename: file.originalname,
          content: '[Error extracting content]',
          type: 'error'
        });
      }
    }

    return extractedContent;
  }

  /**
   * Generate participation report using Claude AI
   */
  async generateParticipationReport(participationData) {
    const { 
      student, 
      event, 
      submissionText, 
      extractedContent,
      additionalNotes 
    } = participationData;

    // Prepare the prompt for Claude
    const prompt = this.buildReportPrompt(student, event, submissionText, extractedContent, additionalNotes);

    try {
      // Call Claude API
      const response = await this.callClaudeAPI(prompt);
      
      // Parse and format the response
      const formattedReport = this.formatReport(response, student, event);
      
      return {
        success: true,
        report: formattedReport,
        generatedAt: new Date(),
        wordCount: formattedReport.split(' ').length
      };
    } catch (error) {
      console.error('Error generating AI report:', error);
      
      // Fallback to template-based report if AI fails
      return {
        success: false,
        report: this.generateFallbackReport(student, event, submissionText),
        generatedAt: new Date(),
        error: 'AI generation failed, using template'
      };
    }
  }

  /**
   * Build comprehensive prompt for Claude
   */
  buildReportPrompt(student, event, submissionText, extractedContent, additionalNotes) {
    const extractedText = extractedContent.map(item => 
      `${item.filename}: ${item.content.substring(0, 500)}...`
    ).join('\n\n');

    return `
You are an NSS (National Service Scheme) coordinator generating a formal participation report for a student volunteer.

Student Information:
- Name: ${student.name}
- Registration Number: ${student.registrationNumber}
- Department: ${student.department}
- Year: ${student.year}

Event Details:
- Title: ${event.title}
- Category: ${event.category}
- Date: ${new Date(event.date).toLocaleDateString('en-IN')}
- Location: ${event.location.venue}
- Duration: ${event.hoursAwarded} hours
- Description: ${event.description}

Student's Submission:
${submissionText}

Evidence Documents Provided:
${extractedText}

Additional Notes:
${additionalNotes || 'None'}

Please generate a comprehensive participation report (300-400 words) that:
1. Summarizes the student's specific contributions and activities
2. Highlights key achievements and impact
3. Quantifies the community benefit where possible
4. Describes skills demonstrated or developed
5. Maintains a professional, formal tone suitable for official records
6. Includes specific examples from the evidence provided
7. Concludes with the significance of the student's participation

Format the report in clear paragraphs with proper structure.
`;
  }

  /**
   * Call Claude API
   */
  async callClaudeAPI(prompt) {
    try {
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      });

      return response.data.content[0].text;
    } catch (error) {
      console.error('Claude API error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Format the AI-generated report
   */
  formatReport(aiResponse, student, event) {
    const header = `
NSS PARTICIPATION REPORT
========================

Student: ${student.name} (${student.registrationNumber})
Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString('en-IN')}
Category: ${event.category}
Hours Contributed: ${event.hoursAwarded}

PARTICIPATION SUMMARY
--------------------
`;

    const footer = `

--------------------
Report Generated: ${new Date().toLocaleString('en-IN')}
Verified By: NSS Coordinator
Status: Auto-generated using AI assistance
`;

    return header + aiResponse + footer;
  }

  /**
   * Generate fallback report if AI fails
   */
  generateFallbackReport(student, event, submissionText) {
    return `
NSS PARTICIPATION REPORT
========================

Student: ${student.name} (${student.registrationNumber})
Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString('en-IN')}
Category: ${event.category}
Hours Contributed: ${event.hoursAwarded}

PARTICIPATION SUMMARY
--------------------

${student.name} actively participated in the ${event.category} event "${event.title}" organized by the NSS unit. The event was conducted at ${event.location.venue} with the objective of ${event.description.substring(0, 200)}...

Student's Contribution:
${submissionText}

The student demonstrated commitment to community service by dedicating ${event.hoursAwarded} hours to this initiative. Their participation contributed to the overall success of the event and aligned with NSS values of social responsibility and community engagement.

This participation adds to the student's total volunteer hours and demonstrates their ongoing commitment to the NSS program objectives.

--------------------
Report Generated: ${new Date().toLocaleString('en-IN')}
Note: Template-based report (AI generation unavailable)
`;
  }

  /**
   * Generate certificate description using AI
   */
  async generateCertificateDescription(student, event, totalHours) {
    const prompt = `
Generate a brief, formal certificate achievement description (50-75 words) for:
Student: ${student.name}
Event: ${event.title} (${event.category})
Hours: ${event.hoursAwarded}
Total NSS Hours: ${totalHours}

The description should highlight the student's contribution and commitment to community service.
`;

    try {
      const response = await this.callClaudeAPI(prompt);
      return response.trim();
    } catch (error) {
      // Fallback description
      return `This certificate is awarded to ${student.name} for successful participation in "${event.title}" contributing ${event.hoursAwarded} volunteer hours to community service through the National Service Scheme, demonstrating exceptional commitment to social responsibility and community development.`;
    }
  }

  /**
   * Analyze attendance data and provide insights
   */
  async analyzeAttendancePattern(attendanceRecords, studentInfo) {
    const prompt = `
Analyze this student's attendance pattern and provide insights:
Student: ${studentInfo.name} (${studentInfo.department}, Year ${studentInfo.year})
Current Attendance: ${studentInfo.attendancePercentage}%

Monthly Records:
${attendanceRecords.map(r => `${r.month}/${r.year}: ${r.percentage}%`).join('\n')}

Provide:
1. Trend analysis (improving/declining)
2. Risk assessment for maintaining 75% threshold
3. Recommended actions (if below 75%)

Keep response under 150 words.
`;

    try {
      const response = await this.callClaudeAPI(prompt);
      return {
        success: true,
        analysis: response.trim()
      };
    } catch (error) {
      return {
        success: false,
        analysis: 'Unable to generate attendance analysis at this time.'
      };
    }
  }

  /**
   * Generate annual summary report
   */
  async generateAnnualSummary(studentData, events, totalHours) {
    const eventSummary = events.map(e => 
      `- ${e.title} (${e.category}): ${e.hoursAwarded} hours`
    ).join('\n');

    const prompt = `
Generate an annual NSS participation summary report for:
Student: ${studentData.name}
Department: ${studentData.department}
Total Volunteer Hours: ${totalHours}
Events Participated: ${events.length}

Events:
${eventSummary}

Create a comprehensive summary (200-250 words) highlighting:
1. Overall contribution and dedication
2. Variety of service areas covered
3. Impact on community
4. Skills developed
5. Recommendations for recognition

Maintain formal tone suitable for academic records.
`;

    try {
      const response = await this.callClaudeAPI(prompt);
      return {
        success: true,
        summary: response.trim(),
        generatedAt: new Date()
      };
    } catch (error) {
      return {
        success: false,
        summary: this.generateFallbackAnnualSummary(studentData, events, totalHours),
        error: 'AI generation failed'
      };
    }
  }

  /**
   * Fallback annual summary
   */
  generateFallbackAnnualSummary(studentData, events, totalHours) {
    return `
ANNUAL NSS PARTICIPATION SUMMARY
================================

Student: ${studentData.name}
Department: ${studentData.department}
Academic Year: ${new Date().getFullYear()}
Total Volunteer Hours: ${totalHours}
Events Participated: ${events.length}

${studentData.name} has demonstrated exceptional commitment to community service through active participation in ${events.length} NSS events, contributing a total of ${totalHours} volunteer hours. Their participation spanned various categories including ${[...new Set(events.map(e => e.category))].join(', ')}.

The student's consistent involvement in NSS activities reflects strong social responsibility and leadership qualities. Their contributions have positively impacted the community while developing valuable skills in teamwork, organization, and social awareness.

This level of participation exceeds standard requirements and merits recognition for outstanding service to the NSS program.

Generated: ${new Date().toLocaleString('en-IN')}
`;
  }
}

module.exports = new AIReportService();

# Claude Opus 4.1 Prompt: NSS Activity Management Portal Design

You are an expert full-stack developer specializing in MERN stack applications. Design and implement a comprehensive web-based NSS (National Service Scheme) Activity Management Portal following these detailed specifications:

## 🎯 Project Overview
Create a portal for managing NSS volunteer activities, tracking student participation hours, ensuring academic eligibility through attendance verification, and generating AI-powered reports for community service documentation.

## 👥 User Roles & Permissions

### Admin/NSS Coordinator
- Create, edit, and publish volunteer events (tree plantation, blood drives, community outreach)
- Review and approve/reject student participation requests
- View comprehensive volunteer hour statistics per student
- Generate batch reports and certificates
- Monitor overall program metrics and compliance
- Import and manage attendance data

### Student
- Browse and register for available events
- Submit participation evidence (images/PDFs)
- Track personal volunteer hours and achievements
- View participation history and download certificates
- Receive automated event reminders
- Check eligibility status based on attendance

## 🏗️ Technical Architecture

### Frontend: React + Material-UI + Tailwind CSS
**Required Components:**
```
- AuthLayout (login/register forms)
- AdminDashboard
  - EventManagement (CRUD operations)
  - StudentApprovals
  - ReportGenerator
  - AttendanceImporter
- StudentDashboard
  - EventBrowser
  - MyParticipations
  - HoursTracker
  - CertificateViewer
- SharedComponents
  - EventCard
  - ParticipationForm
  - FileUploader
  - NotificationBanner
```

**Styling Requirements:**
- Use Material-UI components for forms and data tables
- Apply Tailwind CSS for responsive layouts and custom styling
- Implement dark/light theme toggle
- Ensure mobile-first responsive design

### Backend: Node.js + Express.js
**API Endpoints Structure:**
```javascript
// Authentication Routes
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/verify

// Event Management Routes
GET    /api/events (with pagination, filters)
POST   /api/events (admin only)
PUT    /api/events/:id (admin only)
DELETE /api/events/:id (admin only)
GET    /api/events/:id/participants

// Participation Routes
POST   /api/participations/register
PUT    /api/participations/:id/submit-evidence
GET    /api/participations/my-participations
PUT    /api/participations/:id/approve (admin only)
PUT    /api/participations/:id/reject (admin only)

// Attendance Routes
POST   /api/attendance/import (admin only, CSV/Excel upload)
GET    /api/attendance/:studentId
GET    /api/attendance/check-eligibility/:studentId

// Report Generation Routes
POST   /api/reports/generate-participation-report
POST   /api/reports/generate-certificate
GET    /api/reports/annual-summary/:studentId

// File Upload Routes
POST   /api/upload/evidence (Cloudinary integration)
DELETE /api/upload/:publicId
```

**Middleware Requirements:**
- JWT authentication middleware
- Role-based access control (RBAC)
- File upload validation (multer)
- Rate limiting for API protection
- Error handling middleware

### Database: MongoDB with Mongoose

**Schema Definitions:**

```javascript
// Student Schema
{
  registrationNumber: String (unique, required),
  name: String,
  email: String (unique),
  password: String (hashed),
  department: String,
  year: Number,
  attendancePercentage: Number,
  totalVolunteerHours: Number (default: 0),
  participations: [{ type: ObjectId, ref: 'Participation' }],
  createdAt: Date
}

// Event Schema
{
  title: String,
  description: String,
  category: String (enum: ['Environment', 'Health', 'Education', 'Community']),
  date: Date,
  location: String,
  maxParticipants: Number,
  hoursAwarded: Number,
  status: String (enum: ['draft', 'published', 'completed']),
  coordinator: { type: ObjectId, ref: 'Admin' },
  participants: [{ type: ObjectId, ref: 'Participation' }],
  createdAt: Date
}

// Participation Schema
{
  student: { type: ObjectId, ref: 'Student' },
  event: { type: ObjectId, ref: 'Event' },
  status: String (enum: ['pending', 'approved', 'rejected']),
  evidenceFiles: [{
    url: String,
    publicId: String,
    uploadedAt: Date
  }],
  submissionText: String,
  aiGeneratedReport: String,
  approvalDate: Date,
  rejectionReason: String,
  certificateUrl: String,
  createdAt: Date
}

// AttendanceRecord Schema
{
  studentId: String (registrationNumber),
  month: String,
  year: Number,
  classesAttended: Number,
  totalClasses: Number,
  percentage: Number,
  importedAt: Date
}
```

## 📋 Critical Business Logic

### Attendance Verification System
**Implementation Requirements:**
1. Import attendance data from Excel/CSV files containing:
   - Student registration numbers
   - Classes attended
   - Total classes
2. Calculate attendance percentage: `(classesAttended / totalClasses) * 100`
3. **75% Rule Enforcement:**
   ```javascript
   // Pseudo-code for eligibility check
   function checkEligibility(studentId) {
     const attendance = await AttendanceRecord.findOne({ studentId });
     if (attendance.percentage < 75) {
       return {
         eligible: false,
         reason: "Attendance below 75% threshold",
         currentPercentage: attendance.percentage
       };
     }
     return { eligible: true };
   }
   ```
4. Auto-reject event registrations if attendance < 75%
5. Display clear eligibility status on student dashboard

### AI-Powered Report Generation
**Claude Integration Instructions:**
1. **Input Processing:**
   - Collect student's uploaded evidence (images/PDFs)
   - Extract text from PDFs using pdf-parse
   - Process images using OCR if needed
   - Combine with student's written submission

2. **Report Generation Prompt:**
   ```javascript
   const generateReportPrompt = `
   Based on the following student participation evidence for the event "${eventName}":
   - Submitted Text: ${submissionText}
   - Extracted Document Content: ${extractedContent}
   - Event Details: ${eventDescription}
   
   Generate a comprehensive participation report that:
   1. Summarizes the student's contributions
   2. Highlights key achievements
   3. Quantifies impact where possible
   4. Maintains professional tone
   5. Limits to 300-400 words
   `;
   ```

3. **Certificate Generation Logic:**
   - Use AI to create personalized achievement descriptions
   - Auto-fill certificate templates with student data
   - Generate unique certificate IDs for verification

## 🔧 Third-Party Integrations

### Cloudinary Configuration
```javascript
// Setup for media storage
- Configure upload presets for evidence files
- Set max file size: 10MB for images, 25MB for PDFs
- Auto-generate thumbnails for images
- Implement secure signed uploads
- Store public_id for deletion capability
```

### Nodemailer Setup
```javascript
// Email notification system
- Configure SMTP settings (Gmail/SendGrid)
- Email templates:
  1. Event registration confirmation
  2. 24-hour event reminder
  3. Participation approval/rejection
  4. Certificate generation notification
- Include unsubscribe links
- Implement email queue for bulk sending
```

### jsPDF Implementation
```javascript
// PDF generation for reports and certificates
- Create certificate template with NSS branding
- Include QR code for verification
- Generate batch reports with:
  - Student details
  - Event participation summary
  - Total hours contributed
  - AI-generated narratives
- Enable bulk download functionality
```

## 🔐 Security Requirements
1. Implement bcrypt for password hashing (salt rounds: 10)
2. Use JWT with refresh token rotation
3. Enable CORS with whitelisted origins
4. Sanitize all user inputs to prevent XSS
5. Implement rate limiting (100 requests per 15 minutes)
6. Use HTTPS in production
7. Store sensitive keys in environment variables

## 📊 Additional Features
1. **Analytics Dashboard:**
   - Total volunteer hours by department
   - Event participation trends
   - Student engagement metrics

2. **Notification System:**
   - Real-time notifications using Socket.io
   - Push notifications for mobile browsers
   - SMS integration for critical alerts

3. **Data Export:**
   - Export reports to Excel
   - Bulk certificate generation
   - Annual summary compilation

## 🚀 Deployment Considerations
- Use MongoDB Atlas for database hosting
- Deploy backend on Render/Railway
- Host frontend on Vercel/Netlify
- Implement CI/CD pipeline
- Set up monitoring with error tracking

## 📝 Deliverables Expected
1. Complete project structure with organized folders
2. Functional React components with proper state management
3. RESTful API implementation with all specified endpoints
4. Database models with proper relationships
5. Working attendance verification system
6. AI report generation integration
7. File upload/storage functionality
8. Email notification system
9. PDF generation for certificates
10. Comprehensive error handling
11. Basic testing setup (Jest/Mocha)
12. Deployment-ready configuration files

## 🎨 UI/UX Requirements
- Clean, modern interface following Material Design principles
- Accessibility compliance (WCAG 2.1 AA)
- Loading states for all async operations
- Clear error messages and validation feedback
- Mobile-responsive design
- Intuitive navigation with breadcrumbs
- Search and filter functionality for events

## 📚 Documentation Requirements
- API documentation with example requests/responses
- Setup instructions with environment variables
- Database seed scripts for testing
- User guide for both admin and student roles
- Troubleshooting guide for common issues

---

**Please provide:**
1. Project folder structure
2. Key code implementations for each layer
3. Step-by-step setup instructions
4. Example API calls with expected responses
5. Database query optimizations
6. Security best practices implementation
7. Performance optimization strategies

Focus on creating production-ready, scalable code that follows SOLID principles and includes proper error handling throughout the application.

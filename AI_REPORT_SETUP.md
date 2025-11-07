# AI-Powered Report Generation Setup Guide

## 🤖 Gemini AI Integration for NAAC/UGC Reports

This system uses Google's Gemini AI to automatically analyze student reports and generate consolidated NAAC/UGC reports.

---

## 🔑 Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Get API Key"**
3. Create a new project or select existing
4. Click **"Create API Key"**
5. Copy the API key

---

## ⚙️ Step 2: Add to Environment Variables

Add this line to `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Complete `.env` file should look like:

```env
MONGODB_URI=mongodb+srv://your-cluster.mongodb.net/nss
JWT_SECRET=your_jwt_secret
EMAIL_USER=sdsameer1609@gmail.com
EMAIL_PASS=your_email_app_password
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
# Optional: override the default model used by Gemini (leave unset to use gemini-2.5-flash)
GEMINI_MODEL=gemini-2.5-flash
```

---

## 📊 Complete Flow

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: STUDENT SUBMITS REPORT                              │
└──────────────────────────────────────────────────────────────┘
                         ↓
   Student Dashboard → Submit Report Form
      ↓
   - Select Event (must have attended)
   - Write Title & Description
   - Upload Files (Images, PDFs, Documents) → Cloudinary
   - Submit
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: AUTOMATIC AI ANALYSIS (Gemini)                      │
└──────────────────────────────────────────────────────────────┘
                         ↓
   Gemini AI Analyzes Report:
      ✓ Generates Summary (2-3 sentences)
      ✓ Extracts Key Points
      ✓ Identifies Learnings
      ✓ Assesses Community Impact
      ✓ Provides Recommendations
                         ↓
   Saves AI Analysis to MongoDB
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: ADMIN VIEWS ALL REPORTS                             │
└──────────────────────────────────────────────────────────────┘
                         ↓
   Admin Dashboard → AI Reports Section
      ↓
   View All Student Reports:
      - Filter by Event / Academic Year / Status
      - See AI-generated summaries
      - View uploaded files (Cloudinary)
      - Review and Approve/Reject
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: GENERATE NAAC/UGC REPORTS (Gemini AI)               │
└──────────────────────────────────────────────────────────────┘
                         ↓
   Admin clicks "Generate NAAC Report" or "Generate UGC Report"
      ↓
   Gemini AI Processes All Reports:
      ✓ Consolidates all student reports
      ✓ Analyzes trends and patterns
      ✓ Calculates statistics (students, events, hours)
      ✓ Generates professional NAAC/UGC format report
      ✓ Includes executive summary
      ✓ Provides measurable outcomes
      ✓ Creates comprehensive documentation
                         ↓
   Downloads as PDF or views in browser
```

---

## 🎯 Features

### For Students:
- ✅ Submit event reports with file uploads (Cloudinary)
- ✅ View AI-generated summary of their report
- ✅ Track submission status
- ✅ View all their submitted reports

### For Admin:
- ✅ View all student reports across all events
- ✅ Filter by event, academic year, or status
- ✅ See AI analysis for each report
- ✅ Review and approve/reject reports
- ✅ Generate event-specific summaries
- ✅ Generate NAAC reports with AI
- ✅ Generate UGC reports with AI
- ✅ Export comprehensive annual reports

---

## 📋 API Endpoints

### Student Endpoints:
```
POST   /api/reports/student/submit          - Submit report with files
GET    /api/reports/student/my-reports      - Get all my reports
```

### Admin Endpoints:
```
GET    /api/reports/admin/all                              - Get all reports
POST   /api/reports/admin/analyze/:reportId                - Trigger AI analysis
POST   /api/reports/admin/generate-naac                    - Generate NAAC report
POST   /api/reports/admin/generate-ugc                     - Generate UGC report
POST   /api/reports/admin/event-summary/:eventId           - Generate event summary
PUT    /api/reports/admin/review/:reportId                 - Review report
```

---

## 💾 Database Schema

### Report Model:
```javascript
{
  student: ObjectId,                    // Reference to User
  event: ObjectId,                      // Reference to Event
  title: String,                        // Report title
  description: String,                  // Main content
  files: [{                             // Uploaded files (Cloudinary)
    url: String,
    publicId: String,
    fileName: String,
    fileType: String
  }],
  aiSummary: String,                    // AI-generated summary
  aiAnalysis: {                         // AI analysis results
    keyPoints: [String],
    learnings: [String],
    impact: String,
    recommendations: [String],
    generatedAt: Date
  },
  status: String,                       // draft/submitted/reviewed/approved/rejected
  reviewedBy: ObjectId,
  reviewNotes: String,
  reviewedAt: Date,
  academicYear: String                  // e.g., "2024-2025"
}
```

---

## 🔐 Security

- ✅ Students can only submit reports for events they attended
- ✅ Students can only view their own reports
- ✅ Admin/Faculty can view all reports
- ✅ Only Admin can generate NAAC/UGC reports
- ✅ Files stored securely in Cloudinary
- ✅ API key secured in environment variables

---

## 🚀 Usage Examples

### Student Submits Report:
```javascript
// Frontend form submission
const formData = new FormData();
formData.append('eventId', '690c5fa9...');
formData.append('title', 'Blood Donation Camp Experience');
formData.append('description', 'Detailed report content...');
formData.append('academicYear', '2024-2025');
formData.append('files', file1);
formData.append('files', file2);

await api.post('/reports/student/submit', formData);
// → Report saved to MongoDB
// → Files uploaded to Cloudinary
// → AI analysis triggered automatically
```

### Admin Generates NAAC Report:
```javascript
const response = await api.post('/reports/admin/generate-naac', {
  academicYear: '2024-2025'
});

// Response includes:
// - Executive Summary
// - Statistics (events, students, hours)
// - Key Achievements
// - Community Impact
// - Recommendations
// - Professional NAAC format
```

---

## 📝 Sample AI-Generated NAAC Report Structure

```
NATIONAL SERVICE SCHEME (NSS)
ANNUAL REPORT 2024-2025

1. EXECUTIVE SUMMARY
   Comprehensive overview of NSS activities for the academic year...

2. OVERVIEW OF NSS ACTIVITIES
   - Total Events Conducted: 45
   - Total Student Participation: 450
   - Total Volunteer Hours: 2,250
   - Events by Category: [Breakdown]

3. KEY ACHIEVEMENTS AND OUTCOMES
   - Blood Donation Drives: 500 units collected
   - Environmental Campaigns: 5,000 trees planted
   - Community Service: 10 villages impacted

4. COMMUNITY IMPACT ASSESSMENT
   Detailed analysis of social impact...

5. STUDENT PARTICIPATION METRICS
   - Department-wise participation
   - Year-wise distribution
   - Engagement trends

6. SKILLS AND COMPETENCIES DEVELOPED
   - Leadership skills
   - Community engagement
   - Social responsibility

7. CHALLENGES AND LEARNINGS
   Identified challenges and mitigation strategies...

8. RECOMMENDATIONS FOR FUTURE
   Strategic recommendations for improvement...

9. CONCLUSION
   Summary of achievements and future outlook...
```

---

## 🎓 Benefits

### For NAAC Accreditation:
- ✅ Automated documentation
- ✅ Measurable outcomes
- ✅ Comprehensive data
- ✅ Professional format
- ✅ Evidence-based reporting

### For UGC Reporting:
- ✅ Student engagement metrics
- ✅ Community impact data
- ✅ Activity documentation
- ✅ Year-over-year trends

---

## 🔄 Restart Backend After Setup

```bash
cd backend
npm install
# Make sure GEMINI_API_KEY is in .env
npm run dev
```

The AI analysis will now run automatically for all submitted reports! 🚀

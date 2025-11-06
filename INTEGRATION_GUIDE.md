# NSS Activity Portal - Integration Guide

## 🎨 UI Framework Setup

Your application now uses **Material-UI (MUI)** as the primary component library with **Tailwind CSS** for utility classes.

### Design System:
- **MUI Components**: All interactive elements (buttons, forms, dialogs, etc.)
- **Tailwind Utilities**: Spacing, layout, and custom styling
- **Custom Theme**: Defined in `FrontEnd/src/theme/muiTheme.js`

## 📦 New Components Created

### 1. **MUI Theme Configuration**
- Location: `FrontEnd/src/theme/muiTheme.js`
- Custom color palette matching NSS branding
- Consistent typography and spacing
- Component overrides for unified look

### 2. **Student Dashboard**
- Location: `FrontEnd/src/pages/StudentDashboard.jsx`
- Features:
  - Real-time statistics display
  - Attendance eligibility check (75% rule)
  - Upcoming events listing
  - Participation tracking
  - Certificate access
  - Interactive charts using Recharts

### 3. **Event Creation Form**
- Location: `FrontEnd/src/pages/CreateEvent.jsx`
- Features:
  - Multi-step form wizard
  - Date/time pickers
  - Image upload with drag-and-drop
  - Requirements management
  - Draft and publish options

### 4. **Evidence Upload Component**
- Location: `FrontEnd/src/components/EvidenceUpload.jsx`
- Features:
  - Drag-and-drop file upload
  - Multiple file support (images, PDFs, documents)
  - File preview
  - AI report generation trigger
  - Progress tracking

### 5. **Certificates Page**
- Location: `FrontEnd/src/pages/CertificatesPage.jsx`
- Features:
  - Certificate gallery view
  - Download/print/share options
  - Search and filter
  - Achievement badges
  - Bulk download

## 🔧 Installation Steps

### 1. Install Frontend Dependencies
```bash
cd FrontEnd
npm install

# If there are any peer dependency issues, run:
npm install --legacy-peer-deps
```

### 2. Install Backend Dependencies
```bash
cd ../BackEnd
npm install pdfkit
```

### 3. Environment Setup
Create `.env` file in `BackEnd` directory with all required variables (see `.env.example`)

### 4. Update App.js
Replace your current `App.js` with the updated version:
```bash
cd FrontEnd/src
# Backup current App.js
mv App.js App_backup.js
# Use the updated version
mv App_Updated.jsx App.js
```

## 🎯 Key Features Implementation

### Attendance Verification (75% Rule)
- **Backend**: `BackEnd/services/attendanceService.js`
- **Frontend**: Integrated in Student Dashboard
- Students with <75% attendance cannot register for events
- Visual indicators show eligibility status

### AI Report Generation
- **Backend**: `BackEnd/services/aiReportService.js`
- **Frontend**: Triggered in Evidence Upload component
- Requires Claude API key in environment variables
- Falls back to template if API unavailable

### File Upload System
- **Backend**: `BackEnd/config/cloudinary.js`
- **Frontend**: Evidence Upload component with dropzone
- Supports images, PDFs, and documents
- Maximum 10MB per file

### Email Notifications
- **Backend**: `BackEnd/services/emailService.js`
- Templates for all event types
- Event reminders (24hr and 2hr before)
- Bulk email support for admins

### PDF Generation
- **Backend**: `BackEnd/services/pdfService.js`
- Generates certificates with QR codes
- Creates participation reports
- Annual summaries

## 🌐 API Endpoints to Test

### Student Endpoints
```javascript
GET    /api/students/stats           // Get student statistics
GET    /api/events/upcoming          // Get upcoming events
GET    /api/participations/my        // Get my participations
POST   /api/participations/register  // Register for event
POST   /api/participations/:id/evidence // Upload evidence
GET    /api/certificates/my          // Get my certificates
```

### Admin Endpoints
```javascript
GET    /api/admin/stats              // Dashboard statistics
POST   /api/attendance/import        // Import attendance Excel
GET    /api/participations/pending   // Get pending approvals
PUT    /api/participations/:id/approve // Approve participation
```

## 🚀 Running the Application

### Development Mode
```bash
# From root directory
npm run dev

# Or separately:
# Terminal 1
cd BackEnd
npm run server

# Terminal 2  
cd FrontEnd
npm start
```

### Testing User Flows

#### Admin Flow:
1. Login as admin
2. Navigate to Admin Dashboard (`/admin`)
3. Create a new event (`/admin/create-event`)
4. Import attendance data
5. Review pending participations
6. Generate reports

#### Student Flow:
1. Register/Login as student
2. Check dashboard for eligibility
3. Browse and register for events
4. Upload participation evidence
5. Track approval status
6. Download certificates

## 🎨 Styling Guidelines

### Using MUI with Tailwind

```jsx
// MUI component with Tailwind utilities
<Button 
  variant="contained"
  className="mt-4 px-6"  // Tailwind for spacing
  sx={{ borderRadius: 2 }} // MUI sx prop for MUI-specific styles
>
  Submit
</Button>

// Combining both for complex layouts
<Box className="flex items-center gap-4"> // Tailwind utilities
  <Typography variant="h6">  // MUI typography
    Title
  </Typography>
</Box>
```

### Color Usage
- **Primary**: Blue shades for main actions
- **Secondary**: Purple for secondary actions
- **Success**: Green for positive states
- **Error**: Red for errors/warnings
- **Warning**: Amber for alerts

## 📱 Responsive Design

All components are responsive using:
- MUI's Grid system for layouts
- Tailwind's responsive prefixes (sm:, md:, lg:)
- Mobile-first approach

## 🐛 Troubleshooting

### Common Issues:

1. **Date Picker Error**
   - Install date-fns: `npm install date-fns`
   - Wrap app with LocalizationProvider

2. **Chart Not Rendering**
   - Install recharts: `npm install recharts`
   - Check data format matches chart requirements

3. **File Upload Failing**
   - Verify Cloudinary credentials
   - Check file size limits (10MB)
   - Ensure proper file types

4. **Email Not Sending**
   - Verify Gmail app password
   - Check EMAIL_USER and EMAIL_PASSWORD in .env

## 📄 Additional Notes

### Security Considerations
- All routes are protected with role-based access
- JWT tokens expire after 7 days
- File uploads are validated for type and size
- Attendance data is verified server-side

### Performance Optimizations
- Lazy loading for route components
- Image optimization via Cloudinary
- Pagination for large data sets
- Caching for frequently accessed data

### Future Enhancements
- Add PWA support for offline access
- Implement push notifications
- Add data export features
- Create mobile app version

## 🎉 Completion Status

✅ **All major features implemented:**
- Backend services (Attendance, AI, Email, PDF)
- Admin Dashboard with full management
- Student Dashboard with participation tracking
- Event Creation workflow
- Evidence Upload system
- Certificate management
- MUI + Tailwind CSS integration

Your NSS Activity Portal is now fully functional with enterprise-grade features!

For support or questions, refer to the main README.md or raise an issue in the repository.

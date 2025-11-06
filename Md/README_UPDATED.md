# NSS Activity Portal 🌟

A comprehensive web-based system for managing National Service Scheme (NSS) events and student participation with AI-powered features and automated workflows.

## 🚀 Features

### Core Functionality
- **Multi-role Access System**
  - Admin/NSS Coordinator dashboard with analytics
  - Student portal with personalized views
  - Faculty module for event management
  - Role-based permissions and access control

- **Event Management**
  - Create, publish, and manage NSS events
  - Event categories (tree plantation, blood donation, cleanliness drive, health camps, awareness campaigns)
  - Automatic participant limit enforcement
  - Event status tracking (draft, published, ongoing, completed)
  - Real-time participant tracking

- **Student Participation**
  - Event registration with eligibility checks
  - Evidence submission (images/PDFs via Cloudinary)
  - Participation history tracking
  - Real-time status updates via Socket.io
  - Volunteer hours accumulation

- **Attendance Integration**
  - Excel/CSV attendance import
  - **75% attendance eligibility rule enforcement**
  - Automatic eligibility calculation
  - Attendance alerts and notifications
  - Department and year-wise filtering

- **AI-Powered Features**
  - Automatic report generation using Claude AI
  - Evidence analysis and summarization
  - Personalized participation narratives
  - Annual activity summaries
  - Intelligent feedback generation

- **Document Generation**
  - Auto-generated participation certificates (PDFKit)
  - Detailed participation reports
  - Annual activity reports
  - Bulk certificate generation
  - QR code verification support

- **Communication System**
  - Email notifications via Nodemailer
  - Event reminder system (24hr and 2hr before events)
  - Bulk email capabilities
  - Attendance alerts
  - Real-time notifications via Socket.io

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Material-UI (MUI) v5** - Comprehensive component library
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **jsPDF** - Client-side PDF generation
- **React Dropzone** - File upload handling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Multer** - File upload middleware
- **Node-cron** - Scheduled tasks

### External Services
- **Cloudinary** - Cloud-based media storage and optimization
- **Nodemailer** - Email service integration
- **Claude AI API** - AI-powered report generation
- **PDFKit** - Server-side PDF generation
- **XLSX** - Excel file processing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Cloudinary account (for file storage)
- Email service credentials (Gmail/SMTP)
- Claude AI API key (optional for AI features)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/nss-activity-portal.git
cd nss-activity-portal
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm run install-all

# Or manually:
# Root dependencies
npm install

# Frontend dependencies
cd FrontEnd
npm install

# Backend dependencies
cd ../BackEnd
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `BackEnd` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/nss-portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration (Required)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Claude AI API (Optional but Recommended)
CLAUDE_API_KEY=your-claude-api-key
CLAUDE_API_URL=https://api.anthropic.com/v1/messages

# Admin Credentials (for initial setup)
ADMIN_EMAIL=admin@nssportal.com
ADMIN_PASSWORD=Admin@123456

# Application Settings
APP_NAME=NSS Activity Portal
MAX_FILE_SIZE=10485760
ENABLE_EMAIL_NOTIFICATIONS=true
```

### 4. Database Setup
```bash
# Make sure MongoDB is running
mongod

# The application will automatically create collections
# Optional: Seed initial data
cd BackEnd
node utils/seed-data.js
```

### 5. Run the Application

**Development Mode:**
```bash
# From root directory
npm run dev

# Or run separately:
# Terminal 1 - Backend
cd BackEnd
npm run server

# Terminal 2 - Frontend
cd FrontEnd
npm start
```

**Production Mode:**
```bash
# Build frontend
cd FrontEnd
npm run build

# Start backend with PM2
cd ../BackEnd
pm2 start server.js --name nss-portal
```

## 🎯 Usage Guide

### Admin/Coordinator Workflow

1. **Initial Setup**
   - Login with admin credentials
   - Configure system settings
   - Import initial student data

2. **Dashboard Overview**
   - View real-time statistics
   - Monitor pending approvals
   - Access analytics charts
   - Track volunteer hours

3. **Event Management**
   - Create events with detailed information
   - Set volunteer hours awarded
   - Define participant limits
   - Publish/unpublish events
   - Monitor real-time registrations

4. **Student Management**
   - Import attendance data (Excel/CSV)
   - View eligibility status (75% rule)
   - Send bulk notifications
   - Generate individual reports
   - Track volunteer hours

5. **Approval Process**
   - Review submitted evidence
   - View AI-generated participation reports
   - Approve/reject with feedback
   - Auto-generate certificates
   - Batch approval capabilities

6. **Reporting**
   - Generate event reports
   - Create annual summaries
   - Export data to Excel
   - Download bulk certificates

### Student Workflow

1. **Registration & Login**
   - Register with registration number
   - Complete profile information
   - Verify email address
   - Login to dashboard

2. **Dashboard Features**
   - View eligibility status
   - Track volunteer hours
   - See upcoming events
   - Monitor participation status

3. **Event Participation**
   - Browse available events
   - Check eligibility (75% attendance)
   - Register for events
   - Receive confirmation email
   - Get reminders

4. **Evidence Submission**
   - Upload photos/documents
   - Add participation details
   - Submit for approval
   - Track approval status
   - Receive notifications

5. **Certificates & Reports**
   - Download participation certificates
   - View participation history
   - Track total volunteer hours
   - Generate annual summary
   - Export records

### Faculty Module

1. **Event Creation**
   - Propose new events
   - Set event parameters
   - Submit for admin approval

2. **Participation Management**
   - View registrations
   - Mark attendance
   - Verify contributions
   - Generate reports

## 📊 API Documentation

### Authentication Endpoints
```javascript
POST   /api/auth/register              // Register new user
POST   /api/auth/login                 // User login
GET    /api/auth/profile               // Get user profile
PUT    /api/auth/update-profile        // Update profile
POST   /api/auth/forgot-password       // Request password reset
POST   /api/auth/reset-password        // Reset password
```

### Event Endpoints
```javascript
GET    /api/events                     // Get all events
GET    /api/events/:id                 // Get specific event
POST   /api/events                     // Create event (Admin/Faculty)
PUT    /api/events/:id                 // Update event (Admin/Faculty)
DELETE /api/events/:id                 // Delete event (Admin)
POST   /api/events/:id/publish         // Publish event (Admin/Faculty)
GET    /api/events/upcoming            // Get upcoming events
GET    /api/events/category/:category  // Get events by category
```

### Participation Endpoints
```javascript
POST   /api/participations/register           // Register for event
GET    /api/participations/my                 // Get my participations
POST   /api/participations/:id/evidence       // Submit evidence
PUT    /api/participations/:id/approve        // Approve (Admin/Faculty)
PUT    /api/participations/:id/reject         // Reject (Admin/Faculty)
GET    /api/participations/:id/certificate    // Download certificate
GET    /api/participations/pending            // Get pending approvals
PUT    /api/participations/:id/attendance     // Mark attendance
```

### Attendance Endpoints
```javascript
POST   /api/attendance/import                 // Import Excel (Admin)
GET    /api/attendance/check/:regNumber       // Check eligibility
GET    /api/attendance/report                 // Generate report (Admin)
PUT    /api/attendance/update/:studentId      // Update attendance (Admin)
GET    /api/attendance/below-threshold        // Get students below 75%
```

### Reports Endpoints
```javascript
GET    /api/reports/participation/:id         // Get participation report
GET    /api/reports/annual/:studentId         // Annual report
POST   /api/reports/generate-ai               // Generate AI report
GET    /api/reports/statistics                // Get statistics (Admin)
GET    /api/reports/event-summary/:eventId    // Event summary
POST   /api/reports/bulk-certificates         // Generate bulk certificates
```

### Contribution Endpoints
```javascript
GET    /api/contributions                     // Get all contributions
POST   /api/contributions                     // Submit contribution
PUT    /api/contributions/:id/verify          // Verify (Admin/Faculty)
GET    /api/contributions/student/:studentId  // Get student contributions
```

### Notification Endpoints
```javascript
GET    /api/notifications                     // Get user notifications
PUT    /api/notifications/:id/read            // Mark as read
POST   /api/notifications/bulk-email          // Send bulk email (Admin)
GET    /api/notifications/preferences         // Get preferences
PUT    /api/notifications/preferences         // Update preferences
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt (10 rounds)
- **Role-based Access Control** (RBAC)
- **Input Validation** using express-validator
- **File Type Validation** for uploads
- **Rate Limiting** for API endpoints
- **XSS Protection** headers
- **CORS Configuration**
- **MongoDB Injection Prevention**
- **Environment Variable Protection**

## 📈 Performance Optimizations

- **Database Indexing** on frequently queried fields
- **Image Optimization** via Cloudinary transformations
- **Lazy Loading** for React components
- **Redis Caching** for frequently accessed data (optional)
- **Pagination** for large datasets
- **Compression** middleware for responses
- **Code Splitting** in React build
- **WebSocket for real-time updates**
- **Batch operations** for bulk actions

## 🧪 Testing

```bash
# Backend unit tests
cd BackEnd
npm test

# Frontend tests
cd FrontEnd
npm test

# E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 📝 Project Structure

```
nss-activity-portal/
├── BackEnd/
│   ├── config/         # Configuration files
│   │   └── cloudinary.js
│   ├── middleware/     # Express middleware
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/         # MongoDB models
│   │   ├── Student.js
│   │   ├── Event.js
│   │   ├── Participation.js
│   │   └── AttendanceRecord.js
│   ├── routes/         # API routes
│   │   ├── auth.js
│   │   ├── events.js
│   │   └── participations.js
│   ├── services/       # Business logic
│   │   ├── emailService.js
│   │   ├── attendanceService.js
│   │   ├── aiReportService.js
│   │   └── pdfService.js
│   ├── utils/          # Utility functions
│   └── server.js       # Entry point
├── FrontEnd/
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── context/    # React context
│   │   ├── utils/      # Helper functions
│   │   └── App.js      # Main component
│   └── package.json
├── .env.example        # Environment template
├── .gitignore
├── package.json        # Root dependencies
└── README.md           # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Use async/await for asynchronous code
- Follow RESTful API conventions

## 🐛 Troubleshooting

### Common Issues

**403 Forbidden Error:**
```bash
# Check user role
node BackEnd/utils/check-user-role.js email@example.com

# Update to admin
node BackEnd/utils/check-user-role.js email@example.com admin
```

**Email Not Sending:**
- Verify Gmail App Password is correct
- Check firewall settings
- Enable "Less secure app access" (not recommended)

**File Upload Issues:**
- Check Cloudinary credentials
- Verify file size limits
- Ensure proper file types

**Database Connection:**
- Ensure MongoDB is running
- Check connection string
- Verify network access

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support:
- Email: support@nssportal.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/nss-activity-portal/issues)
- Documentation: [Wiki](https://github.com/yourusername/nss-activity-portal/wiki)

## 🙏 Acknowledgments

- National Service Scheme (NSS) for inspiration
- Claude AI for intelligent report generation
- Open-source community for amazing tools
- All contributors and testers

---

**Developed with ❤️ for NSS volunteers and coordinators**

**Version:** 1.0.0  
**Last Updated:** November 2024

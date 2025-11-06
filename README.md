# NSS Activity Portal

A comprehensive web-based NSS (National Service Scheme) Activity Portal that allows administrators to plan and record events, track student participation, manage contributions, and generate performance summaries automatically.

## Features

### Admin / NSS Coordinator Module
- Create and publish NSS events (tree plantation, blood donation, etc.)
- Approve or reject student participation requests
- View total volunteer hours, attendance, and contribution records
- Generate auto-filled event reports and certificates
- Download annual NSS summary in PDF/Excel format

### Student Module
- Register and view upcoming NSS events
- Submit participation reports and upload evidence (photos, write-ups)
- Track total contribution hours and certificate eligibility
- Receive event reminders via email/SMS

### Faculty Module
- View and manage events
- Approve/reject student participations
- Access reports

## Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **File Uploads**: Cloudinary
- **Reports**: jsPDF for PDF generation, XLSX for Excel export

## Project Structure

```
NSS/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   └── server.js         # Express server
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   └── utils/        # Utility functions
│   └── public/
└── package.json
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (optional - for file uploads. If not provided, files will be stored locally)

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI, JWT secret, and Cloudinary credentials
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   # Frontend dependencies are installed in step 1
   ```

4. **Start the application:**
   ```bash
   # From root directory
   npm run dev
   ```
   This will start both backend (port 5000) and frontend (port 3000) concurrently.

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nss-portal
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Cloudinary Configuration (Optional - if not provided, files will be stored locally)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

**Note:** For Gmail, you need to use an App Password instead of your regular password:
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password at https://myaccount.google.com/apppasswords
4. Use the generated app password in `EMAIL_PASS`

You can test your email configuration by running:
```bash
node backend/utils/test-email.js
```

### Troubleshooting

**403 Forbidden when publishing events:**
If you get a 403 error when trying to publish events, it means your user account doesn't have the 'admin' or 'faculty' role. To fix this:

1. Check your current role:
   ```bash
   node backend/utils/check-user-role.js your_email@example.com
   ```

2. Update your role to admin:
   ```bash
   node backend/utils/check-user-role.js your_email@example.com admin
   ```

3. List all users:
   ```bash
   node backend/utils/check-user-role.js
   ```

4. After updating, log out and log back in for changes to take effect.

**Note:** If Cloudinary credentials are not provided, the system will automatically use local file storage in the `backend/uploads` directory. Files will be served statically through the Express server.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Admin/Faculty)
- `PUT /api/events/:id` - Update event (Admin/Faculty)
- `DELETE /api/events/:id` - Delete event (Admin)
- `POST /api/events/:id/publish` - Publish event (Admin/Faculty)

### Participations
- `GET /api/participations` - Get participations
- `POST /api/participations` - Register for event (Student)
- `PUT /api/participations/:id/approve` - Approve participation (Admin/Faculty)
- `PUT /api/participations/:id/reject` - Reject participation (Admin/Faculty)
- `PUT /api/participations/:id/attendance` - Mark attendance (Admin/Faculty)

### Contributions
- `GET /api/contributions` - Get contributions
- `POST /api/contributions` - Submit contribution (Student)
- `PUT /api/contributions/:id/verify` - Verify contribution (Admin/Faculty)

### Reports
- `GET /api/reports/event/:id` - Generate event report PDF (Admin/Faculty)
- `GET /api/reports/certificate/:participationId` - Generate certificate PDF
- `GET /api/reports/annual-summary` - Generate annual summary (PDF/Excel) (Admin)

### Upload
- `POST /api/upload` - Upload file to Cloudinary
- `DELETE /api/upload/:publicId` - Delete file from Cloudinary

## User Roles

1. **Admin**: Full access to all features
2. **Faculty**: Can create events, approve participations, view reports
3. **Student**: Can register for events, submit contributions, view profile

## Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
- Frontend proxy is configured to forward API requests to backend

## License

ISC


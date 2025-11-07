# Certificate Auto-Generation Feature

## Overview
This feature allows administrators to upload certificate PDF templates, configure field placements (Name, Event Name, Date) using coordinate-based selection, and automatically send certificates to participated students after event completion.

## Features

### 1. **Certificate Template Upload**
- Upload PDF certificate templates for each event
- Support for custom certificate designs
- Templates stored locally in `backend/uploads/certificates/`

### 2. **Coordinate-Based Field Placement**
- Interactive PDF preview with click-to-place functionality
- Configure positions for:
  - **Student Name**: Participant's full name
  - **Event Name**: Title of the event
  - **Date**: Event end date (auto-formatted)
- Customize font size and color for each field

### 3. **Auto-Fill Certificate Generation**
- Automatically fills student details on certificate template
- Uses pdf-lib for precise PDF manipulation
- Generates unique certificates for each participant

### 4. **Multi-Channel Distribution**
- **Email**: Certificates sent as PDF attachments
- **In-App Notifications**: Real-time notifications via Socket.IO
- **Database Storage**: Notification records for offline users

### 5. **Auto-Send After Event Completion**
- Cron job checks hourly for completed events
- Automatically sends certificates when:
  - Event end date has passed
  - Certificate template is configured
  - Auto-send is enabled
  - Certificates haven't been sent yet

## Setup Instructions

### Backend Dependencies
Already installed:
- `pdf-lib` - PDF manipulation
- `nodemailer` - Email sending
- `node-cron` - Scheduled tasks
- `multer` - File upload

### Frontend Dependencies
Already installed:
- `react-pdf` - PDF preview in React
- `pdfjs-dist` - PDF.js library (worker file copied to public folder)

## How to Use

### For Administrators:

#### 1. **Access Certificate Configuration**
   - Navigate to Admin > Events
   - Click "Certificate Config" button on any event card
   - You'll be redirected to `/admin/certificates/:eventId`

#### 2. **Upload Certificate Template**
   - Click "Choose File" and select a PDF certificate template
   - Click "Upload Template" to upload the file
   - The PDF will be displayed in the preview panel

#### 3. **Configure Field Positions**
   - Select a field from the left panel (Student Name, Event Name, or Date)
   - Click on the PDF preview where you want that field to appear
   - A red marker will show the position
   - Adjust font size and color as needed
   - Repeat for all three fields

#### 4. **Test Your Configuration**
   - Click "Test Preview" to generate a sample certificate
   - Review the output to ensure fields are correctly placed
   - Adjust positions if needed

#### 5. **Save Configuration**
   - Click "Save Configuration" to store your settings
   - Enable/disable "Auto-send after event completion" as needed

#### 6. **Generate & Send Certificates**
   Two ways to send certificates:

   **Manual:**
   - Click "Generate & Send Certificates" button
   - Confirms sending to all participated students
   - Shows success/failure count

   **Automatic (Recommended):**
   - Enable "Auto-send after event completion"
   - Certificates will be sent automatically 1 hour after event ends
   - Cron job runs hourly to check for completed events

## API Endpoints

### Certificate Routes (`/api/certificates`)

```
POST   /upload-template/:eventId     Upload certificate template
PUT    /configure/:eventId           Configure field coordinates
GET    /config/:eventId              Get certificate configuration
POST   /generate/:eventId            Generate and send certificates
POST   /test-preview/:eventId        Generate test certificate
```

## Database Schema

### Event Model Extensions
```javascript
{
  certificate: {
    templateUrl: String,           // Path to PDF template
    templatePublicId: String,      // Cloudinary ID (if used)
    fields: {
      name: {
        x: Number,                 // X coordinate
        y: Number,                 // Y coordinate
        fontSize: Number,          // Font size (default: 24)
        color: String              // Hex color (default: #000000)
      },
      eventName: { ... },
      date: { ... }
    },
    autoSend: Boolean              // Auto-send after completion
  },
  certificatesSent: Boolean        // Track if sent
}
```

## Coordinate System

The certificate uses a coordinate system where:
- **Origin (0,0)**: Top-left corner of the PDF
- **X-axis**: Increases from left to right
- **Y-axis**: Increases from top to bottom

When clicking on the PDF preview:
1. Click position is captured relative to the PDF canvas
2. Coordinates are adjusted for zoom/scale
3. Position is stored in the database
4. During generation, Y-coordinate is inverted for pdf-lib (which uses bottom-left origin)

## Email Template

Certificates are sent with a professional HTML email template including:
- Congratulations message
- Event details (title, date, location)
- PDF certificate attachment
- Filename format: `Certificate_[StudentName]_[EventTitle].pdf`

## Notification Types

### Email Notification
- Subject: "Certificate for [Event Title]"
- Includes congratulations message and event details
- PDF attached as `Certificate_[Name]_[Event].pdf`

### In-App Notification
- Type: `certificate`
- Real-time via Socket.IO
- Stored in database for offline users
- Message: "Your certificate for '[Event Title]' is ready!"

## Cron Schedule

The certificate scheduler runs:
- **Every hour** (`0 * * * *`) to check for completed events
- **On startup** (after 1 minute) for immediate check
- Processes all eligible events automatically

## Error Handling

The system handles:
- Missing or invalid PDF templates
- Network failures during email sending
- PDF generation errors
- Partial failures (continues with other students)
- Detailed logging for debugging

## Logging

Console logs include:
- 📜 Certificate generation start/end
- 📄 Individual student processing
- ✅ Successful sends
- ❌ Failed sends
- 📊 Summary statistics
- ⏰ Scheduler runs

## Testing Checklist

Before going live, test:
- [ ] Upload PDF template
- [ ] Place all three fields correctly
- [ ] Adjust font sizes and colors
- [ ] Generate test preview
- [ ] Verify field positions in preview
- [ ] Mark some students as "attended"
- [ ] Generate and send certificates manually
- [ ] Check email delivery
- [ ] Verify in-app notifications
- [ ] Test auto-send by creating past event

## Troubleshooting

### Certificates Not Sending
1. Check event end date has passed
2. Verify certificate template is uploaded
3. Ensure auto-send is enabled
4. Check students have "attended" or "completed" status
5. Review backend logs for errors

### Email Issues
1. Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
2. Check Gmail "Less secure app access" settings
3. Review nodemailer configuration
4. Check student email addresses are valid

### PDF Generation Errors
1. Ensure pdf-lib package is installed
2. Verify template PDF is valid
3. Check coordinate values are reasonable
4. Review field configuration

### Coordinate Placement Issues
1. Clear markers and re-place
2. Use test preview to verify
3. Adjust zoom level for better precision
4. Check font size isn't too large

### PDF Worker Loading Error
If you see "Failed to fetch dynamically imported module" error:
1. The worker file should be in `frontend/public/pdf.worker.js`
2. Run `npm install` in frontend folder (postinstall script copies it)
3. Or manually copy: `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `public/pdf.worker.js`
4. Restart the React dev server
5. Clear browser cache and reload

## Future Enhancements

Potential improvements:
- Support for additional custom fields
- Multiple certificate templates per event
- Bulk re-send functionality
- Certificate download from student dashboard
- QR code verification
- Certificate templates library
- Signature image support
- Multi-page certificate support

## Security Considerations

- Only admin/faculty can upload and configure certificates
- PDF templates validated on upload
- File size limits enforced (10MB)
- Email credentials stored in environment variables
- Student data protected in database

## Performance Notes

- Certificates generated sequentially to avoid overwhelming email server
- 500ms delay between individual sends
- 2 second delay between event batches
- Email sending runs in background
- System continues on individual failures

---

**Last Updated**: November 2024
**Version**: 1.0.0

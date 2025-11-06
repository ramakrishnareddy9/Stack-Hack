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
- `socket.io-client` - Real-time notifications

## Configuration

### 1. Email Setup
Add to your `.env`:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password
```

### 2. Frontend Socket URL
Add to your frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

## Usage

### For Administrators

1. **Create Event with Certificate**
   - Go to Create Event page
   - Upload certificate template PDF
   - Click on PDF preview to place fields
   - Configure field properties (size, color)
   - Enable "Auto-send certificates" option

2. **Manual Certificate Sending**
   - Navigate to event details
   - Click "Send Certificates" button
   - System will generate and email certificates to all participants

3. **Monitor Certificate Status**
   - Check event details for "Certificates Sent" status
   - Review email delivery logs in console
   - Track notification delivery in database

### For Students

1. **Receive Certificate**
   - Get email notification with PDF attachment
   - See in-app notification when certificate is ready
   - Download certificate from email

## API Endpoints

### Certificate Routes (`/api/certificates`)
- `POST /send/:eventId` - Manually trigger certificate sending
- `GET /test/:eventId` - Test certificate generation without sending

### Notification Routes (`/api/notifications-api`)
- `GET /` - Get user's notifications
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification

## Testing

### Test Certificate Generation
1. Create a test event with a certificate template
2. Add test participants with valid email addresses
3. Use the test endpoint: `GET /api/certificates/test/:eventId`
4. Check generated certificate preview

### Test Auto-Send
1. Create event with past end date
2. Enable auto-send in certificate config
3. Run manual check: `triggerCertificateCheck()`
4. Verify certificates are sent

## Troubleshooting

### Common Issues

1. **Certificates not sending**
   - Check email credentials in `.env`
   - Verify Gmail allows less secure apps
   - Check participant email addresses

2. **PDF fields not appearing**
   - Ensure coordinates are correctly saved
   - Check font size is not too small
   - Verify PDF template is valid

3. **Socket notifications not working**
   - Check Socket.IO connection in browser console
   - Verify user is joined to correct room
   - Check server Socket.IO logs

## Architecture

### Data Flow
1. Admin uploads certificate template
2. Admin configures field positions
3. Event ends or admin triggers sending
4. System generates personalized certificates
5. Certificates sent via email
6. Notifications sent via Socket.IO
7. Database records created for tracking

### Components
- **Backend**:
  - `certificateGenerator.js` - Core generation logic
  - `certificateScheduler.js` - Automated scheduling
  - Notification model - Database storage
- **Frontend**:
  - Certificate configurator component
  - PDF preview with react-pdf
  - Socket context for notifications

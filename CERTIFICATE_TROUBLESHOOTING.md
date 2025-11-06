# Certificate Feature Troubleshooting Guide

## Common Errors and Solutions

### Error: "Certificate template not configured"

**Problem**: Trying to generate/preview certificates without uploading a template.

**Solution**:
1. Navigate to Admin → Events
2. Click "Certificate Config" on the event
3. Click "Choose File" under "Upload Template"
4. Select your PDF certificate template
5. Click "Upload Template"
6. Wait for success message

---

### Error: "Please configure field positions"

**Problem**: Template uploaded but field positions not set.

**Solution**:
1. In the left panel, click "👤 Student Name"
2. Click on the PDF preview where you want the student's name
3. Repeat for "🎯 Event Name" and "📅 Date"
4. Adjust font size/color if needed
5. Click "💾 Save Configuration"

---

### Error: "No students to send certificates to"

**Problem**: No participants marked as "attended" or "completed".

**Solution**:
1. Go to Admin → Participations
2. Find students who attended the event
3. Click "Approve" or change status to "attended"
4. Return to Certificate Config
5. Try generating again

---

### Error: "Failed to fetch dynamically imported module"

**Problem**: PDF.js worker file not loading correctly.

**Solution**:
1. Stop the React dev server (Ctrl+C)
2. Run: `cd frontend`
3. Run: `node scripts/copy-pdf-worker.js`
4. Run: `npm start`
5. Clear browser cache (Ctrl+Shift+R)

---

### Error: "Request failed with status code 401"

**Problem**: Authentication token expired or invalid.

**Solution**:
1. Logout from the admin panel
2. Login again
3. Try the operation again

---

### Error: "Request failed with status code 400 or 500"

**Problem**: Server-side error or validation failure.

**Solution**:
1. Check backend console logs for detailed error
2. Ensure MongoDB is running
3. Restart backend server: `npm run dev`
4. Check if event exists in database
5. Verify certificate template file exists in `backend/uploads/certificates/`

---

## Step-by-Step Checklist

Before sending certificates, ensure:

- [ ] Event is created and published
- [ ] Students have registered for the event
- [ ] Participations are approved
- [ ] Students are marked as "attended" or "completed"
- [ ] Certificate PDF template is uploaded
- [ ] Field positions are set (Name, Event, Date)
- [ ] Test preview shows correct output
- [ ] Configuration is saved
- [ ] Email settings are configured in backend .env

---

## Backend Setup Verification

### Check Email Configuration

Verify these in `backend/.env`:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

### Check MongoDB Connection

Backend console should show:
```
MongoDB Connected
```

### Check Server Running

Backend should show:
```
Server running on port 5000
Socket.IO server initialized
✅ Certificate scheduler initialized
```

---

## Frontend Setup Verification

### Check Dependencies

Run in frontend folder:
```
npm list react-pdf
```

Should show `react-pdf@10.2.0` or similar.

### Check Worker File

Verify file exists:
```
frontend/public/pdf.worker.js
```

If missing, run:
```
node scripts/copy-pdf-worker.js
```

---

## Testing the Complete Flow

### Minimal Test Setup:

1. **Create Test Event**:
   - Title: "Test Event"
   - End Date: Yesterday (for immediate sending)
   - Status: Published

2. **Add Test Student**:
   - Register as a student
   - Register for the event
   - Approve the participation
   - Mark as "attended"

3. **Configure Certificate**:
   - Create simple PDF (use Canva)
   - Upload to event
   - Set 3 field positions
   - Test preview

4. **Generate & Send**:
   - Click "Generate & Send Certificates"
   - Check backend console for logs
   - Check student's email
   - Check student's notifications

---

## Debug Mode

### Enable Detailed Logging

In `backend/routes/certificates.js`, logs are already present showing:
- Certificate generation start
- Each student processing
- Success/failure status
- Email sending results

Watch backend console while generating certificates.

### Check Database

Use MongoDB Compass or mongosh:
```javascript
// Find event with certificate config
db.events.findOne({ _id: ObjectId("YOUR_EVENT_ID") })

// Check participations
db.participations.find({ 
  event: ObjectId("YOUR_EVENT_ID"),
  status: { $in: ["attended", "completed"] }
})

// Check notifications
db.notifications.find({ type: "certificate" })
```

---

## Quick Fix Commands

### Reset Everything (Frontend)
```bash
cd frontend
rm -rf node_modules
npm install
node scripts/copy-pdf-worker.js
npm start
```

### Reset Backend
```bash
cd backend
npm install
npm run dev
```

### Clear Browser Data
- Press `Ctrl+Shift+Delete`
- Select "Cached images and files"
- Click "Clear data"
- Reload page (`Ctrl+F5`)

---

## Still Having Issues?

### Check These Files Exist:

Backend:
- `backend/models/Event.js` (updated with certificate fields)
- `backend/routes/certificates.js`
- `backend/utils/certificateGenerator.js`
- `backend/utils/certificateScheduler.js`
- `backend/middleware/auth.js` (supports x-auth-token)

Frontend:
- `frontend/src/pages/Admin/CertificateConfig.js`
- `frontend/public/pdf.worker.js`
- `frontend/scripts/copy-pdf-worker.js`

### Verify Package Versions:

Backend (`package.json`):
- `pdf-lib` installed
- `nodemailer` installed
- `multer` installed

Frontend (`package.json`):
- `react-pdf@10.2.0` or similar
- No separate `pdfjs-dist` in dependencies

---

## Getting Help

If errors persist:

1. **Check Console Logs**:
   - Backend terminal output
   - Browser console (F12)
   
2. **Review Error Messages**:
   - Copy exact error text
   - Note when it occurs
   
3. **Check File Paths**:
   - Verify template upload succeeded
   - Check uploads folder has PDF file
   
4. **Test Components Separately**:
   - Test file upload alone
   - Test field positioning alone
   - Test preview alone
   - Test sending alone

---

**Last Updated**: November 2024

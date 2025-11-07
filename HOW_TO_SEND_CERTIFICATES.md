# How to Send Certificates to Participants

## Quick Start Guide

Follow these steps to generate and send certificates to all event participants:

## Step 1: Prepare Your Event

1. **Create an Event** in Admin > Events
2. **Publish the Event** so students can register
3. **Approve Participations** for students who attended
4. **Mark Attendance** or change status to "attended" or "completed"

## Step 2: Create/Get a Certificate Template

### Option A: Use Canva (Recommended)
1. Go to https://canva.com
2. Search for "Certificate" templates
3. Choose a design you like
4. Leave blank spaces for:
   - Student Name
   - Event Name
   - Date
5. Download as PDF

### Option B: Use Microsoft Word
1. Create a certificate layout
2. Leave spaces for dynamic fields
3. Save as PDF

### Option C: Download Free Templates
- Template.net
- FreePik.com
- Microsoft Office Templates

## Step 3: Configure Certificate

1. **Navigate** to Admin > Events
2. **Click** "Certificate Config" button on your event
3. **Upload Template**:
   - Click "Choose File"
   - Select your PDF template
   - Click "Upload Template"
   - Wait for upload to complete

4. **Set Field Positions**:
   - Click on "👤 Student Name" in the left panel
   - Click on the PDF where you want the student's name
   - Click on "🎯 Event Name" in the left panel
   - Click on the PDF where you want the event name
   - Click on "📅 Date" in the left panel
   - Click on the PDF where you want the date
   
5. **Adjust Font Settings** (optional):
   - Change font size for each field
   - Change text color if needed

6. **Test Your Configuration**:
   - Click "👁️ Test Preview"
   - A new tab will open with a sample certificate
   - Check if all fields are positioned correctly
   - Adjust positions if needed

7. **Save Configuration**:
   - Click "💾 Save Configuration"
   - Wait for success message

## Step 4: View Preview & Send Certificates

### Option A: Manual Send (Immediate)

1. **Click** "📧 Generate & Send Certificates" button
2. **Confirm** the action
3. **Wait** for the process to complete
4. **Check** the success/failure count

### Option B: Auto-Send (Scheduled)

1. **Enable** "Auto-send after event completion" checkbox
2. **Save Configuration**
3. Certificates will be **automatically sent** 1 hour after the event ends

## What Happens When You Send Certificates?

The system will:

1. ✅ **Generate** a unique certificate for each participated student
2. ✅ **Auto-fill** their name, event name, and date
3. ✅ **Send via Email** as a PDF attachment
4. ✅ **Send In-App Notification** to the student's dashboard
5. ✅ **Store Notification** in database for offline students

## Who Receives Certificates?

Only students with status:
- **"attended"** - Marked present at the event
- **"completed"** - Successfully completed the event

Students with status "pending", "approved", or "rejected" will NOT receive certificates.

## Email Details

Students will receive an email with:
- **Subject**: Certificate for [Event Name]
- **Message**: Congratulations with event details
- **Attachment**: PDF certificate with their name
- **Filename**: `Certificate_[StudentName]_[EventName].pdf`

## In-App Notification

Students will see:
- 🔔 Notification bell in their dashboard
- 📱 Message: "Your certificate for [Event] is ready!"
- The notification is clickable (can be viewed in their notifications page)

## Troubleshooting

### "Certificate template not configured"
➡️ Upload a PDF template first

### "No students to send certificates to"
➡️ Mark students as "attended" or "completed" in Participations page

### Fields not positioned correctly
➡️ Use Test Preview frequently while adjusting positions

### Email not received
➡️ Check student's email address is correct
➡️ Check spam/junk folder
➡️ Verify EMAIL_USER and EMAIL_PASS in backend .env file

### PDF Worker Error
➡️ Restart your React dev server
➡️ Clear browser cache
➡️ Check frontend/public/pdf.worker.js exists

## Tips for Best Results

1. ⭐ **Test First**: Always use "Test Preview" before sending to students
2. ⭐ **Check Attendance**: Verify students are marked as "attended"
3. ⭐ **Save Configuration**: Always save before generating
4. ⭐ **Monitor Logs**: Watch the backend console for any errors
5. ⭐ **Verify Email Settings**: Test email configuration first

## Viewing Certificate Status

After sending certificates:
- Check backend console for success/failure count
- Review in-app notifications sent
- Students can check their notifications page
- Check email logs if issues arise

## Re-sending Certificates

If you need to re-send:
1. The system prevents duplicate sends by default
2. To re-send, you would need to reset the `certificatesSent` flag in the database
3. Or students can request re-send from admin

## Example Workflow

```
1. Create Event: "Tree Plantation Drive"
2. Publish Event
3. Students Register
4. Event Happens
5. Mark 20 students as "attended"
6. Go to Certificate Config
7. Upload certificate template
8. Set field positions (Name, Event, Date)
9. Test Preview → Looks good!
10. Save Configuration
11. Click "Generate & Send Certificates"
12. ✅ 20 certificates sent!
13. Students receive email + in-app notification
```

## Need Help?

- See `CERTIFICATE_FEATURE.md` for technical details
- See `CERTIFICATE_TEMPLATE_GUIDE.md` for template creation
- Check backend console logs for errors
- Use Test Preview feature extensively

---

**Quick Reference**:
- Upload Template → Set Positions → Test Preview → Save Config → Generate & Send

**Happy Certificate Sending! 🎉**

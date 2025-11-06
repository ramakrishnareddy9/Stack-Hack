# Notification & Email Debugging Guide

## Quick Debug Checklist

### 1. Check Server Console When Publishing
When you click "Publish" on an event, you should see in the server console:

```
🔐 Publish attempt by user: [Your Name] ([email])
   User ID: [id]
   User Role: admin
   Required Roles: admin, faculty
✅ Authorization successful for admin

🎯 ===== PUBLISHING EVENT: [Event Name] =====
   Event ID: [id]
   Status: published

📋 Step 1: Fetching students...
✅ Found X registered students with email addresses

📧 Step 2: Starting email notifications...
📧 ===== Starting email notification for event: [Event Name] =====
📋 Total registered students to notify: X
📬 Students with valid email addresses: X
✅ Email configuration verified, starting to send emails...
Attempting to send email to: [email]
Email sent successfully to [email]: [messageId]

🔔 Step 3: Starting WebSocket notifications...
   Socket.IO available. Connected clients: X
   📤 Sending to room: user-[id] ([Name])
   📢 Broadcasting to all connected clients...
✅ WebSocket: Sent to X student rooms + broadcast

🎯 ===== PUBLISH COMPLETE =====
```

### 2. Check Browser Console (Student Login)
When a student logs in, you should see:

```
🔌 Initializing Socket.IO connection for user: [User Object]
   User ID: [id]
   User Role: student
   Connecting to: http://localhost:5000
✅ Socket.IO connected: [socketId]
👤 Joining user room: [userId]
✅ Joined room: user-[userId]
✅ Successfully joined room: {room: "user-[id]", userId: "[id]"}
```

When an event is published, you should see:
```
🔔 New event notification received: [notification data]
📡 Socket event received: new-event [data]
```

### 3. Common Issues

#### Issue: No emails sent
**Check:**
- Server console shows "Email configuration verified"
- Server console shows "Attempting to send email to: [email]"
- Check spam folder
- Run: `node backend/utils/test-email.js`

#### Issue: No WebSocket notifications
**Check:**
- Browser console shows "Socket.IO connected"
- Browser console shows "Successfully joined room"
- Server console shows "Connected clients: X" (should be > 0)
- Server console shows "📤 Sending to room: user-[id]"

#### Issue: 403 Forbidden
**Fix:**
```bash
node backend/utils/check-user-role.js your_email@example.com
node backend/utils/check-user-role.js your_email@example.com admin
```
Then log out and log back in.

## Test Commands

1. **Test Email Configuration:**
   ```bash
   node backend/utils/test-email.js
   ```

2. **Test Notification System:**
   ```bash
   node backend/utils/debug-notifications.js
   ```

3. **Test Full Notification Flow:**
   ```bash
   node backend/utils/test-notifications.js [eventId]
   ```

4. **Check User Role:**
   ```bash
   node backend/utils/check-user-role.js your_email@example.com
   ```

## Step-by-Step Testing

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **In one browser tab:** Log in as admin
   - Create an event
   - Publish the event
   - Watch server console for detailed logs

3. **In another browser tab (or incognito):** Log in as student
   - Watch browser console for Socket.IO connection
   - Should see notification when event is published

4. **Check email inbox** for the student email address

## Expected Behavior

### When Publishing Event:
- ✅ Server: Finds all students
- ✅ Server: Sends emails (check console for progress)
- ✅ Server: Sends WebSocket notifications
- ✅ Browser (student): Receives notification
- ✅ Email: Arrives in inbox

### When Approving Participation:
- ✅ Server: Sends email to approved student
- ✅ Server: Sends WebSocket notification
- ✅ Browser (student): Receives notification
- ✅ Email: Arrives in inbox

## Troubleshooting

If emails work in debug script but not in app:
1. Check if `.env` file is in `backend/` directory
2. Check if server is reading `.env` correctly
3. Check server console for error messages
4. Verify transporter is initialized (should see "Email transporter is ready")

If notifications don't appear:
1. Check browser console for Socket.IO connection
2. Verify user joined the correct room
3. Check server console shows "Connected clients: X"
4. Try refreshing the student browser tab


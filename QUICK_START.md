# Quick Start Guide - NSS Activity Portal

## 🚀 Running the Project

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Set Up Environment Variables
Create `backend/.env` file with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nss-portal
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start MongoDB
Make sure MongoDB is running on your system.

### Step 4: Start the Application
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend app on `http://localhost:3000`

## 📧 Testing Email & Notifications

### Test Email Configuration:
```bash
node backend/utils/test-email.js
```

### Test Notifications:
```bash
node backend/utils/debug-notifications.js
```

## 🔍 Debugging Notifications

### When Publishing an Event:

1. **Check Server Console** - You should see:
   ```
   🎯 ===== PUBLISHING EVENT: [Event Name] =====
   📋 Step 1: Fetching students...
   ✅ Found X registered students
   📧 Step 2: Starting email notifications...
   🔔 Step 3: Starting WebSocket notifications...
   ```

2. **Check Browser Console (Student)** - You should see:
   ```
   ✅ Socket.IO connected
   ✅ Joined room: user-[id]
   🔔 New event notification received
   ```

3. **Check Email Inbox** - Student should receive email

### Common Fixes:

**If emails don't send:**
- Verify `.env` file exists in `backend/` folder
- Check server console for "Email transporter is ready"
- Run `node backend/utils/test-email.js` to test

**If notifications don't appear:**
- Check browser console for Socket.IO connection
- Verify student is logged in
- Check server console shows "Connected clients: X"

**If 403 Forbidden:**
```bash
node backend/utils/check-user-role.js your_email@gmail.com admin
```
Then log out and log back in.

## 📝 Creating First Admin User

1. Register normally through the UI
2. Update role to admin:
   ```bash
   node backend/utils/check-user-role.js your_email@gmail.com admin
   ```
3. Log out and log back in

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] `.env` file exists in `backend/` directory
- [ ] Email credentials are set in `.env`
- [ ] Server starts without errors
- [ ] Frontend loads at `http://localhost:3000`
- [ ] Can log in as admin
- [ ] Can create events
- [ ] Can publish events
- [ ] Server console shows notification logs
- [ ] Student receives email when event published
- [ ] Student sees notification in app


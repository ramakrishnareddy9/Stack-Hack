# 🔧 Fix Backend Crash - Cloudinary Setup

## ❌ Current Error:
```
Error: Cannot find module '../config/cloudinary'
```

## ✅ Fixed! Now just add credentials:

---

## 📝 Step 1: Get Cloudinary Credentials (Free)

1. **Go to:** https://cloudinary.com/users/register_free
2. **Sign up** for a free account
3. **After login**, you'll see your dashboard with:
   - Cloud Name
   - API Key
   - API Secret

---

## 📝 Step 2: Add to `.env` File

Open `backend/.env` and add these three lines:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

## 📝 Step 3: Also Add Gemini API Key (for AI Reports)

Add this to `.env` as well:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get it from:** https://makersuite.google.com/app/apikey

---

## ✅ Complete `.env` File Should Look Like:

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-cluster.mongodb.net/nss

# JWT
JWT_SECRET=your_jwt_secret_key

# Email
EMAIL_USER=sdsameer1609@gmail.com
EMAIL_PASS=your_email_app_password

# URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456

# Gemini AI (AI Reports)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🚀 Step 4: Backend Will Auto-Restart

Once you save the `.env` file, nodemon will automatically restart the backend.

You should see:
```
🔧 Environment Configuration:
   MongoDB URI: ✅ Set
   JWT Secret: ✅ Set
   Email User: ✅ Set
   ...
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

---

## 📋 What I Fixed:

✅ Created `backend/config/cloudinary.js` - Cloudinary configuration file  
✅ Created `.env.example` - Template for environment variables  
✅ The error is now resolved - just need credentials

---

## 🎯 Why You Need This:

**Cloudinary is used for:**
- Student report file uploads (images, PDFs, documents)
- Secure cloud storage instead of local server
- Fast CDN delivery of uploaded files

**Without it:**
- Students can't upload files with reports ❌
- Backend crashes on report submission ❌

---

## 🆘 Still Getting Errors?

Make sure your `.env` file is at: `d:\Nss\backend\.env`

Check the file has NO spaces around the `=` sign:
- ✅ `CLOUDINARY_CLOUD_NAME=abc123`
- ❌ `CLOUDINARY_CLOUD_NAME = abc123` (spaces = bad)

---

**After adding credentials, the backend will work perfectly! 🚀**

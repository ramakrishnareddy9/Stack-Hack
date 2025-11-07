# Certificate System - Deployment Configuration Guide

## 🚀 Changes Needed for Production Deployment

### Problem
Currently, the system uses `localhost:5000` URLs which won't work when deployed to a production server.

---

## 1️⃣ Backend Environment Variables

Add these to your `.env` file in production:

```env
# Existing variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=sdsameer1609@gmail.com
EMAIL_PASS=your_app_password

# ✨ NEW: Add these for deployment
BACKEND_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Example for Render/Heroku deployment:
# BACKEND_URL=https://nss-portal-api.onrender.com
# FRONTEND_URL=https://nss-portal.netlify.app
```

---

## 2️⃣ Certificate URL Generation (Backend)

**File**: `backend/utils/certificateGenerator.js`

### Current Code (Lines 258-263):
```javascript
// ❌ This creates relative URLs only
const certFileName = `cert_${student._id}_${event._id}_${Date.now()}.png`;
const certPath = path.join(__dirname, '..', 'uploads', 'certificates', 'generated', certFileName);
await fs.mkdir(path.dirname(certPath), { recursive: true });
await fs.writeFile(certPath, certificateBuffer);
const certUrl = `/uploads/certificates/generated/${certFileName}`;
```

### Should be Changed To:
```javascript
// ✅ Creates full URL for production
const certFileName = `cert_${student._id}_${event._id}_${Date.now()}.png`;
const certPath = path.join(__dirname, '..', 'uploads', 'certificates', 'generated', certFileName);
await fs.mkdir(path.dirname(certPath), { recursive: true });
await fs.writeFile(certPath, certificateBuffer);

// Use BACKEND_URL from environment for production
const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
const certUrl = `${baseUrl}/uploads/certificates/generated/${certFileName}`;
```

---

## 3️⃣ Frontend Certificate Display (Student Dashboard)

**File**: `frontend/src/pages/Student/Dashboard.js`

### Current Code (Lines 218-229):
```javascript
// ❌ Hardcoded localhost
<a href={`http://localhost:5000${cert.certificate.url}`} target="_blank">
  View
</a>
<button onClick={() => handleDownloadCertificate(cert)}>
  Download
</button>
```

### Should be Changed To:
```javascript
// ✅ Use environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

<a href={cert.certificate.url} target="_blank">
  View
</a>
<button onClick={() => handleDownloadCertificate(cert)}>
  Download
</button>
```

### And update the download function:
```javascript
const handleDownloadCertificate = async (cert) => {
  try {
    // Certificate URL is now complete, use it directly
    const response = await fetch(cert.certificate.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificate_${cert.event.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Certificate downloaded!');
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download certificate');
  }
};
```

---

## 4️⃣ Frontend Environment Variables

Create/update `frontend/.env.production`:

```env
REACT_APP_API_URL=https://your-backend-domain.com
```

---

## 🌐 How Certificates Flow After Deployment

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN GENERATES CERTIFICATES                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Production Server)                                │
│  ─────────────────────────────────────────────────────────  │
│  1. Generates PNG certificates                              │
│  2. Saves to:                                               │
│     • /uploads/certificates/generated/cert_xxx.png          │
│  3. Creates FULL URL:                                       │
│     • https://nss-api.com/uploads/certificates/.../xxx.png  │
│  4. Saves URL to MongoDB                                    │
│  5. Sends email with attachment                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  EMAIL TO STUDENT                                           │
│  ─────────────────────────────────────────────────────────  │
│  • Certificate PNG attached                                 │
│  • Student receives immediately                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  MONGODB (Cloud Database)                                   │
│  ─────────────────────────────────────────────────────────  │
│  Participation.certificate = {                              │
│    url: "https://nss-api.com/uploads/.../cert_xxx.png",     │
│    generatedAt: "2024-11-06T16:15:00.000Z"                  │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  STUDENT DASHBOARD (Frontend)                               │
│  ─────────────────────────────────────────────────────────  │
│  1. Fetches: GET https://nss-api.com/api/certificates/my... │
│  2. Receives full URLs from MongoDB                         │
│  3. Displays certificates with:                             │
│     • View: Opens https://nss-api.com/uploads/.../xxx.png   │
│     • Download: Fetches and saves PNG                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ STUDENT ACCESS FROM ANYWHERE                            │
│  ─────────────────────────────────────────────────────────  │
│  • Opens web app: https://nss-portal.com                    │
│  • Sees certificates in dashboard                           │
│  • Can view/download from any device                        │
│  • Works from home, college, mobile, etc.                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Storage Options for Production

### **Option 1: Server File System (Basic)**
- Store certificates in `/uploads` folder on server
- Works for small scale (< 1000 certificates)
- **Pros**: Simple, no extra cost
- **Cons**: Files lost if server restarts (on some platforms)

### **Option 2: Cloud Storage (Recommended)**
- Use **Cloudinary** (already configured in your app!)
- Upload certificates to cloud after generation
- **Pros**: Permanent storage, CDN delivery, scalable
- **Cons**: Slight complexity

---

## 🔧 Recommended: Use Cloudinary for Production

### Update `certificateGenerator.js` to upload to Cloudinary:

```javascript
const cloudinary = require('../config/cloudinary');

// After generating certificate
const certFileName = `cert_${student._id}_${event._id}_${Date.now()}.png`;

// Upload to Cloudinary instead of local storage
const uploadResult = await cloudinary.uploader.upload(
  `data:image/png;base64,${certificateBuffer.toString('base64')}`,
  {
    folder: 'nss-certificates',
    public_id: certFileName.replace('.png', ''),
    resource_type: 'image'
  }
);

// Use Cloudinary URL (works globally!)
const certUrl = uploadResult.secure_url;

// Save to MongoDB
await Participation.findOneAndUpdate(
  { student: student._id, event: event._id },
  { 
    certificate: {
      url: certUrl,  // Full Cloudinary URL
      publicId: uploadResult.public_id,
      generatedAt: new Date()
    }
  }
);
```

---

## 🌍 Deployment Platforms

### **Backend Options:**
- Render (recommended)
- Heroku
- Railway
- AWS EC2

### **Frontend Options:**
- Netlify
- Vercel
- GitHub Pages

### **Database:**
- MongoDB Atlas (cloud)

---

## ✅ Deployment Checklist

- [ ] Add `BACKEND_URL` to backend .env
- [ ] Add `FRONTEND_URL` to backend .env
- [ ] Update certificate URL generation with `BACKEND_URL`
- [ ] Add `REACT_APP_API_URL` to frontend .env
- [ ] Update Dashboard.js to use full URLs
- [ ] Configure Cloudinary for certificate storage (recommended)
- [ ] Test certificate generation on staging
- [ ] Test email delivery
- [ ] Test student dashboard access
- [ ] Verify download functionality

---

## 🎯 Summary

**After deployment, certificates flow like this:**

1. **Admin** generates → **Backend** creates PNG
2. **Backend** uploads to Cloudinary/Server → Gets public URL
3. **Backend** saves URL to MongoDB → Sends email with attachment
4. **Student** opens dashboard → Fetches URLs from MongoDB
5. **Student** clicks View/Download → Accesses certificate from cloud

**Key Point**: Use FULL URLs (with domain) instead of relative paths, so certificates work from anywhere in the world! 🌍

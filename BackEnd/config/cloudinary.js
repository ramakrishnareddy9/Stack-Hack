const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage for different file types
const createStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `nss-portal/${folder}`,
      allowed_formats: allowedFormats,
      resource_type: 'auto',
      transformation: folder === 'evidence-images' ? [{ width: 1000, height: 1000, crop: 'limit' }] : undefined
    }
  });
};

// Storage configurations
const imageStorage = createStorage('evidence-images', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
const documentStorage = createStorage('evidence-documents', ['pdf', 'doc', 'docx']);
const profileStorage = createStorage('profile-pictures', ['jpg', 'jpeg', 'png']);

// File filter functions
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF and WebP images are allowed.'), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC and DOCX documents are allowed.'), false);
  }
};

// Multer upload configurations
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Upload multiple evidence files (mixed types)
const uploadEvidence = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (file, folder) => {
  try {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `nss-portal/${folder}`,
      resource_type: 'auto',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      type: file.mimetype.startsWith('image') ? 'image' : 'document'
    };
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

// Helper function to delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadDocument,
  uploadProfile,
  uploadEvidence,
  uploadToCloudinary,
  deleteFromCloudinary
};

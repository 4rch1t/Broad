const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const logger = require('../utils/logger');

// Configure AWS S3
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Check if we should use S3 or local storage
const useS3 = process.env.STORAGE_TYPE === 's3';

// Define file filter
const fileFilter = (req, file, cb) => {
  // Allow images, videos, PDFs, and documents
  const allowedFileTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'video/mp4', 
    'video/quicktime', 
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, PDFs, and documents are allowed.'), false);
  }
};

// Generate random filename
const generateFileName = (file) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(file.originalname);
  return `${timestamp}-${randomString}${extension}`;
};

// Configure storage
let storage;

if (useS3) {
  // S3 storage
  storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const folder = req.uploadFolder || 'uploads';
      const fileName = generateFileName(file);
      cb(null, `${folder}/${fileName}`);
    }
  });
} else {
  // Local storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
      cb(null, generateFileName(file));
    }
  });
}

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error:', err);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  
  if (err) {
    logger.error('Upload error:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
  
  next();
};

// Export configured multer and error handler
module.exports = upload;
module.exports.handleMulterError = handleMulterError;
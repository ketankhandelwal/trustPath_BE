require('dotenv').config();
console.log('[middlewares/upload] Loading multer upload config (memory storage for S3)');

const multer = require('multer');

const storage = multer.memoryStorage();
console.log('[upload] Using in-memory storage (buffer uploaded to S3 downstream)');

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const fileFilter = (req, file, cb) => {
  console.log('[upload.fileFilter] Checking mime:', file.mimetype);
  if (ALLOWED_MIME.has(file.mimetype)) {
    console.log('[upload.fileFilter] Mime allowed');
    cb(null, true);
  } else {
    console.log('[upload.fileFilter] Mime rejected:', file.mimetype);
    cb(new Error('Only PDF, PNG, JPEG, and Word files are allowed'));
  }
};

const limitMB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 20;
console.log('[upload] Max upload size MB:', limitMB);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: limitMB * 1024 * 1024 },
});

module.exports = { upload };

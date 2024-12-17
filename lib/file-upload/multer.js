import multer from 'multer';
import { response400 } from '../response-messages/index.js';
import { max_file_size } from '../../utils/constant.js';

// Set up Multer storage to keep files in memory (or you can use disk storage)
const storage = multer.memoryStorage(); // Store files in memory buffer

// Define file upload limits and allowed MIME types (optional)
const upload = multer({
  storage: storage,
  limits: { fileSize: max_file_size * 1024 * 1024 }, // size limit
  fileFilter: (req, file, cb) => {
    if (req.files && req.files.length > max_file_size) {
      return cb(new Error(`You can upload a maximum of 5 files.`));
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/svg+xml']; // Allowed file types
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  },
});

// Error-handling middleware for Multer
const multerErrorHandler = (err, req, res, next) => {
  if (err) {
    return response400(res, err.message);
  }
  else {
    next();
  }
};

export { upload, multerErrorHandler };
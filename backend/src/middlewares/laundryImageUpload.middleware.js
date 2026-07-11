const multer = require('multer');

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      const error = new Error('Unsupported image type. Use JPEG, PNG, or WebP.');
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

const parseLaundryImageUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error?.code === 'LIMIT_FILE_SIZE') {
      error.statusCode = 413;
      error.message = `Image exceeds the ${MAX_IMAGE_BYTES / 1024 / 1024} MB limit.`;
    }
    return error ? next(error) : next();
  });
};

module.exports = { parseLaundryImageUpload, MAX_IMAGE_BYTES, ALLOWED_IMAGE_TYPES };

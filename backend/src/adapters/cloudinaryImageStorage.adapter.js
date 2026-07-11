const { v2: cloudinary } = require('cloudinary');

const requiredConfig = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

const assertConfigured = () => {
  const missing = requiredConfig.filter((key) => !process.env[key]);
  if (missing.length) {
    const error = new Error(`Cloudinary configuration is missing: ${missing.join(', ')}`);
    error.statusCode = 503;
    throw error;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

const uploadLaundryWorkImage = ({ buffer, workId, originalName }) => {
  assertConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: `laundry/works/${workId}`,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      filename_override: originalName,
    }, (error, result) => (error ? reject(error) : resolve(result)));
    stream.end(buffer);
  });
};

const deleteLaundryWorkImage = async (publicId) => {
  if (!publicId) return { result: 'not_found' };
  assertConfigured();
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  if (!['ok', 'not found'].includes(result.result)) throw new Error(`Cloudinary delete failed: ${result.result}`);
  return result;
};

module.exports = { uploadLaundryWorkImage, deleteLaundryWorkImage };

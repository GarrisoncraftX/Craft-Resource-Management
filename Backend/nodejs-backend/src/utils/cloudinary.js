const cloudinary = require('cloudinary').v2;
const { logger } = require('./logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  async uploadFile(fileBuffer, options = {}) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', ...options },
          (error, result) => {
            if (error) reject(error);
            else {
              logger.info(`File uploaded to Cloudinary: ${result.secure_url}`);
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      logger.error('Failed to upload file to Cloudinary:', error);
      throw new Error('File upload failed');
    }
  }

  async uploadMultipleFiles(files) {
    const uploadPromises = files.map(file => this.uploadFile(file.buffer));
    return await Promise.all(uploadPromises);
  }
}

module.exports = new CloudinaryService();

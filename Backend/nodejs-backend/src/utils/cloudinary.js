const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { logger } = require('./logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  async uploadFile(filePath, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'auto',
        ...options,
      });

      logger.info(`File uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      logger.error('Failed to upload file to Cloudinary:', error);
      throw new Error('File upload failed');
    }
  }

  async uploadMultipleFiles(files) {
    const uploadPromises = files.map(file => this.uploadFile(file.path));
    const results = await Promise.all(uploadPromises);

    // Clean up uploaded files from local storage
    files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        logger.error('Failed to delete local file:', err);
      }
    });

    return results;
  }
}

module.exports = new CloudinaryService();

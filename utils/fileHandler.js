const cloudinary = require('../config/cloudinary'); // Import the Cloudinary config
const ApiError = require('./ApiError');
const path = require('path');

const fileHandler = {
  async saveFile(file, directory) {
    try {
      const uploadResult = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        folder: directory,
        resource_type: 'auto',
      });
      return uploadResult.secure_url;
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', {
        message: error.message,
        stack: error.stack,
        details: error.response ? error.response.data : null,
      });
      throw new ApiError(500, 'Error uploading file to Cloudinary');
    }
  },

  async deleteFile(fileUrl) {
    try {
      // Extract the public ID from the Cloudinary URL
      const publicId = fileUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new ApiError(500, 'Error deleting file from Cloudinary');
    }
  },

  getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  },

  isValidFileType(file, allowedTypes) {
    const extension = this.getFileExtension(file.originalname);
    return allowedTypes.includes(extension);
  },
};

module.exports = fileHandler;
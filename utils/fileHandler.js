const fs = require('fs').promises;
const path = require('path');
const ApiError = require('./ApiError');

const fileHandler = {
  async saveFile(file, directory) {
    try {
      const uploadDir = path.join(__dirname, '../', directory); 
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      const publicPath = path.join(directory, fileName); 

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, file.buffer);
      
      return publicPath; 
    } catch (error) {
      throw new ApiError(500, 'Error saving file');
    }
  },

  async deleteFile(filePath) {
    try {
      const absolutePath = path.join(__dirname, '../', filePath);
      await fs.unlink(absolutePath);
    } catch (error) {
      if (error.code !== 'ENOENT') { 
        throw new ApiError(500, 'Error deleting file');
      }
    }
  },

  getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  },

  isValidFileType(file, allowedTypes) {
    const extension = this.getFileExtension(file.originalname);
    return allowedTypes.includes(extension);
  },

  async getFullPath(relativePath) {
    return path.join(__dirname, '../', relativePath);
  }
};

module.exports = fileHandler;
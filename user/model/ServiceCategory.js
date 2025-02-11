const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  categoryName: String,
  subcategories: [{
    subcategoryName: String,
    serviceTypes: [{
      serviceName: String,
      description: String
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema); 
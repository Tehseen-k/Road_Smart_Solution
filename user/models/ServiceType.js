const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema({
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceSubcategory'
  },
  serviceName: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('ServiceType', serviceTypeSchema); 
const mongoose = require('mongoose');

const estimateSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest'
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  estimatedPrice: Number,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected']
  }
}, { timestamps: true });

module.exports = mongoose.model('Estimate', estimateSchema); 
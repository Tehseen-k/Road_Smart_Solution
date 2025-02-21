const mongoose = require('mongoose');

const insuranceEstimateSchema = new mongoose.Schema({
  insuranceReqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsuranceRequest'
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  estimatedPremium: Number,
  coverageDetails: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected']
  }
}, { timestamps: true });

module.exports = mongoose.model('InsuranceEstimate', insuranceEstimateSchema); 
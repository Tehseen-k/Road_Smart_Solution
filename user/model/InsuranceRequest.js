const mongoose = require('mongoose');

const insuranceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  serviceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType'
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceVehicle'
  },
  sumInsured: Number,
  startDate: Date,
  durationMonths: Number,
  estimates: [{
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
  }]
}, { timestamps: true });

module.exports = mongoose.model('InsuranceRequest', insuranceRequestSchema); 
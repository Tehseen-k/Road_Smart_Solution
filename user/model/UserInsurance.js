const mongoose = require('mongoose');

const userInsuranceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceVehicle'
  },
  insuranceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType'
  },
  estimateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsuranceRequest'
  },
  policyNumber: {
    type: String,
    unique: true
  },
  sumInsured: Number,
  premiumAmount: Number,
  coverageDetails: String,
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled']
  }
}, { timestamps: true });

module.exports = mongoose.model('UserInsurance', userInsuranceSchema); 
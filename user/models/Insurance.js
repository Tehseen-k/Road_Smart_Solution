const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceVehicle',
    required: true
  },
  insuranceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType',
    required: true
  },
  policyNumber: {
    type: String,
    unique: true,
    required: true
  },
  sumInsured: {
    type: Number,
    required: true
  },
  premiumAmount: {
    type: Number,
    required: true
  },
  coverageDetails: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Insurance', insuranceSchema); 
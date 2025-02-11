const mongoose = require('mongoose');

const insuranceClaimSchema = new mongoose.Schema({
  userInsuranceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Insurance'
  },
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
  incidentDate: Date,
  claimAmount: Number,
  claimReason: String,
  claimStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'paid']
  },
  claimDate: Date,
  settlementDate: Date,
  documents: [{
    docName: String,
    filePath: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('InsuranceClaim', insuranceClaimSchema); 
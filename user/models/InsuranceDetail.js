const mongoose = require('mongoose');

const insuranceDetailSchema = new mongoose.Schema({
  insuranceType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType'
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  coverageDetails: String,
  premiumRate: Number,
  adminFee: Number,
  tax: Number,
  documents: [{
    docName: String,
    insuranceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Insurance'
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('InsuranceDetail', insuranceDetailSchema); 
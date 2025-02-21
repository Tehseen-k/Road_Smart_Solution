const mongoose = require('mongoose');

const insuranceClaimDocSchema = new mongoose.Schema({
  claimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsuranceClaim'
  },
  docName: String,
  filePath: String
}, { timestamps: true });

module.exports = mongoose.model('InsuranceClaimDoc', insuranceClaimDocSchema); 
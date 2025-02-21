const mongoose = require('mongoose');

const insuranceDocSchema = new mongoose.Schema({
  docName: String,
  insuranceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsuranceDetail'
  }
}, { timestamps: true });

module.exports = mongoose.model('InsuranceDoc', insuranceDocSchema); 
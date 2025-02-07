const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCar'
  },
  insuranceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType'
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  startDate: Date,
  endDate: Date,
  policyNum: {
    type: Number,
    unique: true
  },
  documents: [{
    docName: String,
    filePath: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Insurance', insuranceSchema); 
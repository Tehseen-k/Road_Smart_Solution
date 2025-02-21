const mongoose = require('mongoose');

const userCarServiceHistorySchema = new mongoose.Schema({
  userCarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCar'
  },
  serviceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType'
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  serviceDate: Date,
  mileageAtService: Number,
  cost: Number,
  description: String,
  documents: [{
    docName: String,
    filePath: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('UserCarServiceHistory', userCarServiceHistorySchema); 
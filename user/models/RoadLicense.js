const mongoose = require('mongoose');

const roadLicenseSchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCar'
  },
  licenseDetails: String,
  expiryDate: Date
}, { timestamps: true });

module.exports = mongoose.model('RoadLicense', roadLicenseSchema); 
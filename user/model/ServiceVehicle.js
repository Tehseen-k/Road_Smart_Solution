const mongoose = require('mongoose');

const serviceVehicleSchema = new mongoose.Schema({
  name: String,
  make: String,
  model: String,
  year: String,
  vehicleType: {
    type: String,
    enum: ['Sedan', 'SUV']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceVehicle', serviceVehicleSchema); 
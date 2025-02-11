const mongoose = require('mongoose');

const serviceProductSchema = new mongoose.Schema({
  name: String,
  brand: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vehicleSpecificProducts: [{
    serviceVehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceVehicle'
    },
    quantity: Number,
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider'
    },
    price: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('ServiceProduct', serviceProductSchema); 
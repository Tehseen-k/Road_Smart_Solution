const mongoose = require('mongoose');

const vehicleSpecificProductSchema = new mongoose.Schema({
  serviceVehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceVehicle'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProduct'
  },
  quantity: Number,
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  price: Number
}, { timestamps: true });

module.exports = mongoose.model('VehicleSpecificProduct', vehicleSpecificProductSchema); 
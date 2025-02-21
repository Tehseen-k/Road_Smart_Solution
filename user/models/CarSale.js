const mongoose = require('mongoose');

const carSaleSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarSeller',
    required: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  vin: {
    type: String,
    unique: true,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  mileage: Number,
  description: String,
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CarSale', carSaleSchema); 
const mongoose = require('mongoose');

const carSaleSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  make: String,
  model: String,
  year: Number,
  vin: {
    type: String,
    unique: true
  },
  price: Number,
  mileage: Number,
  description: String,
  status: {
    type: String,
    enum: ['available', 'sold']
  }
}, { timestamps: true });

module.exports = mongoose.model('CarSale', carSaleSchema); 
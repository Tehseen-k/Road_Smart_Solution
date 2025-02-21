const mongoose = require('mongoose');

const carForSaleSchema = new mongoose.Schema({
  sale_id: {
    type: Number,
    required: true,
    unique: true
  },
  seller_id: {
    type: Number,
    required: true
  },
  make: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  vin: {
    type: String,
    unique: true,
    trim: true
  },
  price: {
    type: Number
  },
  mileage: {
    type: Number
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Indexes
carForSaleSchema.index({ sale_id: 1 });
carForSaleSchema.index({ seller_id: 1 });
carForSaleSchema.index({ vin: 1 });

const CarForSale = mongoose.model('CarForSale', carForSaleSchema);

module.exports = CarForSale; 
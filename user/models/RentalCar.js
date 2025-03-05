const mongoose = require('mongoose');

const rentalCarSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  vin: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  availability: {
    type: String,
    required: true,
    enum: ['available', 'rented', 'maintenance'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Index for faster queries
rentalCarSchema.index({ providerId: 1, availability: 1 });
rentalCarSchema.index({ vin: 1 }, { unique: true });

// Middleware to validate VIN format before saving
rentalCarSchema.pre('save', function(next) {
  // Basic VIN validation (17 characters alphanumeric)
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(this.vin)) {
    next(new Error('Invalid VIN format'));
  }
  next();
});

module.exports = mongoose.model('RentalCar', rentalCarSchema); 
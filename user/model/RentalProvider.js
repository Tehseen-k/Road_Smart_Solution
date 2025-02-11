const mongoose = require('mongoose');

const rentalProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  businessName: String,
  contactInfo: String,
  address: String,
  cars: [{
    make: String,
    model: String,
    year: Number,
    vin: {
      type: String,
      unique: true
    },
    dailyRate: Number,
    availability: {
      type: String,
      enum: ['available', 'rented', 'maintenance']
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('RentalProvider', rentalProviderSchema); 
const mongoose = require('mongoose');

const rentalBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalProvider'
  },
  startDate: Date,
  endDate: Date,
  totalCost: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed']
  }
}, { timestamps: true });

module.exports = mongoose.model('RentalBooking', rentalBookingSchema); 
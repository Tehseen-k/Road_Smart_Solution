const mongoose = require('mongoose');

const serviceConfirmationSchema = new mongoose.Schema({
  estimateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appointmentDate: Date,
  paymentMethod: String,
  transactionId: {
    type: String,
    unique: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded']
  },
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'cancelled']
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceConfirmation', serviceConfirmationSchema); 
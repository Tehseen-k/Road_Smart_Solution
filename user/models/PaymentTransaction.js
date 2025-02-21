const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: Number,
  transactionType: {
    type: String,
    enum: ['service', 'insurance', 'parts', 'rental']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['ServiceConfirmation', 'UserInsurance', 'CarPartOrder', 'RentalBooking']
  },
  paymentMethod: String,
  transactionId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded']
  },
  paymentDate: Date
}, { timestamps: true });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema); 
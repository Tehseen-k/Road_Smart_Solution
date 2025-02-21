const mongoose = require('mongoose');

const carPartOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarPartsSeller'
  },
  totalPrice: Number,
  orderDate: Date,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  }
}, { timestamps: true });

module.exports = mongoose.model('CarPartOrder', carPartOrderSchema); 
// models/CarPartOrder.js
const mongoose = require('mongoose');

const carPartOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalPrice: Number,
  orderDate: Date,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  },
  items: [{
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarPart'
    },
    quantity: Number,
    price: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('CarPartOrder', carPartOrderSchema);
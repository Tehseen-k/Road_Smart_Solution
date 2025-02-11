const mongoose = require('mongoose');

const carPartSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: String,
  brand: String,
  category: String,
  compatibility: String,
  price: Number,
  stockQuantity: Number,
  status: {
    type: String,
    enum: ['available', 'out_of_stock']
  }
}, { timestamps: true });

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

module.exports = {
  CarPart: mongoose.model('CarPart', carPartSchema),
  CarPartOrder: mongoose.model('CarPartOrder', carPartOrderSchema)
}; 
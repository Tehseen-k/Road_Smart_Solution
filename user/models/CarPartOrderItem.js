const mongoose = require('mongoose');

const carPartOrderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarPartOrder'
  },
  partId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarPart'
  },
  quantity: Number,
  price: Number
}, { timestamps: true });

module.exports = mongoose.model('CarPartOrderItem', carPartOrderItemSchema); 
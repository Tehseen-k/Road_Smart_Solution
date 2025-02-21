const mongoose = require('mongoose');

const carPurchaseSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarSale'
  },
  purchaseDate: Date,
  price: Number,
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled']
  }
}, { timestamps: true });

module.exports = mongoose.model('CarPurchase', carPurchaseSchema); 
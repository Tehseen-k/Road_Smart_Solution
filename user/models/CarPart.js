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

const CarPart = mongoose.model('CarPart', carPartSchema);

module.exports = CarPart; 
const mongoose = require('mongoose');

const carPartsSellerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  businessName: String,
  address: String
}, { timestamps: true });

module.exports = mongoose.model('CarPartsSeller', carPartsSellerSchema); 
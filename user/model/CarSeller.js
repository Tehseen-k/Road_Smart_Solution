const mongoose = require('mongoose');

const carSellerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  businessName: String,
  contactInfo: String,
  address: String
}, { timestamps: true });

module.exports = mongoose.model('CarSeller', carSellerSchema); 
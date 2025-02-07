const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  providerName: String,
  contactInfo: String,
  address: String,
  about: String,
  ratings: String,
  services: [{
    serviceType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceType'
    },
    price: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema); 
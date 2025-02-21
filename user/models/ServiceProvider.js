const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerName: {
    type: String,
    required: true
  },
  contactInfo: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
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
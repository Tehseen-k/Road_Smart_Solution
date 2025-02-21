const mongoose = require('mongoose');

const providerServiceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  serviceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType'
  },
  price: Number
}, { timestamps: true });

module.exports = mongoose.model('ProviderService', providerServiceSchema); 
const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceVehicle'
  },
  serviceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType'
  },
  status: {
    type: String,
    enum: ['pending', 'quoted', 'confirmed', 'cancelled']
  },
  estimates: [{
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider'
    },
    estimatedPrice: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected']
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema); 
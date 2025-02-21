const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceVehicle',
    required: true
  },
  serviceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'quoted', 'confirmed', 'cancelled'],
    required: true,
    default: 'pending'
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
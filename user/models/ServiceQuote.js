const mongoose = require('mongoose');

const serviceQuoteSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  estimatedTime: {
    type: String,
    required: true
  },
  materials: [{
    name: String,
    quantity: Number,
    cost: Number
  }],
  laborCost: {
    type: Number,
    required: true,
    min: 0
  },
  attachments: [{
    type: String // File paths
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  remarks: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
serviceQuoteSchema.index({ requestId: 1, providerId: 1 }, { unique: true });
serviceQuoteSchema.index({ status: 1 });
serviceQuoteSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
serviceQuoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ServiceQuote = mongoose.model('ServiceQuote', serviceQuoteSchema);

module.exports = ServiceQuote;
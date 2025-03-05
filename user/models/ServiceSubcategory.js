const mongoose = require('mongoose');

const serviceSubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: [true, 'Category ID is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for service types in this subcategory
serviceSubcategorySchema.virtual('serviceTypes', {
  ref: 'ServiceType',
  localField: '_id',
  foreignField: 'subcategoryId'
});

// Index for faster queries
serviceSubcategorySchema.index({ categoryId: 1 });
serviceSubcategorySchema.index({ name: 'text' });

module.exports = mongoose.model('ServiceSubcategory', serviceSubcategorySchema); 
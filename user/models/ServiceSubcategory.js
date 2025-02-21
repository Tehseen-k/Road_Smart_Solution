const mongoose = require('mongoose');

const serviceSubcategorySchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  },
  subcategoryName: String
}, { timestamps: true });

module.exports = mongoose.model('ServiceSubcategory', serviceSubcategorySchema); 
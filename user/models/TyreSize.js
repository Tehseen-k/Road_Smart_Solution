const mongoose = require('mongoose');

const tyreSizeSchema = new mongoose.Schema({
  tireDetails: String,
  width: Number,
  ratio: Number,
  diameter: Number,
  oemStandardSize: String
}, { timestamps: true });

module.exports = mongoose.model('TyreSize', tyreSizeSchema); 
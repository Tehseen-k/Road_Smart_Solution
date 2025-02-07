const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  address: String,
  role: {
    type: String,
    enum: ['user', 'service_provider', 'seller']
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 
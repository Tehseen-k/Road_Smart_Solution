const mongoose = require('mongoose');

const userCarDocSchema = new mongoose.Schema({
  userCarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCar'
  },
  docName: String,
  filePath: String
}, { timestamps: true });

module.exports = mongoose.model('UserCarDoc', userCarDocSchema); 
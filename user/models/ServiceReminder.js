const mongoose = require('mongoose');

const serviceReminderSchema = new mongoose.Schema({
  serviceName: String,
  serviceDate: Date,
  milageServiceReq: Number,
  repairs: String,
  userCarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCar'
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceReminder', serviceReminderSchema); 
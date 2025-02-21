const mongoose = require('mongoose');

const userCarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carName: String,
  carMake: {
    type: String,
    required: true
  },
  carModel: {
    type: String,
    required: true
  },
  carYear: Number,
  trim: String,
  engine: String,
  cylinders: Number,
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric'],
    required: true
  },
  driveType: {
    type: String,
    enum: ['AWD', 'FWD', 'RWD'],
    required: true
  },
  bodyType: {
    type: String,
    enum: ['sedan', 'suv', 'hatchback', 'etc'],
    required: true
  },
  estimatedValue: Number,
  odometer: Number,
  vin: {
    type: String,
    unique: true
  },
  registrationNum: {
    type: String,
    maxLength: 50
  },
  country: String,
  documents: [{
    docName: String,
    filePath: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('UserCar', userCarSchema); 
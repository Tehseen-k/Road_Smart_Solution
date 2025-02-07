const mongoose = require('mongoose');

const userCarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  carName: String,
  carMake: String,
  carModel: String,
  carYear: Number,
  trim: String,
  engine: String,
  cylinders: Number,
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric']
  },
  driveType: {
    type: String,
    enum: ['AWD', 'FWD', 'RWD']
  },
  bodyType: {
    type: String,
    enum: ['sedan', 'suv', 'hatchback']
  },
  estimatedValue: Number,
  odometer: Number,
  vin: String,
  registrationNum: String,
  country: String,
  documents: [{
    docName: String,
    filePath: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('UserCar', userCarSchema); 
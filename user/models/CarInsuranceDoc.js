const mongoose = require('mongoose');

const carInsuranceDocSchema = new mongoose.Schema({
  docName: String,
  insuranceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Insurance'
  },
  filePath: String
}, { timestamps: true });

module.exports = mongoose.model('CarInsuranceDoc', carInsuranceDocSchema); 
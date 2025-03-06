const ServiceVehicle = require('../models/ServiceVehicle');

// Get all service vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await ServiceVehicle.find().populate('createdBy', 'name email');
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await ServiceVehicle.findById(req.params.id).populate('createdBy', 'name email');
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await ServiceVehicle.create({
      ...req.body,
      createdBy: req.user._id // Assuming you have user authentication middleware
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await ServiceVehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await ServiceVehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 
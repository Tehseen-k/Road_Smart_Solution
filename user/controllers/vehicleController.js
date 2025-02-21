const Vehicle = require('../models/Vehicle');
const ServiceRequest = require('../models/ServiceRequest');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const vehicleController = {
  createVehicle: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const vehicle = new Vehicle({
      userId: req.body.userId,
      make: req.body.make,
      model: req.body.model,
      year: req.body.year,
      licensePlate: req.body.licensePlate,
      vin: req.body.vin,
      color: req.body.color,
      mileage: req.body.mileage,
      fuelType: req.body.fuelType,
      transmission: req.body.transmission
    });

    if (req.files && req.files.length > 0) {
      const images = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/vehicle-images')
      ));
      vehicle.images = images;
    }

    await vehicle.save();

    const response = new ResponseHandler(res);
    return response.created(vehicle);
  }),

  getUserVehicles: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const vehicles = await Vehicle.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments({ userId });

    const response = new ResponseHandler(res);
    return response.success({
      vehicles,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getVehicleById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid vehicle ID');
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    const serviceHistory = await ServiceRequest.find({ vehicleId: id })
      .select('serviceType status completedAt totalCost description')
      .populate('serviceType', 'name')
      .sort({ createdAt: -1 });

    const response = new ResponseHandler(res);
    return response.success({
      vehicle,
      serviceHistory
    });
  }),

  updateVehicle: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid vehicle ID');
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/vehicle-images')
      ));
      req.body.images = [...(vehicle.images || []), ...newImages];
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    const response = new ResponseHandler(res);
    return response.success(updatedVehicle);
  }),

  deleteVehicle: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid vehicle ID');
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    const activeServices = await ServiceRequest.countDocuments({
      vehicleId: id,
      status: { $in: ['pending', 'in_progress'] }
    });

    if (activeServices > 0) {
      throw new ApiError(400, 'Cannot delete vehicle with active service requests');
    }

    if (vehicle.images && vehicle.images.length > 0) {
      await Promise.all(vehicle.images.map(image => 
        fileHandler.deleteFile(image)
      ));
    }

    await vehicle.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  updateMileage: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid vehicle ID');
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    if (req.body.mileage <= vehicle.mileage) {
      throw new ApiError(400, 'New mileage must be greater than current mileage');
    }

    vehicle.mileageHistory.push({
      value: req.body.mileage,
      date: Date.now()
    });

    vehicle.mileage = req.body.mileage;
    await vehicle.save();

    const response = new ResponseHandler(res);
    return response.success(vehicle);
  }),

  removeVehicleImage: catchAsync(async (req, res) => {
    const { id, imageIndex } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid vehicle ID');
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    if (!vehicle.images || !vehicle.images[imageIndex]) {
      throw new ApiError(404, 'Image not found');
    }

    await fileHandler.deleteFile(vehicle.images[imageIndex]);
    vehicle.images.splice(imageIndex, 1);
    await vehicle.save();

    const response = new ResponseHandler(res);
    return response.success(vehicle);
  }),

  searchVehicles: catchAsync(async (req, res) => {
    const { make, model, year, userId } = req.query;
    const query = {};

    if (userId && validationHelper.isValidId(userId)) {
      query.userId = userId;
    }

    if (make) query.make = new RegExp(make, 'i');
    if (model) query.model = new RegExp(model, 'i');
    if (year) query.year = year;

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const vehicles = await Vehicle.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      vehicles,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  })
};

module.exports = vehicleController; 